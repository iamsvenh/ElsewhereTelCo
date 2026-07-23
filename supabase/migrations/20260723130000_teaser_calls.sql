-- Stage T analytics: log EVERY teaser-line call, not just press-1, so we
-- have the denominator (calls) against the numerator (signups).
-- One row per call, keyed by Twilio CallSid. outcome is set when the caller
-- presses a key; a row with outcome=null = listened/hung up without pressing.
create table if not exists teaser_calls (
  call_sid text primary key,
  caller_number text,
  created_at timestamptz not null default now(),
  -- 'signup' (pressed 1) | 'other-key' (pressed something else) | null (no press)
  outcome text
);

create index if not exists teaser_calls_created_at_idx on teaser_calls (created_at desc);
alter table teaser_calls enable row level security;
