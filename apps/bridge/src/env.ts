/** Typed access to bridge configuration. See .env.example at repo root. */

function parseNumberMap(raw: string): Record<string, string> {
  // "+15055551234=devil,+15055555678=operator" -> { "+15055551234": "devil", ... }
  const map: Record<string, string> = {};
  for (const pair of raw.split(",")) {
    const [number, persona] = pair.split("=").map((s) => s.trim());
    if (number && persona) map[number] = persona;
  }
  return map;
}

export const env = {
  port: Number(process.env.PORT ?? 8080),

  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  model: process.env.OPENAI_REALTIME_MODEL ?? "gpt-realtime-mini",
  transcribeModel: process.env.OPENAI_TRANSCRIBE_MODEL ?? "gpt-4o-mini-transcribe",

  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID ?? "",
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN ?? "",

  personaNumberMap: parseNumberMap(process.env.PERSONA_NUMBER_MAP ?? ""),
  defaultPersona: process.env.DEFAULT_PERSONA ?? "devil",

  supabaseUrl: process.env.SUPABASE_URL ?? "",
  // New-style secret key (sb_secret_...). Legacy anon/service_role JWT keys
  // are deprecated and get disabled by Supabase in late 2026 — never use them here.
  supabaseSecretKey: process.env.SUPABASE_SECRET_KEY ?? "",

  publicHost: process.env.PUBLIC_HOST ?? "",

  // Dual-channel Twilio call recording for persona/voice analysis.
  // RATIFIED ON for the seed phase (2026-07-24) — supersedes concept.md §8
  // "default off" while callers are all personally-invited testers and
  // recordings are used only internally to verify the system works.
  // This ratification EXPIRES at the first of: a caller not on the seed list,
  // the community/Artizen post, unsolicited press, payment, or hardware in a
  // venue. Before that trigger, ship the TwiML "recorded" pre-roll so notice
  // precedes capture (RECORD_CALLS=false is NOT the fix — the live transcript
  // + audio relay to OpenAI are the interception surface). See tracker A + the
  // 2026-07-24 review adjudication addendum.
  recordCalls: process.env.RECORD_CALLS === "true",
};

export function assertRequiredEnv(): void {
  if (!env.openaiApiKey) {
    console.error("FATAL: OPENAI_API_KEY is not set. Copy .env.example to .env first.");
    process.exit(1);
  }
}
