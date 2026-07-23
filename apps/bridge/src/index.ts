/**
 * Elsewhere Telephone Company — bridge server.
 *
 * Twilio number -> POST /incoming-call -> TwiML <Connect><Stream> ->
 * wss /media-stream (back to this same process) -> OpenAI Realtime session.
 *
 * Always-on Bun process on Railway. Holds long-lived WebSockets —
 * do NOT move this to serverless.
 */
import { env, assertRequiredEnv } from "./env";
import { connectStreamTwiml } from "./twiml";
import { CallSession, type TwilioSocketData } from "./session";
import { personas } from "@elsewhere/personas";
import {
  insertSignup,
  recordTeaserCall,
  setTeaserOutcome,
  setTeaserCallDetail,
  teaserStats,
} from "./db";
import { join } from "node:path";

assertRequiredEnv();

function personaForNumber(to: string): string {
  return env.personaNumberMap[to] ?? env.defaultPersona;
}

function twiml(body: string): Response {
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<Response>${body}\n</Response>`,
    { headers: { "Content-Type": "text/xml" } },
  );
}

const server = Bun.serve<TwilioSocketData>({
  port: env.port,
  async fetch(req, srv) {
    const url = new URL(req.url);

    // Twilio Media Stream connects here (wss URL from the TwiML below).
    if (url.pathname === "/media-stream") {
      const ok = srv.upgrade(req, { data: {} satisfies TwilioSocketData });
      return ok ? undefined : new Response("Expected WebSocket upgrade", { status: 400 });
    }

    // Twilio voice webhook. TODO before public launch: validate
    // X-Twilio-Signature with TWILIO_AUTH_TOKEN.
    if (url.pathname === "/incoming-call" && req.method === "POST") {
      const form = await req.formData();
      const from = String(form.get("From") ?? "unknown");
      const to = String(form.get("To") ?? "unknown");
      const callSid = String(form.get("CallSid") ?? "");
      const persona = personaForNumber(to);
      const host =
        env.publicHost ||
        req.headers.get("x-forwarded-host") ||
        req.headers.get("host") ||
        url.host;

      console.log(`[webhook] incoming call to=${to} from=${from} -> persona=${persona}`);
      return new Response(connectStreamTwiml({ host, persona, from, to, callSid }), {
        headers: { "Content-Type": "text/xml" },
      });
    }

    // ---- Stage T: the teaser line (806) 666-1212 ----
    // Pure pre-recorded TwiML: zero AI cost. See docs/mvp-2-plan.md Stage T.
    if (url.pathname === "/teaser" && req.method === "POST") {
      const host = env.publicHost || req.headers.get("host") || url.host;
      const form = await req.formData();
      const from = String(form.get("From") ?? "unknown");
      const callSid = String(form.get("CallSid") ?? "");
      console.log(`[teaser] incoming call from=${from}`);
      void recordTeaserCall(callSid, from);
      // teaser.mp3 is the full produced master: ringback + real-phone pickup
      // + operator VO over the living-switchboard bed, already telephone-
      // mastered. Plays inside <Gather> so "press one at any time" barges in.
      return twiml(`
  <Gather numDigits="1" action="/teaser-key" method="POST" timeout="4">
    <Play>https://${host}/audio/teaser.mp3</Play>
  </Gather>
  <Play>https://${host}/audio/teaser-goodbye.mp3</Play>`);
    }

    if (url.pathname === "/teaser-key" && req.method === "POST") {
      const form = await req.formData();
      const digit = String(form.get("Digits") ?? "");
      const from = String(form.get("From") ?? "unknown");
      const callSid = String(form.get("CallSid") ?? "");
      const host = env.publicHost || req.headers.get("host") || url.host;
      if (digit === "1") {
        void insertSignup(from);
        void setTeaserOutcome(callSid, "signup");
        return twiml(`\n  <Play>https://${host}/audio/teaser-confirm.mp3</Play>`);
      }
      console.log(`[teaser] non-1 digit: ${digit}`);
      void setTeaserOutcome(callSid, "other-key");
      return twiml(`\n  <Play>https://${host}/audio/teaser-goodbye.mp3</Play>`);
    }

    // Pre-recorded audio assets (teaser VO, future overworld clips).
    if (url.pathname.startsWith("/audio/")) {
      const name = url.pathname.slice("/audio/".length);
      if (!/^[\w-]+\.mp3$/.test(name)) return new Response("Not found", { status: 404 });
      const file = Bun.file(join(import.meta.dir, "..", "assets", "audio", name));
      if (!(await file.exists())) return new Response("Not found", { status: 404 });
      return new Response(file, { headers: { "Content-Type": "audio/mpeg" } });
    }

    if (url.pathname === "/health") {
      return Response.json({ ok: true, personas: Object.keys(personas) });
    }

    if (url.pathname === "/teaser-stats") {
      return Response.json((await teaserStats()) ?? { error: "logging disabled" });
    }

    // Twilio status callback (call completion) — carries CallDuration.
    if (url.pathname === "/teaser-status" && req.method === "POST") {
      const form = await req.formData();
      const callSid = String(form.get("CallSid") ?? "");
      const duration = Number(form.get("CallDuration") ?? 0);
      const status = String(form.get("CallStatus") ?? "");
      console.log(`[teaser] call ${callSid} ${status} duration=${duration}s`);
      void setTeaserCallDetail(callSid, duration, status);
      return new Response("", { status: 204 });
    }

    // Landing page + its static assets (served from apps/web).
    const webDir = join(import.meta.dir, "..", "..", "web");
    if (url.pathname === "/" || url.pathname === "/index.html") {
      return new Response(Bun.file(join(webDir, "index.html")), {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }
    // favicon.svg/.ico/.png, apple-touch-icon.png — allowlisted static files.
    const staticAsset = url.pathname.slice(1);
    if (/^(favicon(-16|-32)?\.(svg|png|ico)|apple-touch-icon\.png|logo-seal\.svg)$/.test(staticAsset)) {
      const file = Bun.file(join(webDir, staticAsset));
      if (await file.exists()) {
        const ext = staticAsset.split(".").pop()!;
        const ct = ext === "svg" ? "image/svg+xml" : ext === "ico" ? "image/x-icon" : "image/png";
        return new Response(file, { headers: { "Content-Type": ct } });
      }
    }

    return new Response("Not found", { status: 404 });
  },

  websocket: {
    open(_ws) {
      // Session is created on Twilio's "start" event, which carries the
      // streamSid and our custom <Parameter>s (persona/from/to).
    },
    message(ws, message) {
      const raw = typeof message === "string" ? message : message.toString();
      if (ws.data.session) {
        ws.data.session.handleTwilioMessage(raw);
        return;
      }
      // First meaningful frame: {"event":"connected"} then {"event":"start"}.
      try {
        const msg = JSON.parse(raw);
        if (msg.event === "start") {
          const p = msg.start?.customParameters ?? {};
          ws.data.session = new CallSession(ws, {
            streamSid: msg.start.streamSid,
            persona: p.persona ?? env.defaultPersona,
            from: p.from ?? "unknown",
            to: p.to ?? "unknown",
            callSid: p.callSid ?? "",
          });
        }
      } catch (err) {
        console.error("[ws] failed to handle pre-session frame:", err);
      }
    },
    close(ws) {
      ws.data.session?.close("twilio-ws-closed");
    },
  },
});

console.log(
  `[bridge] Elsewhere Telephone Co. switching office up on :${server.port} ` +
    `(model=${env.model}, personas: ${Object.keys(personas).join(", ")})`,
);
