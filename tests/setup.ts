/**
 * Test preload (bunfig.toml). Forces a deterministic environment BEFORE any
 * module reads process.env at import time. We assign (not `||=`) so the repo's
 * real .env — which Bun auto-loads — cannot leak real secrets or a different
 * TWILIO_AUTH_TOKEN into the suite.
 *
 * TWILIO_AUTH_TOKEN is "12345" on purpose — it's the token in Twilio's own
 * published request-signature test vector, so tests/unit/twilio-auth.test.ts
 * can assert against the canonical expected signature.
 */
process.env.OPENAI_API_KEY = "test-openai-key";
process.env.TWILIO_ACCOUNT_SID = "ACtest";
process.env.TWILIO_AUTH_TOKEN = "12345";
process.env.TWILIO_VALIDATE = "true";

process.env.MAX_CONCURRENT_CALLS = "2";
process.env.MAX_CALLS_PER_DAY = "5";
process.env.MAX_CALLS_PER_CALLER = "2";
process.env.CALLER_WINDOW_MS = "900000";

// No Supabase in unit tests — db.ts degrades to console-only.
process.env.SUPABASE_URL = "";
process.env.SUPABASE_SECRET_KEY = "";
