---
name: ticket-spec
description: Enforces spec-driven, test-first format for Linear tickets AND design docs. USE WHEN creating or rewriting a Linear issue (mcp__linear-server__save_issue) for the Elsewhere team, OR writing a design/spec doc under docs/, OR the user asks to "create a ticket", "new issue", "spec for X", "design doc", or similar.
---

# ticket-spec: spec-driven, test-first tickets & design docs

Adapted from Borker's `ticket-spec` for Elsewhere. Every Linear ticket and every design doc follows the structure below. **Spec first, tests second, implementation third** — the same rule the codebase already enforces (`tests/TESTING_STRATEGY.md`, CLAUDE.md "test-driven from now on"). Never ship work whose acceptance criteria were written after the code.

## When to apply

Automatically, without being asked, when:
- About to call `mcp__linear-server__save_issue` with non-trivial content (more than a 1-line title fix).
- About to write/edit a design or spec doc under `docs/` (engineering specs, world/switchboard designs, production specs). Canon and dated decision notes are records, not tickets — they don't need the test sections, but they still lead with Context + the decision.
- The user asks: "create a ticket", "new issue", "write up X", "rewrite this ticket", "spec for X", "design doc", "new sub-issue", or asks for a scope-expanding change to an existing ticket.

If the user waives it for a one-off ("quick note, no spec"), honor that.

## The template

```markdown
## Context
Why this matters. What is broken, missing, or changing. 1–3 sentences.

## Spec
Behavioral contract — what "done" looks like from outside the system.
- **Given** [precondition] **when** [action] **then** [observable outcome]
- Invariants that must always hold
- Edge cases enumerated by name (not "handle edge cases")
- Explicit scope boundaries

## Acceptance tests
Tests that encode the Spec, written before implementation.
- Pick the boundary: unit (pure logic), integration (bridge HTTP), or a manual
  call check (live voice — see ticket-verification; the telephony parts can't
  run in CI, so name the manual steps explicitly).
- Each test maps to one Spec line. If all pass, the ticket is done.
- **No test may spend money** — no real OpenAI/Twilio/Supabase in automated
  tests (`tests/TESTING_STRATEGY.md` §"No test spends money").

## Implementation notes
Optional. File pointers, prior art, gotchas. Not prescriptions.

## Out of scope
Explicit list of what this ticket does NOT do. Deferred follow-ups get their own ticket.
```

## Scaling rules

- **Tiny** (typo, small style): Context + Spec + Acceptance tests may each be one line; omit the last two sections.
- **Medium** (bug, small feature): full Context, Spec of 3–7 bullets, 2–5 acceptance tests, Implementation notes recommended.
- **Large** (multi-file feature, schema change, a new persona/world piece): every section populated; Spec may get sub-headings; Out of scope required.
- **Parent / epic**: Context + high-level Spec; link to sub-tickets that each carry their own full spec. Don't duplicate sub-ticket content in the parent.

## Hard rules

1. **Spec is behavioral, not implementation.** "The Operator's cold-open plays within 1s of the media stream connecting" — not "call `sendColdOpener()` on `session.updated`".
2. **Tests come before code.** Acceptance tests are in the ticket body, not a follow-up. Prose is fine ("unit: PlaybackTracker returns a barge-in when a mark is outstanding after response.done").
3. **No empty sections** — omit rather than write "N/A"/"TBD". A TBD Spec means the ticket isn't ready.
4. **Out of scope is explicit for Medium+.** Prevents scope creep; makes follow-ups cheap to spot.
5. **Acceptance tests map 1:1 to Spec lines.** A Spec line with no test is either unverifiable (rewrite it) or out of scope (move it).
6. **Label the cross-cuts.** On the single Elsewhere team, set the discipline via the `area:` label (engineering / production / creative / strategy / infra), the world via `world:`, and attach the issue to its deliverable **Project**. That's how the board stays legible without extra teams.
7. **Decisions stay in git.** Canon, specs, and dated decisions live in `docs/` (the source of record); Linear tracks the *work*. A ticket references the doc; it doesn't replace it.

## Elsewhere-specific notes

- **Two kinds of work need different "tests":** code (→ `bun run check`, the hermetic suite) and creative/production (→ a review/ratify or produce/sign-off gate, and for live voice a manual call check). Write the acceptance criteria in the form that fits — don't force a Playwright-style UI test onto a VO clip or a canon entry.
- The public web surface is tiny and static; UI acceptance tests are rare here (contrast Borker). Most verification is the hermetic suite + a manual call.
