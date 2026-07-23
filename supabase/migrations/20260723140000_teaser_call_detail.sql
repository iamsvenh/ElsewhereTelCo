-- Richer teaser analytics: duration (dropoff analysis) + final call status.
-- Set by Twilio's statusCallback when the call completes. Combined with the
-- known ~40s script length, duration_s tells us WHERE callers hang up.
-- Repeat-caller and time-of-day analysis are queries over caller_number +
-- created_at (no extra columns needed).
alter table teaser_calls add column if not exists duration_s integer;
alter table teaser_calls add column if not exists call_status text;
create index if not exists teaser_calls_caller_idx on teaser_calls (caller_number);
