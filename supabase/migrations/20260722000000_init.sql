-- Elsewhere Telephone Co. — v0 schema (from docs/concept.md MVP spec)
-- calls: one row per call. Transcript stored as jsonb array of
--   {role: 'caller'|'persona', text, at(ms since call start)}.
-- seed_numbers: numbers Sven personally texted. Share detection = any
--   caller NOT in this table is an organic (shared) caller — the metric.

create table if not exists calls (
  id uuid primary key default gen_random_uuid(),
  called_number text not null,
  caller_number text,
  persona text not null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  duration_s integer,
  -- true = talked until the 5-minute cap; false = hung up early
  completed boolean,
  transcript jsonb not null default '[]'::jsonb,
  tokens_in integer not null default 0,
  tokens_out integer not null default 0,
  -- rule 8: verify caching works; silent failure is $0.24 vs $2.20 per call
  cached_tokens integer not null default 0,
  cost_estimate numeric(8, 4),
  -- claim codes are stage 2+; column exists so the schema doesn't churn
  claim_code text,
  -- publishing tier consent (explicit per-call opt-in). Improvement-tier
  -- storage is the default and disclosed in ToS + in character.
  consent_publish boolean not null default false
);

create index if not exists calls_started_at_idx on calls (started_at desc);
create index if not exists calls_caller_number_idx on calls (caller_number);
create index if not exists calls_persona_idx on calls (persona);

create table if not exists seed_numbers (
  number text primary key,
  sent_at timestamptz not null default now(),
  -- A = zero-context text ("call this real quick"), B = one line of context
  context_variant text check (context_variant in ('A', 'B'))
);

-- RLS on, no policies: only the bridge (service role) and Studio touch these.
alter table calls enable row level security;
alter table seed_numbers enable row level security;
