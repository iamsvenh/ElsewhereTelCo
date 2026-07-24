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

/** Runtime persona overrides (docs/engineering/architecture.md §4). All fields nullable. */
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
  if (!client) {
    return null;
  }
  try {
    const { data, error } = await client
      .from("persona_config")
      .select("model, voice, voice_direction, system_prompt, cold_opener")
      .eq("persona", persona)
      .abortSignal(AbortSignal.timeout(1_500))
      .maybeSingle();
    if (error) {
      throw new Error(error.message);
    }
    overrideCache.set(persona, data);
    return data;
  } catch (err) {
    console.warn(`[config] fetch failed for ${persona} (${err}); using last-good/defaults`);
    return overrideCache.get(persona) ?? null;
  }
}

/** Teaser-line press-1: add a number to the subscriber ledger (idempotent). */
export async function insertSignup(number: string): Promise<void> {
  if (!client) {
    return;
  }
  const { error } = await client
    .from("signups")
    .upsert({ number }, { onConflict: "number", ignoreDuplicates: true });
  if (error) {
    console.error("[db] insertSignup failed:", error.message);
  } else {
    console.log(`[signup] ${number} entered in the subscriber ledger`);
  }
}

/** Log a teaser-line call at pickup (before we know the outcome). */
export async function recordTeaserCall(callSid: string, from: string): Promise<void> {
  if (!client || !callSid) {
    return;
  }
  const { error } = await client
    .from("teaser_calls")
    .upsert(
      { call_sid: callSid, caller_number: from },
      { onConflict: "call_sid", ignoreDuplicates: true },
    );
  if (error) {
    console.error("[db] recordTeaserCall failed:", error.message);
  }
}

/**
 * Set the outcome once the caller presses a key. Upsert (not update) so the
 * outcome is recorded even if the pickup insert (recordTeaserCall) failed or
 * raced — otherwise a real press-1 could leave outcome blank. Passing `from`
 * backfills caller_number when the upsert has to create the row.
 */
export async function setTeaserOutcome(
  callSid: string,
  outcome: string,
  from?: string,
): Promise<void> {
  if (!client || !callSid) {
    return;
  }
  const row: Record<string, string> = { call_sid: callSid, outcome };
  if (from) {
    row.caller_number = from;
  }
  const { error } = await client.from("teaser_calls").upsert(row, { onConflict: "call_sid" });
  if (error) {
    console.error("[db] setTeaserOutcome failed:", error.message);
  }
}

/** Record call duration + final status from Twilio's status callback. */
export async function setTeaserCallDetail(
  callSid: string,
  durationS: number,
  status: string,
): Promise<void> {
  if (!client || !callSid) {
    return;
  }
  // Row may not exist yet if the status callback races the /teaser hit; upsert.
  const { error } = await client
    .from("teaser_calls")
    .upsert(
      { call_sid: callSid, duration_s: durationS, call_status: status },
      { onConflict: "call_sid" },
    );
  if (error) {
    console.error("[db] setTeaserCallDetail failed:", error.message);
  }
}

/** Quick funnel + engagement overview for the teaser line. */
export async function teaserStats(): Promise<Record<string, unknown> | null> {
  if (!client) {
    return null;
  }
  const { data, error } = await client
    .from("teaser_calls")
    .select("outcome, caller_number, duration_s, created_at");
  if (error) {
    console.error("[db] teaserStats failed:", error.message);
    return { error: error.message };
  }
  const total = data.length;
  const signups = data.filter((r) => r.outcome === "signup").length;
  const durations = data.map((r) => r.duration_s).filter((d): d is number => d != null);
  const avgDuration = durations.length
    ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
    : null;

  // Repeat callers: numbers that appear more than once.
  const byCaller = new Map<string, number>();
  for (const r of data) {
    const n = r.caller_number ?? "unknown";
    byCaller.set(n, (byCaller.get(n) ?? 0) + 1);
  }
  const uniqueCallers = byCaller.size;
  const repeatCallers = [...byCaller.values()].filter((c) => c > 1).length;

  return {
    total_calls: total,
    unique_callers: uniqueCallers,
    repeat_callers: repeatCallers,
    signups,
    other_key: data.filter((r) => r.outcome === "other-key").length,
    no_press: data.filter((r) => r.outcome == null).length,
    conversion_pct: total ? Math.round((signups / total) * 100) : 0,
    avg_duration_s: avgDuration,
  };
}

export async function insertCall(row: {
  called_number: string;
  caller_number: string;
  persona: string;
  call_sid: string | null;
}): Promise<string | null> {
  if (!client) {
    return null;
  }
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
  if (!client) {
    return;
  }
  const { error } = await client.from("calls").update(patch).eq("id", id);
  if (error) {
    console.error("[db] finalizeCall failed:", error.message);
  }
}
