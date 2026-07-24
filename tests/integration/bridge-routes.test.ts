/**
 * Bridge HTTP surface — boots the real server as a subprocess in a scratch cwd
 * (so the repo .env can't leak real secrets in), then asserts the routes that
 * matter for security + disclosure:
 *  - F5: /incoming-call rejects an unsigned request (403) and accepts a
 *    correctly-signed one (200 with a stream token in the TwiML).
 *  - the /legal, /privacy, /terms disclosures page serves.
 *  - unknown routes 404.
 *
 * The server validates the signature against candidate hosts including
 * PUBLIC_HOST, so we sign against https://${PUBLIC_HOST}/incoming-call.
 */
import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { createHmac } from "node:crypto";
import { join } from "node:path";
import { tmpdir } from "node:os";

const PORT = 8791;
const HOST = "test.local";
const TOKEN = "12345";
const BASE = `http://127.0.0.1:${PORT}`;
const entry = join(import.meta.dir, "..", "..", "apps", "bridge", "src", "index.ts");

let proc: ReturnType<typeof Bun.spawn>;

function twilioSignature(fullUrl: string, params: Record<string, string>): string {
  const data = Object.keys(params).sort().reduce((a, k) => a + k + params[k], fullUrl);
  return createHmac("sha1", TOKEN).update(data, "utf8").digest("base64");
}

beforeAll(async () => {
  proc = Bun.spawn(["bun", "run", entry], {
    cwd: tmpdir(), // no .env here -> hermetic
    env: {
      PATH: process.env.PATH ?? "",
      PORT: String(PORT),
      PUBLIC_HOST: HOST,
      OPENAI_API_KEY: "test",
      TWILIO_ACCOUNT_SID: "ACtest",
      TWILIO_AUTH_TOKEN: TOKEN,
      TWILIO_VALIDATE: "true",
      PERSONA_NUMBER_MAP: "",
      RECORD_CALLS: "false",
      SUPABASE_URL: "",
      SUPABASE_SECRET_KEY: "",
    },
    stdout: "pipe",
    stderr: "pipe",
  });
  // wait for health
  for (let i = 0; i < 50; i++) {
    try {
      const r = await fetch(`${BASE}/health`);
      if (r.ok) {return;}
    } catch {}
    await Bun.sleep(100);
  }
  throw new Error("bridge did not come up");
});

afterAll(() => proc?.kill());

describe("static + health", () => {
  test("/health is ok", async () => {
    expect((await fetch(`${BASE}/health`)).status).toBe(200);
  });

  test.each(["/legal", "/privacy", "/terms"])("%s serves the disclosures page", async (p) => {
    const r = await fetch(`${BASE}${p}`);
    expect(r.status).toBe(200);
    expect(await r.text()).toContain("The Fine Print");
  });

  test("an unknown route 404s", async () => {
    expect((await fetch(`${BASE}/nope`)).status).toBe(404);
  });
});

describe("/incoming-call signature enforcement (F5)", () => {
  const params = { From: "+15551230000", To: "+15559990000", CallSid: "CAtest" };
  const body = new URLSearchParams(params).toString();

  test("rejects an unsigned POST with 403", async () => {
    const r = await fetch(`${BASE}/incoming-call`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    expect(r.status).toBe(403);
  });

  test("accepts a correctly-signed POST and returns TwiML with a stream token", async () => {
    const sig = twilioSignature(`https://${HOST}/incoming-call`, params);
    const r = await fetch(`${BASE}/incoming-call`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "X-Twilio-Signature": sig,
      },
      body,
    });
    expect(r.status).toBe(200);
    const xml = await r.text();
    expect(xml).toContain("<Stream");
    expect(xml).toContain('name="token"');
  });
});
