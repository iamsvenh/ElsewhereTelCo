# CLAUDE.md — Elsewhere Telephone Company

> Context for Claude Code sessions in this repo. Start at `docs/README.md` (the docs index). Read `docs/strategy/concept.md` before making product decisions — it is the source of truth for everything decided so far.

## What this is

**Elsewhere Telephone Co.**: real vintage phones (payphones/rotary) connected to AI voice personas — the Devil, God, Your Mom, Future You — behind the fiction of a deadpan vintage telephone company. Solo side project of Sven (also founder of Incented). Brainstormed and specced in the `ops` repo (`~/git/ops/ideas/ai-payphone/`), graduated here 2026-07-28.

## Current stage

**Stage 0 — software-only MVP.** Goal: prove the personas are fun before any hardware. Two Twilio numbers (A: Devil answers directly, B: Operator switchboard), three personas + Operator, full call logging/transcripts in Supabase, landing page. Success metric: unprompted sharing (callers not on the seed list). Kill criterion: no sharing after ~20 testers → iterate prompts or shelve. **No hardware purchases until unprompted sharing happens.**

## Stack (decided)

- **Runtime:** Bun + TypeScript (never npm/yarn/pnpm)
- **Bridge server:** always-on Bun process on **Railway** (holds long-lived WebSockets — do NOT move it to serverless)
- **AI:** OpenAI Realtime API, `gpt-realtime-mini` first, upgrade to `gpt-realtime-2` at LOW reasoning effort if persona quality lags. Transcription events ON. Hard \$25/mo budget cap on the OpenAI project.
- **Telephony:** Twilio Media Streams (inbound only)
- **DB:** Supabase (Studio doubles as the transcript-review UI)
- **Landing:** served by the bridge itself from `apps/web/` (decision 2026-07-23: keep it on one system rather than a separate Vercel deploy). Static HTML + inline SVG seal logo + favicons. `elsewheretel.co` points at the bridge's Railway domain.
- **Payments (stage 2+, not now):** Stripe checkout → 4-digit codes

## Repo layout

```
apps/bridge/        Twilio ↔ OpenAI Realtime relay, call lifecycle, Supabase writes
apps/web/           Landing page
packages/personas/  One file per persona: system prompt, cold opener, memory style, voice config
supabase/           Migrations
docs/               README.md (index) · tracker.md (live board) · strategy/ · engineering/ · world/
```

## Non-negotiable product rules (from concept doc — do not relitigate casually)

1. **Personas: invented/ancient only.** No real people living or dead born after ~1850 (ELVIS Act, CA AB 1836, right of publicity).
2. **No voiceprint/biometric identification, ever** (BIPA). Returning callers recognized by **phone number** (+ PIN on shared/hardware phones), never biometrics. (Claim codes retired 2026-07-23 — see `docs/strategy/vision-world-company.md` §7.)
3. **Two-tier consent:** transcripts stored by default for persona improvement (disclosed in-character + ToS); any PUBLIC/marketing use of a recording requires explicit per-call opt-in.
4. **Hard 5-minute call cap enforced server-side**, fresh Realtime session per block (kills history-cost compounding).
5. **Cold opener discipline:** every persona's first line must (a) establish who they are, (b) cast the caller in a role, (c) ask an easy question. The first 10 seconds are the product.
6. **Per-persona memory style:** Devil = petty perfect recall; Your Mom = slightly misremembers; God = knows all but checks the records; safety-oriented personas get summaries, never verbatim quotes.
7. **Wellbeing line:** personas are episodic entertainment, not companions. Never claim sentience; introspective personas push callers toward real-world action.
8. **Verify `cached_tokens` in Realtime usage responses** — silent cache failure is the difference between \$0.24 and \$2.20 per call.

## Working conventions

- Persona prompts are the IP: they live in `packages/personas/`, get reviewed like code, and evolve via the weekly transcript-review loop (read transcripts → find the real FAQ → write tested material into the prompts).
- Doc conventions follow the ops repo: lowercase-hyphen filenames, escape `$` as `\$` in markdown (Sven's reader renders `$...$` as math).
- Brand voice everywhere (docs, landing copy, error messages): deadpan telco officialese. The company never acknowledges anything is unusual.
- Decisions worth keeping go in `docs/` as dated notes (in the right domain folder — see `docs/README.md`); `docs/strategy/concept.md` stays the index of record.
- **Keep `docs/tracker.md` current — always.** It is the live board across all four workstreams (infra/ops, strategy/concept, MVP build, persona/world writing). Update it as part of any work: mark items done, add new tasks as they arise, keep the "Open for Sven" decision queue accurate. Update it in the SAME change set as the work it describes, not as an afterthought. This is non-optional.

## Reference

- Docs index (start here): `docs/README.md`
- Concept + roadmap + economics: `docs/strategy/concept.md`
- Vision (world company, terminology, business model source): `docs/strategy/vision-world-company.md`
- System architecture (incl. runtime persona config, three levers): `docs/engineering/architecture.md`
- OpenAI publishes a Twilio ↔ Realtime reference implementation (Node) — crib the wire protocol, port to Bun.
- Related shelved idea: `~/git/ops/ideas/private-voice-journal/` (someday-funnel, not part of current plan).
