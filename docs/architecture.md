# System architecture

Living document. Describes how the system works and where it extends. Started 2026-07-23; update alongside structural changes. Product decisions live in `concept.md`; infra identifiers in `infra.md`; persona learnings in `persona-design-notes.md`.

## 1. Overview

```
Caller ──PSTN──> [Twilio number] ──webhook POST /incoming-call──> ┌─────────────────────────┐
                       │                                          │  bridge (Bun, Railway)  │
                       │  <Connect><Stream wss/media-stream>      │                         │
                       └──────────Media Stream WS────────────────>│  CallSession (1/call)   │
                                                                  │   ├─ resolve config     │<──── persona_config (Supabase)
                                                                  │   ├─ OpenAI Realtime WS │      code defaults (packages/personas)
                                                                  │   ├─ guardrail timers   │
                                                                  │   └─ call logging ──────┼────> calls (Supabase)
                                                                  └─────────────────────────┘
Twilio Recordings (dual-channel audio, RECORD_CALLS)                    Supabase Studio = review UI
```

One always-on Bun process holds both WebSocket legs per call and relays audio (g711 μ-law base64) in both directions. Serverless can NOT host this; the bridge stays on Railway.

## 2. Components

| Component | Where | Role |
|---|---|---|
| `apps/bridge` | Railway (service `bridge`, Railpack builder) | Webhook, WS relay, call lifecycle, guardrails, logging |
| `packages/personas` | in-repo package | Versioned persona defaults: the IP, reviewed like code |
| `persona_config` table | Supabase | Runtime overrides per persona, no redeploy |
| `calls` / `seed_numbers` | Supabase | Transcripts, metrics, share detection |
| Twilio | number(s) + Media Streams + Recordings | Telephony in, audio capture |
| OpenAI Realtime | per-call WS session | The persona's brain and voice |
| `apps/web` | Vercel (static, not yet deployed) | Landing page |

## 3. Call lifecycle

1. Twilio POSTs `/incoming-call` (From/To/CallSid). Bridge maps To → persona id (`PERSONA_NUMBER_MAP`), returns TwiML `<Connect><Stream>` pointing back at `wss://…/media-stream` with persona/from/to/callSid as stream parameters.
2. Twilio opens the Media Stream WS; the `start` event creates a `CallSession`.
3. CallSession resolves effective persona config (§4), inserts the `calls` row, starts dual-channel recording (if `RECORD_CALLS`), opens the OpenAI Realtime WS.
4. `session.update` configures: assembled instructions, voice, μ-law in/out, server VAD, caller transcription, reasoning effort low (realtime-2 models). Then `response.create` speaks the cold opener; the persona talks first.
5. Relay loop: Twilio media → `input_audio_buffer.append`; `response.output_audio.delta` → Twilio media. Caller barge-in truncates the assistant item at the heard-ms mark and clears Twilio's buffer. Transcripts accumulate from transcription events; usage (incl. `cached_tokens`) from `response.done`.
6. Guardrails (server-side, never model-side): wrap-up nudge at 4:30, hard cut at 5:00. Fresh Realtime session per call, always.
7. Teardown (hangup or cap): close both sockets, finalize the `calls` row (duration, completion, transcript, tokens, cached, model-aware cost estimate, recording sid).

## 4. Persona configuration: three independent levers

| Lever | What it controls | Code default (versioned) | DB override column |
|---|---|---|---|
| **Model** | brains + economics (mini ≈ \$0.15/call, realtime-2 ≈ \$0.55/call) | `OPENAI_REALTIME_MODEL` env | `persona_config.model` |
| **Voice profile** | voice id + performance direction (delivery, pacing, texture) | `voiceConfig` in persona file | `voice`, `voice_direction` |
| **Personality** | system prompt + cold opener | persona file | `system_prompt`, `cold_opener` |

