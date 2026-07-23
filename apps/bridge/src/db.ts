/**
 * Supabase call logging. Degrades to console-only when SUPABASE_URL /
 * SUPABASE_SECRET_KEY are unset (local dev before the project exists).
 * Supabase Studio doubles as the transcript-review UI — no dashboard build.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "./env";

export interface TranscriptEntry {
  role: "caller" | "persona";
  text: string;
  /** ms since call start */
  at: number;
}

let client: SupabaseClient | null = null;
if (env.supabaseUrl && env.supabaseSecretKey) {
  // sb_secret_... key: server-side only, bypasses RLS (service_role equivalent
  // in the new key system).
  client = createClient(env.supabaseUrl, env.supabaseSecretKey, {
    auth: { persistSession: false },
  });
  console.log("[db] Supabase logging enabled");
} else {
  console.warn("[db] SUPABASE_URL / SUPABASE_SECRET_KEY not set — call logging disabled");
}

/** Runtime persona overrides (docs/architecture.md §4). All fields nullable. */
export interface PersonaOverride {
  model: string | null;
  voice: string | null;
  voice_direction: string | null;
  system_prompt: string | null;
  cold_opener: string | null;
}

// Last-good cache: a DB blip degrades to the previous override (or code
// defaults), never a dead line.
const overrideCache = new Map<string, PersonaOverride | null>();

export async function fetchPersonaOverride(persona: string): Promise<PersonaOverride | null> {
  if (!client) return null;
  try {
    const { data, error } = await client
      .from("persona_config")
      .select("model, voice, voice_direction, system_prompt, cold_opener")
      .eq("persona", persona)
      .abortSignal(AbortSignal.timeout(1_500))
      .maybeSingle();
    if (error) throw new Error(error.message);
    overrideCache.set(persona, data);
    return data;
  } catch (err) {
    console.warn(`[config] fetch failed for ${persona} (${err}); using last-good/defaults`);
    return overrideCache.get(persona) ?? null;
  }
}

/** Teaser-line press-1: add a number to the subscriber ledger (idempotent). */
export async function insertSignup(number: string): Promise<void> {
  if (!client) return;
  const { error } = await client
    .from("signups")
    .upsert({ number }, { onConflict: "number", ignoreDuplicates: true });
  if (error) console.error("[db] insertSignup failed:", error.message);
  else console.log(`[signup] ${number} entered in the subscriber ledger`);
}

export async function insertCall(row: {
  called_number: string;
  caller_number: string;
  persona: string;
  call_sid: string | null;
}): Promise<string | null> {
  if (!client) return null;
  const { data, error } = await client
    .from("calls")
    .insert({ ...row, started_at: new Date().toISOString() })
    .select("id")
    .single();
  if (error) {
    console.error("[db] insertCall failed:", error.message);
    return null;
  }
  return data.id as string;
}

export async function finalizeCall(
  id: string,
  patch: {
    ended_at: string;
    duration_s: number;
    completed: boolean;
    transcript: TranscriptEntry[];
    tokens_in: number;
    tokens_out: number;
    cached_tokens: number;
    cost_estimate: number;
    recording_sid: string | null;
    model: string;
  },
): Promise<void> {
  if (!client) return;
  const { error } = await client.from("calls").update(patch).eq("id", id);
  if (error) console.error("[db] finalizeCall failed:", error.message);
}
