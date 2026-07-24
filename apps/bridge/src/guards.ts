/**
 * F33 — cheap runaway/abuse backstops. The OpenAI project budget cap is the
 * real kill switch but it is NOT instantaneous, so a burst (or a discovered
 * endpoint) can overshoot it before it trips. These are in-memory, reset on
 * restart, and deliberately generous — a circuit breaker, not billing:
 *
 * - concurrency: cap simultaneous live Realtime sessions.
 * - daily volume: cap accepted persona calls per rolling 24h.
 * - per-caller rate: cap one number's calls per rolling window (stops a single
 *   caller — or a spoofed one — from draining the budget with repeat dials).
 *
 * All limits are env-tunable (see env.ts). Only the persona line (/incoming-call
 * + /media-stream) is gated; the pre-recorded teaser is ~free and left open.
 */
import { env } from "./env";

const DAY_MS = 24 * 60 * 60_000;

let active = 0;
const dayLog: number[] = []; // timestamps of accepted persona calls (24h window)
const perCaller = new Map<string, number[]>();

function prune(arr: number[], now: number, windowMs: number): number[] {
  const cutoff = now - windowMs;
  while ((arr[0] ?? Infinity) < cutoff) {arr.shift();}
  return arr;
}

// ---- concurrency (authoritative inc/dec around a live CallSession) ----

export function callSlotAvailable(): boolean {
  return active < env.maxConcurrentCalls;
}
export function acquireCall(): void {
  active += 1;
}
export function releaseCall(): void {
  active = Math.max(0, active - 1);
}
export function activeCalls(): number {
  return active;
}

/**
 * Rate/volume admission, checked once per inbound persona call. Returns null to
 * admit, or a short reason string to reject. Records the attempt on admit.
 */
export function admitCall(caller: string): string | null {
  const now = Date.now();
  prune(dayLog, now, DAY_MS);
  if (dayLog.length >= env.maxCallsPerDay) {return "daily-cap";}

  const hist = prune(perCaller.get(caller) ?? [], now, env.callerWindowMs);
  if (hist.length >= env.maxCallsPerCallerPerWindow) {return "caller-rate";}

  dayLog.push(now);
  hist.push(now);
  perCaller.set(caller, hist);
  return null;
}

/** Test-only: clear the in-memory counters between cases (this state is a singleton). */
export function __resetGuardsForTest(): void {
  active = 0;
  dayLog.length = 0;
  perCaller.clear();
}
