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

assertRequiredEnv();

function personaForNumber(to: string): string {
  return env.personaNumberMap[to] ?? env.defaultPersona;
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

    if (url.pathname === "/health") {
      return Response.json({ ok: true, personas: Object.keys(personas) });
    }

    // Deadpan status page. The company never acknowledges anything is unusual.
    return new Response(
      [
        "ELSEWHERE TELEPHONE COMPANY",
        "Switching office: operational.",
        "All lines are monitored for quality by the management.",
        "",
        "Please limit calls to five minutes. Other customers are waiting.",
      ].join("\n"),
      { headers: { "Content-Type": "text/plain" } },
    );
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
