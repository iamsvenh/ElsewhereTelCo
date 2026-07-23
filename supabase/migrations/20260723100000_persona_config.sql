-- Runtime persona configuration (docs/architecture.md §4).
-- Three independent levers per persona, all nullable: a non-null column
-- overrides the code default in packages/personas at the next call.
-- Promotion rule: proven values get committed into the persona file and
-- the override nulled — a row full of nulls is the healthy steady state.

create table if not exists persona_config (
  persona text primary key,
  -- lever 1: model (economics/brains), e.g. 'gpt-realtime-mini', 'gpt-realtime-2'
  model text,
  -- lever 2: voice profile
  voice text,
  voice_direction text,
  -- lever 3: personality
  system_prompt text,
  cold_opener text,
  -- bookkeeping
  notes text,
  updated_at timestamptz not null default now()
);

alter table persona_config enable row level security;
