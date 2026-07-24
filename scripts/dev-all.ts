#!/usr/bin/env bun
/**
 * One-command local dev. Guards against running dev against prod Supabase,
 * verifies local Supabase is up, then boots the bridge with --watch.
 *
 * NOTE (2026-07-24): no tunnel / dev Twilio / dev OpenAI accounts yet
 * (deferred — see docs/engineering/dev-workflow.md). So this covers LOCAL
 * Supabase + the web pages + HTTP logic + the automated suite; live inbound
 * phone calls are validated against PRODUCTION after deploy, not locally.
 */
import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dir, "..");

// GUARD: never run dev against a remote DB. Bun has already loaded .env.local
// into process.env by the time this runs (and it wins over .env).
if (!existsSync(join(ROOT, ".env.local"))) {
  console.error("✗ No .env.local. Copy .env.example → .env.local and set LOCAL values first.");
  process.exit(1);
}
const supabaseUrl = process.env.SUPABASE_URL ?? "";
if (!/127\.0\.0\.1|localhost/.test(supabaseUrl)) {
  console.error(
    `✗ SUPABASE_URL is not local ("${supabaseUrl}"). Refusing to run dev against a remote DB.\n` +
      "  It must be the 127.0.0.1 URL from `supabase status`.",
  );
  process.exit(1);
}

// Local Supabase up?
if (spawnSync("supabase", ["status"], { cwd: ROOT, stdio: "ignore" }).status !== 0) {
  console.error("✗ Local Supabase isn't running. Run `supabase start` (needs Docker), then retry.");
  process.exit(1);
}
console.log("✓ Local Supabase is up. Booting bridge on http://localhost:8080 …");

const bridge = spawn("bun", ["run", "--watch", "apps/bridge/src/index.ts"], {
  cwd: ROOT,
  stdio: "inherit",
});
function stop(): void {
  bridge.kill("SIGTERM");
  process.exit(0);
}
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
