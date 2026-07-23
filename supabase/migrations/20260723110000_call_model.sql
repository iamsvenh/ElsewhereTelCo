-- Record which model served each call: config is runtime-switchable now,
-- so the call row must say what actually ran (dashboards lie less that way).
alter table calls add column if not exists model text;
