/**
 * F5 — request authenticity for the Twilio surfaces.
 *
 * Two mechanisms, both keyed on TWILIO_AUTH_TOKEN (already configured), so this
 * takes effect with no new secrets:
 *
 * 1. HTTP webhooks (/incoming-call, /teaser, /teaser-key, /teaser-status) carry
 *    an X-Twilio-Signature. We recompute it and reject on mismatch. Without this
 *    anyone can forge a `From` and write into the signup callback ledger (a TCPA
 *    shape), or corrupt the funnel stats that gate hardware spend.
 * 2. The /media-stream WebSocket cannot be Twilio-signed, so our TwiML embeds a
 *    token only we can mint (HMAC over the CallSid). The WS "start" handler
 *    checks it before opening a paid Realtime session on our key.
 *
 * Both are disabled when TWILIO_AUTH_TOKEN is unset (local dev) or when
 * TWILIO_VALIDATE=false (a live-line escape hatch for debugging a mismatch).
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "./env";

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

/**
 * Twilio's scheme: base64(HMAC-SHA1(authToken, fullUrl + concat(sortedParams))).
 * POST body params are appended as key+value in key-sorted order; the URL is the
 * exact one Twilio requested (including any query string).
 */
function webhookSignature(fullUrl: string, params: Record<string, string>): string {
  const data = Object.keys(params)
    .sort()
    .reduce((acc, k) => acc + k + params[k], fullUrl);
  return createHmac("sha1", env.twilioAuthToken).update(data, "utf8").digest("base64");
}

/**
 * Behind Railway's proxy the request host can appear under several headers, and
 * the signature is host-exact — so we accept if ANY plausible public URL matches.
 * An attacker cannot produce a valid signature for any of them without the token.
 */
export function isValidTwilioRequest(
  req: Request,
  url: URL,
  params: Record<string, string>,
): boolean {
  if (!env.validateTwilio || !env.twilioAuthToken) {
    return true;
  }
  const sig = req.headers.get("x-twilio-signature");
  if (!sig) {
    return false;
  }
  const hosts = [
    env.publicHost,
    req.headers.get("x-forwarded-host"),
    req.headers.get("host"),
    url.host,
  ].filter((h): h is string => !!h);
  const path = url.pathname + url.search;
  for (const h of new Set(hosts)) {
    if (safeEqual(sig, webhookSignature(`https://${h}${path}`, params))) {
      return true;
    }
  }
  // Diagnostic for a live-line mismatch: the signature is host-exact, so if a
  // real Twilio request 403s, the reconstructed host is the usual culprit —
  // check PUBLIC_HOST matches the console webhook URL (or set TWILIO_VALIDATE=false).
  console.warn(
    `[twilio-auth] signature mismatch on ${path}; hosts tried=[${[...new Set(hosts)].join(", ")}]`,
  );
  return false;
}

/** Token minted into the <Stream> TwiML; only holders of the auth token can forge it. */
export function streamToken(callSid: string): string {
  return createHmac("sha1", env.twilioAuthToken).update(`stream:${callSid}`).digest("hex");
}

export function isValidStreamToken(callSid: string, token: string): boolean {
  if (!env.validateTwilio || !env.twilioAuthToken) {
    return true;
  }
  if (!token) {
    return false;
  }
  return safeEqual(token, streamToken(callSid));
}
