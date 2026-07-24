/**
 * F7 — keep raw PII out of stdout (Railway retains logs as an uncontrolled
 * copy, outside Supabase and outside any deletion path). Supabase stays the
 * single governed store of numbers/transcripts; logs get only enough to debug.
 */

/** Mask a phone number for logs: keep the last 2 digits, e.g. "••••67". */
export function maskNumber(n: string): string {
  if (!n || n === "unknown") return n;
  return "••••" + n.slice(-2);
}
