/**
 * F5 — Twilio request authenticity. The webhook signature must match Twilio's
 * own published test vector (proves the sort/concat/HMAC is exactly their
 * algorithm), forged/missing signatures must be rejected, and the media-stream
 * token must be bound to the CallSid it was minted for.
 *
 * The preload (tests/setup.ts) sets TWILIO_AUTH_TOKEN="12345", the token used
 * in Twilio's documented vector.
 */
import { describe, test, expect } from "bun:test";
import { isValidTwilioRequest, isValidStreamToken, streamToken } from "../../apps/bridge/src/twilio-auth";

// Twilio's published validateRequest vector.
const VECTOR_URL = "https://mycompany.com/myapp.php?foo=1&bar=2";
const VECTOR_PARAMS = {
  Digits: "1234",
  To: "+18005551212",
  From: "+14158675309",
  Caller: "+14158675309",
  CallSid: "CA1234567890ABCDE",
};
const VECTOR_SIG = "RSOYDt4T1cUTdK1PDd93/VVr8B8=";

function reqWithSig(url: string, sig?: string): Request {
  return new Request(url, { headers: sig ? { "x-twilio-signature": sig } : {} });
}

describe("webhook signature (F5)", () => {
  test("accepts a request whose signature matches Twilio's published vector", () => {
    const req = reqWithSig(VECTOR_URL, VECTOR_SIG);
    expect(isValidTwilioRequest(req, new URL(req.url), VECTOR_PARAMS)).toBe(true);
  });

  test("rejects a forged signature", () => {
    const req = reqWithSig(VECTOR_URL, "totally-wrong=");
    expect(isValidTwilioRequest(req, new URL(req.url), VECTOR_PARAMS)).toBe(false);
  });

  test("rejects a request with no signature header", () => {
    const req = reqWithSig(VECTOR_URL);
    expect(isValidTwilioRequest(req, new URL(req.url), VECTOR_PARAMS)).toBe(false);
  });

  test("rejects when a single param is tampered (signature no longer matches)", () => {
    const req = reqWithSig(VECTOR_URL, VECTOR_SIG);
    const tampered = { ...VECTOR_PARAMS, Digits: "9999" };
    expect(isValidTwilioRequest(req, new URL(req.url), tampered)).toBe(false);
  });
});

describe("media-stream token (F5)", () => {
  test("a token round-trips for the CallSid it was minted for", () => {
    const t = streamToken("CA-abc-123");
    expect(isValidStreamToken("CA-abc-123", t)).toBe(true);
  });

  test("a token is bound to its CallSid (not reusable for another call)", () => {
    const t = streamToken("CA-abc-123");
    expect(isValidStreamToken("CA-different", t)).toBe(false);
  });

  test("an empty token is rejected", () => {
    expect(isValidStreamToken("CA-abc-123", "")).toBe(false);
  });
});
