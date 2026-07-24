#!/usr/bin/env bun
/**
 * One-command local dev. In order:
 *   1. GUARD — refuse to run unless SUPABASE_URL is local (127.0.0.1/localhost).
 *      This is the "we've been burned pointing dev at prod" seatbelt.
 *   2. Verify local Supabase is up (`supabase status`) — one-time `supabase
 *      start` is the user's job (needs Docker), so we instruct rather than boot it.
 *   3. If cloudflared is installed, open a quick tunnel, capture its public URL,
 *      and write PUBLIC_HOST into .env.local BEFORE the bridge boots — so the
 *      TwiML <Stream> and <Play> URLs point at the tunnel. Then print the exact
 *      webhook to paste into the DEV Twilio number. (No cloudflared → skip the
 *      tunnel; the bridge still runs for web/logic dev, just no inbound calls.)
 *   4. Boot the bridge with --watch.
 * Ctrl-C stops everything this script spawned.
 *
 * See docs/engineering/dev-workflow.md.
 */
import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dir, "..");
const ENV_LOCAL = join(ROOT, ".env.local");
const spawned: { name: string; child: ChildProcess }[] = [];

function hasBin(bin: string): boolean {
  return spawnSync(bin, ["--version"], { stdio: "ignore" }).status === 0;
}

function readEnvLocal(): Record<string, string> {
  if (!existsSync(ENV_LOCAL)) {
    return {};
  }
  const out: Record<string, string> = {};
  for (const line of readFileSync(ENV_LOCAL, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m?.[1]) {
      out[m[1]] = (m[2] ?? "").replace(/^["']|["']$/g, "");
    }
  }
  return out;
}

function setEnvLocal(key: string, value: string): void {
  const lines = existsSync(ENV_LOCAL) ? readFileSync(ENV_LOCAL, "utf8").split("\n") : [];
  const idx = lines.findIndex((l) => l.startsWith(`${key}=`));
  if (idx >= 0) {
    lines[idx] = `${key}=${value}`;
  } else {
    lines.push(`${key}=${value}`);
  }
  writeFileSync(ENV_LOCAL, lines.filter((l) => l.length > 0).join("\n") + "\n");
}

function pipe(name: string, child: ChildProcess): void {
  const write = (s: NodeJS.WriteStream) => (chunk: Buffer) => {
    for (const line of chunk.toString().split(/\r?\n/)) {
      if (line.length > 0) {
        s.write(`[${name}] ${line}\n`);
      }
    }
  };
  child.stdout?.on("data", write(process.stdout));
  child.stderr?.on("data", write(process.stderr));
}

function shutdown(): void {
  for (const { child } of spawned) {
    child.kill("SIGTERM");
  }
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

// 1. GUARD ------------------------------------------------------------------
const envLocal = readEnvLocal();
const supabaseUrl = process.env.SUPABASE_URL ?? envLocal.SUPABASE_URL ?? "";
const isLocal = /127\.0\.0\.1|localhost/.test(supabaseUrl);
if (!existsSync(ENV_LOCAL)) {
  console.error("✗ No .env.local. Copy .env.example → .env.local and set LOCAL values first.");
  process.exit(1);
}
if (!isLocal) {
  console.error(
    `✗ SUPABASE_URL is not local ("${supabaseUrl}"). Refusing to run dev against a remote DB.\n` +
      "  For local dev it must be the 127.0.0.1 URL from `supabase status`.",
  );
  process.exit(1);
}

// 2. Local Supabase up? -----------------------------------------------------
const status = spawnSync("supabase", ["status"], { cwd: ROOT, encoding: "utf8" });
if (status.status !== 0) {
  console.error(
    "✗ Local Supabase isn't running. Start it once per machine (needs Docker):\n" +
      "    supabase start\n" +
      "  then copy its URL + keys into .env.local.",
  );
  process.exit(1);
}
console.log("✓ Local Supabase is up.");

// 3. Tunnel (optional) ------------------------------------------------------
if (hasBin("cloudflared")) {
  const tunnel = spawn("cloudflared", ["tunnel", "--url", "http://localhost:8080"], { cwd: ROOT });
  spawned.push({ name: "tunnel", child: tunnel });
  const onData = (chunk: Buffer) => {
    const m = chunk.toString().match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
    if (m) {
      const host = m[0].replace("https://", "");
      setEnvLocal("PUBLIC_HOST", host);
      console.log(`\n✓ Tunnel: ${m[0]}`);
      console.log(`  → Set the DEV Twilio number's Voice webhook to: ${m[0]}/incoming-call\n`);
      tunnel.stderr?.off("data", onData);
      tunnel.stdout?.off("data", onData);
      pipe("tunnel", tunnel);
      startBridge();
    }
  };
  tunnel.stdout?.on("data", onData);
  tunnel.stderr?.on("data", onData);
} else {
  console.warn(
    "⚠ cloudflared not installed — skipping the tunnel (inbound Twilio calls won't reach\n" +
      "  local). Install it (`brew install cloudflared`) for end-to-end call testing.",
  );
  startBridge();
}

function startBridge(): void {
  const bridge = spawn("bun", ["run", "--watch", "apps/bridge/src/index.ts"], {
    cwd: ROOT,
    env: { ...process.env },
  });
  spawned.push({ name: "bridge", child: bridge });
  pipe("bridge", bridge);
}
