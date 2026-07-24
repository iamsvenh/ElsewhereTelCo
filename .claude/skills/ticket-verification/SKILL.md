---
name: ticket-verification
description: Per-ticket verification protocol before opening a PR for an Elsewhere Linear ticket. AUTO-INVOKE after CI is green and before the PR opens. Elsewhere is a telephony backend + a tiny static web surface, so verification = the hermetic suite mapped to the ticket's acceptance tests, PLUS a manual dev/prod call check for any live-voice behavior (the telephony equivalent of Borker's headed-Playwright), PLUS an optional screenshot for web-page changes. Post the summary as a Linear comment + a link-only PR comment.
---

# Ticket verification protocol (Elsewhere)

Adapted from Borker's UI-heavy protocol. Elsewhere has almost no UI — its product is a **phone call** — so "verification" is mostly the automated suite plus, for anything a caller would hear, a **manual call check** (live calls can't run in CI without spending money and needing a real phone). Runs after CI is green, before the PR opens (or as a follow-up comment on an open PR).

## When this applies

**Always**, for tickets that change:
- **Live-call behavior** — anything a caller hears or does: persona prompts, the cold opener, barge-in, the 5-min cap, DTMF/menu routing, recording, TwiML.
- **A caller-facing web surface** — the landing / directory / legal pages.
- **A data path used to make a go/no-go call** — signup capture, teaser/switchboard stats, transcripts.

**Skippable** for: pure refactors with no observable change, internal logging tweaks, docs-only, and CI/tooling changes (their own green run is the proof).

## The protocol

### 1. Automated criteria — map the suite to the Spec
For each acceptance test in the ticket that is code-verifiable, point to the actual test that encodes it and confirm it's green:
- `bun run check` passes (typecheck + lint + prettier + unit + integration).
- Each Spec line → a named test (e.g. "Spec: barge-in flushes in the tail → `tests/unit/relay.test.ts` THE FIX case"). A Spec line with no test is a gap — write the test, don't hand-wave.
- Reminder: **no test spends money** (hermetic — see `tests/TESTING_STRATEGY.md`).

### 2. Manual call check — the telephony equivalent of headed-Playwright
For any **live-call** acceptance criterion (which the suite can't cover, since there's no live-call E2E), do a real call and record what happened:
- Prefer a **dev** call if a tunnel/dev-number is set up; otherwise call the **prod** number after deploy and verify there (that's the current posture — see `docs/engineering/dev-workflow.md`).
- Walk each live-call acceptance criterion and note the observed behavior (what you said, what the persona did, timing). A short transcript excerpt or a note like "pressed 0 mid-call → returned to Operator within ~1s" is the evidence.
- If model-level behavior is involved (e.g. a persona's refusal), note that it's model-dependent, not deterministic.

### 3. Web-page check (only if a page changed)
Optional screenshot via the browser tools of the changed page (`/`, `/directory`, `/legal`). Not headed-Playwright — Elsewhere's pages are static; a screenshot + an eyeball is enough.

### 4. Report
- Post a **markdown verification summary as a Linear comment** on the ticket: a table of `acceptance criterion → automated test (green?) / manual-call observation`, plus any caveats (model-dependent behavior, deferred items).
- Leave a **short link-only PR comment** pointing at the Linear ticket.
- Screenshots (if any) go in the report/artifact, not spammed inline.

## The bar

"Every code-verifiable criterion has a green test named against it, and every live-call criterion has a real call that observed it." Green CI alone is **not** sufficient sign-off for a ticket that changes what a caller hears — the call check is required, because the suite deliberately never places a real call.

## Open question for Sven (adjust as we learn)

Live-call verification is manual-against-prod today (no local tunnel — deferred, per dev-workflow.md). If/when we add the dev tunnel + dev number, the manual call moves to dev (pre-merge) instead of prod (post-deploy). Until then, "verify the live behavior" for a call-path ticket happens right after the deploy that ships it.