**Layering:** code defaults ← `persona_config` row (non-null columns win) ← future admin dashboard (a UI over the same table). Final instructions are assembled at call start: `personality + VOICE PERFORMANCE(direction) + HOUSE_RULES`.

**Resolution semantics:** fetched fresh at each call start (overlapped with the OpenAI WS handshake, so no added latency); on DB error the last-good value or code default is used — a database outage degrades to shipped defaults, never a dead line. Changes take effect on the next call.

**Promotion rule (keeps the IP in git):** the DB row is a working overlay for fast iteration. When a tuned prompt/voice proves out, copy it into the persona file, commit, and null the override. A row full of nulls is the healthy steady state.

Flip examples (Supabase Studio SQL editor):

```sql
-- Devil on the flagship model for a quality test:
insert into persona_config (persona, model) values ('devil', 'gpt-realtime-2')
  on conflict (persona) do update set model = excluded.model, updated_at = now();

-- Try a different voice + direction without touching personality:
update persona_config
  set voice = 'marin', voice_direction = 'Bright, chipper, relentlessly cheerful…', updated_at = now()
  where persona = 'devil';

-- Back to code defaults:
update persona_config set model = null, voice = null, voice_direction = null where persona = 'devil';
```

## 5. Data model (Supabase)

- `calls` — one row per call: numbers, persona, timing, `completed` (cap vs hangup), transcript jsonb `[{role, text, at}]`, token totals incl. `cached_tokens` (rule-8 verification), model-aware `cost_estimate`, `call_sid`/`recording_sid`, `claim_code` + `consent_publish` (dormant until stage 2+).
- `seed_numbers` — every number personally texted, with A/B context variant. Share detection: any caller NOT in this table is an organic caller, the Stage 0 success metric. Keeping it complete is a manual discipline.
- `persona_config` — runtime overrides (§4), all columns nullable.

RLS is enabled with no policies on all tables: only the bridge (secret key) and Studio touch the DB. New-style Supabase keys only (`sb_secret_…`); legacy JWTs are never used.

## 6. Guardrails and economics

- Hard 5-minute cap: server timers, in-character wrap at 4:30 (to be replaced by the Operator break-in clip), cut at 5:00 (+2s flush).
- Fresh Realtime session per call: kills history-cost compounding.
- `cached_tokens` checked every turn; sustained 0 logs a CACHE FAILURE warning (the \$0.24-vs-\$2.20 gap).
- Cost estimate is model-aware (mini vs full rates) and logged per call; treat as an approximation (text tokens ignored).
- Kill switches: OpenAI project hard budget cap (\$25/mo), Twilio trial limits, Railway spend.

## 7. Operations

- Deploy: `railway up --service bridge` from repo root. Railpack builder only (Nixpacks pulls EOL Node 18 and fails).
- Config change: edit `persona_config` in Studio; effective next call.
- Logs: `railway logs --service bridge`; watch `[usage]`, `[call]`, `[config]`, `[rec]` lines.
- Transcripts: Studio → `calls`. Recordings: Twilio Console → Monitor → Voice → Recordings.
- Migrations: `supabase/migrations/` + `supabase db push`.

## 8. Extension points (designed-for, not built)

- **Number B / Operator routing**: same bridge, `PERSONA_NUMBER_MAP` entry; Operator persona exists. Mid-call transfer between personas is future work (fresh session per persona block, per concept §economics).
- **Operator cap break-in**: pre-rendered μ-law clip injected by the bridge at 4:30, replacing the model-side wrap nudge.
- **ElevenLabs STS layer**: optional re-skin hop on the outbound audio path if OpenAI's voice palette proves insufficient (latency prototype pending). The voice-profile lever is where its config would live.
- **Persona playground**: browser mic ↔ Realtime, for fast persona iteration without telephony.
- **Admin dashboard**: UI over `persona_config` + `calls`. Until then, Supabase Studio IS the admin.
- **Payments / claim codes (stage 2+)**: Stripe checkout → codes; columns already exist on `calls`.
