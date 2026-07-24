/**
 * Relay logic extracted from session.ts so the tricky parts are testable
 * without sockets. The star here is the F29 barge-in tracker: an interruption
 * in the *tail* of a reply (after response.done, while Twilio is still playing
 * buffered audio) must still truncate + clear — the exact case the old code
 * dropped, which let the persona talk over the caller.
 */
import { describe, test, expect } from "bun:test";
import { PlaybackTracker, estimateAudioCost } from "../../apps/bridge/src/relay";

describe("estimateAudioCost", () => {
  test("prices mini audio (with cache discount) correctly", () => {
    const cost = estimateAudioCost(
      { audioTokensIn: 1000, cachedAudioTokensIn: 200, audioTokensOut: 3000 },
      "gpt-realtime-mini",
    );
    // (1000-200)*10/1e6 + 200*0.3/1e6 + 3000*20/1e6
    expect(cost).toBeCloseTo(0.06806, 6);
  });

  test("a non-mini model is billed at the higher flagship rate", () => {
    const args = { audioTokensIn: 1000, cachedAudioTokensIn: 0, audioTokensOut: 1000 } as const;
    expect(estimateAudioCost(args, "gpt-realtime-2")).toBeGreaterThan(
      estimateAudioCost(args, "gpt-realtime-mini"),
    );
  });
});

describe("PlaybackTracker — barge-in (F29)", () => {
  test("no barge-in when nothing is playing", () => {
    const p = new PlaybackTracker();
    expect(p.playing).toBe(false);
    expect(p.onSpeechStarted(1000)).toBeNull();
  });

  test("barge-in mid-playback truncates to what was heard", () => {
    const p = new PlaybackTracker();
    p.onAudioDelta("item_A", 1000); // response starts at heard=1000
    p.onAudioDelta("item_A", 1020);
    const b = p.onSpeechStarted(1100);
    expect(b).not.toBeNull();
    expect(b?.truncateItemId).toBe("item_A");
    expect(b?.audioEndMs).toBe(100); // 1100 - 1000
  });

  test("THE FIX: barge-in still fires in the tail AFTER response.done", () => {
    const p = new PlaybackTracker();
    p.onAudioDelta("item_A", 1000);
    p.onAudioDelta("item_A", 1020);
    p.onResponseDone(); // OpenAI done sending — but Twilio is still draining
    expect(p.playing).toBe(true); // marks still outstanding
    const b = p.onSpeechStarted(1100);
    expect(b).not.toBeNull(); // <- old code returned null here, talking over the caller
    expect(b?.audioEndMs).toBe(100);
  });

  test("no barge-in once the buffer has fully drained (turn truly over)", () => {
    const p = new PlaybackTracker();
    p.onAudioDelta("item_A", 1000);
    p.onResponseDone();
    p.onMark(); // last chunk finished playing
    expect(p.playing).toBe(false);
    expect(p.onSpeechStarted(2000)).toBeNull();
  });

  test("a mid-response mark does not reset the response start (heard math stays correct)", () => {
    const p = new PlaybackTracker();
    p.onAudioDelta("item_A", 1000);
    p.onMark(); // outstanding hits 0 but response is still in progress...
    p.onAudioDelta("item_A", 1010); // ...more of the SAME response arrives
    const b = p.onSpeechStarted(1050);
    expect(b?.audioEndMs).toBe(50); // measured from 1000, not reset to 1010
  });

  test("audioEndMs never goes negative", () => {
    const p = new PlaybackTracker();
    p.onAudioDelta("item_A", 5000);
    const b = p.onSpeechStarted(4000); // clock went backwards
    expect(b?.audioEndMs).toBe(0);
  });
});
