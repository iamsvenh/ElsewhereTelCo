-- Stage T: the teaser line's subscriber ledger (phone-native mailing list).
-- Press-1 on (806) 666-1212 lands here. notified_at set when we make the
-- "the down trunk is open" call (mechanism TBD — see docs/mvp-2-plan.md).
create table if not exists signups (
  number text primary key,
  created_at timestamptz not null default now(),
  source text not null default 'teaser-line',
  notified_at timestamptz
);

alter table signups enable row level security;
