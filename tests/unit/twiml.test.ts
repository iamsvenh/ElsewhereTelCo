/**
 * The <Connect><Stream> TwiML must carry every custom parameter the WS handler
 * reads (persona/from/to/callSid/token) and must XML-escape untrusted values so
 * a crafted caller id can't break out of the attribute.
 */
import { describe, test, expect } from "bun:test";
import { connectStreamTwiml } from "../../apps/bridge/src/twiml";

describe("connectStreamTwiml", () => {
  const xml = connectStreamTwiml({
    host: "bridge.example",
    persona: "devil",
    from: "+15551234567",
    to: "+15557654321",
    callSid: "CAxyz",
    token: "abc123",
  });

  test("points the stream at our /media-stream socket", () => {
    expect(xml).toContain('<Stream url="wss://bridge.example/media-stream">');
  });

  test("includes all custom parameters the start handler reads", () => {
    for (const name of ["persona", "from", "to", "callSid", "token"]) {
      expect(xml).toContain(`name="${name}"`);
    }
    expect(xml).toContain('value="devil"');
    expect(xml).toContain('value="abc123"');
  });

  test("XML-escapes untrusted values (no attribute breakout)", () => {
    const evil = connectStreamTwiml({
      host: "bridge.example",
      persona: "devil",
      from: `"/><Say>pwned</Say>`,
      to: "+1",
      callSid: "CAxyz",
      token: "t",
    });
    expect(evil).not.toContain("<Say>pwned</Say>");
    expect(evil).toContain("&quot;");
  });
});
