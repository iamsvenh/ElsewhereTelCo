# Elsewhere — testing strategy

**Status: v1, 2026-07-24.** The living doc for how we test this repo. Modelled on Borker's (`~/git/social-automation/tests/TESTING_STRATEGY.md`) — Bun's native runner, a layered pyramid, real dependencies over stubs where feasible, and strong assertions — scaled to a ~1k-LOC bridge. Update this in the same change set as any test-shape change.

## The rule (from now on)

**New code is written test-first, or with its test in the same change set.** A behavior that isn't asserted is a behavior that will silently regress. This started the day we noticed we were writing throwaway checks in the scratchpad — those belong here instead, as durable tests.

What that means in practice:
- A bug fix lands with a test that fails before the fix and passes after (F24 loop-fix, F26 canon phrase, and the F5/F33/F7 work are all guarded this way).
- A new pure function (a guard, a validator, a formatter) lands with a unit test.
- A new HTTP route lands with an integration assertion of its status + contract.
- We assert **exact** behavior. No `>= 0`, no `toBeDefined`, no "the body doesn't say error." A test that cannot fail is worse than no test — it's false confidence (Borker learned this the hard way; we skip the lesson).

## Layout

```
tests/
├── TESTING_STRATEGY.md   ← this doc
├── setup.ts              ← preload (bunfig.toml): forces a deterministic env before any module reads process.env
├── unit/                 ← pure logic, no I/O. The bulk of the suite.
└── integration/          ← boots the real bridge as a subprocess (hermetic cwd) and hits its HTTP surface
```

Naming: `*.test.ts`, colocated by layer. Each file opens with a comment saying *what rule/finding it guards*, not just what it calls.

Run:
- `bun run test` — unit + integration (what CI runs).
- `bun run test:unit` / `bun run test:integration` — one layer.
- `bun run check` — typecheck + full suite. Run before every commit.
- `bun test tests/unit/foo.test.ts` — one file while iterating.

## The pyramid (current)

| Layer | Owns | Fidelity | Files |
| --- | --- | --- | --- |
| **unit** | pure invariants + security logic: Twilio signature/token (F5), spend/rate guards (F33), log redaction (F7), TwiML building + XML-escaping, persona non-negotiables (openers, house rules, canon phrase, the fixed loops), and the **relay bookkeeping** (F29 barge-in tail + cost estimate, extracted from `session.ts` into `relay.ts`) | none needed — no I/O | `unit/twilio-auth`, `unit/guards`, `unit/redact`, `unit/twiml`, `unit/personas`, `unit/relay` |
| **integration** | the bridge's HTTP contract: signature enforcement on `/incoming-call` (403 unsigned / 200 signed w/ token), the `/legal`·`/privacy`·`/terms` disclosures page, 404s | real server process; hermetic env (no `.env`, no Supabase) | `integration/bridge-routes` |

52 tests green as of 2026-07-24.

## Linting

Strict from day one (`eslint.config.mjs`, adapted from Borker minus its React/Next rules). Headline: **`@typescript-eslint/no-explicit-any` is an error** — type the wire events, don't `any` them. Also strict-config rules, `consistent-type-imports`, no-non-null-assertion (relaxed in tests), unused-imports, `prefer-const`/`no-var`/`eqeqeq`/`curly`. We enforce **zero** — Borker waited and now carries a ~1500-item backlog; we don't inherit that. `no-console` is off on purpose: this is a server, stdout is its observability (F7 governs *what* is logged, not whether). `bun run lint` runs it; it's part of `bun run check` and CI.

## Fidelity ladder (what's real vs. faked, and why)

- **Twilio signatures** — real HMAC, asserted against **Twilio's own published test vector** (the preload token `12345` is theirs). This proves we implement *their* algorithm, not merely a self-consistent one.
- **The bridge** — the integration layer boots the actual `index.ts` as a subprocess in a scratch cwd, so it exercises real routing/upgrade logic while the repo `.env` can't leak real secrets in.
- **Supabase** — not exercised yet. `db.ts` degrades to console-only without credentials, so the suite runs without a database. When call-logging logic grows non-trivial, add an `integration/` layer against a local Supabase (Borker's standard) — don't mock it.
- **OpenAI Realtime / Twilio Media Streams** — the live call path is not end-to-end tested here (it needs a real phone call). The relay's *logic* (barge-in bookkeeping, the 5-min cap, cost math) is the next unit-test target: extract it from socket I/O so it can be driven by synthetic event sequences. Until then it's covered by manual test calls — say so honestly rather than pretend.

## Known gaps (honest)

- **Session relay — the pure logic is now extracted + tested** (`relay.ts`: the F29 barge-in state machine and the cost estimate, driven by synthetic event sequences in `unit/relay.test.ts`). What's still untested is the **socket wiring and the timers** in `session.ts` — the 5-min cap / 4:30 nudge (need fake-timer support), the F30 finalize-await race, and the F31 config-ack flow end-to-end. Next: either fake timers, or extract the timer/finalize orchestration behind an injectable clock + sink so it too can be driven synthetically.
- **No Supabase-layer tests** (see above).
- **The three-job cold-opener law** is only partially machine-checkable — we assert an opener exists and asks a question; whether it *casts the caller in a role* is human-reviewed in the transcript loop.
- **VAD / turn-detection tuning** (the background-chatter finding) has no automated oracle — it's inherently perceptual, tuned against real calls.

## CI

`.github/workflows/ci.yml` runs `bun run check` (typecheck + unit + integration) on every push and PR. Green CI is the merge gate. Keep the suite fast and flake-free — the moment it flakes, people start ignoring it, and then it's worse than nothing.
