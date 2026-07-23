-- Call recording support (decision 2026-07-22): dual-channel Twilio
-- recordings during the informed-seed-tester phase, for voice/pacing
-- analysis. Audio stays on Twilio; we store the linkage.
alter table calls add column if not exists call_sid text;
alter table calls add column if not exists recording_sid text;
create index if not exists calls_call_sid_idx on calls (call_sid);
