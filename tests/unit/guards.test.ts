/**
 * F33 — runaway/abuse backstops. The preload caps are intentionally tiny
 * (concurrency 2, daily 5, per-caller 2) so the thresholds are exercised.
 */
import { describe, test, expect, beforeEach } from "bun:test";
import {
  callSlotAvailable,
  acquireCall,
  releaseCall,
  activeCalls,
  admitCall,
  __resetGuardsForTest,
} from "../../apps/bridge/src/guards";

beforeEach(() => __resetGuardsForTest());

describe("concurrency cap", () => {
  test("a slot is available below the cap and gone at it", () => {
    expect(callSlotAvailable()).toBe(true);
    acquireCall();
    acquireCall(); // cap = 2
    expect(callSlotAvailable()).toBe(false);
  });

  test("releasing frees a slot and returns the counter to zero", () => {
    acquireCall();
    acquireCall();
    releaseCall();
    expect(callSlotAvailable()).toBe(true);
    releaseCall();
    expect(activeCalls()).toBe(0);
  });

  test("release never underflows below zero", () => {
    releaseCall();
    releaseCall();
    expect(activeCalls()).toBe(0);
  });
});

describe("per-caller rate limit", () => {
  test("admits up to the per-caller cap, then blocks that caller only", () => {
    expect(admitCall("+1AAA")).toBeNull();
    expect(admitCall("+1AAA")).toBeNull(); // cap = 2
    expect(admitCall("+1AAA")).toBe("caller-rate");
    expect(admitCall("+1BBB")).toBeNull(); // a different caller is unaffected
  });
});

describe("daily volume cap", () => {
  test("blocks once the rolling daily total is reached, regardless of caller", () => {
    // daily cap = 5
    expect(admitCall("+1A")).toBeNull();
    expect(admitCall("+1B")).toBeNull();
    expect(admitCall("+1C")).toBeNull();
    expect(admitCall("+1D")).toBeNull();
    expect(admitCall("+1E")).toBeNull(); // 5th
    expect(admitCall("+1F")).toBe("daily-cap"); // 6th
  });
});
