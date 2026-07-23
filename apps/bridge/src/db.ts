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
  },
): Promise<void> {
  if (!client) return;
  const { error } = await client.from("calls").update(patch).eq("id", id);
  if (error) console.error("[db] finalizeCall failed:", error.message);
}
