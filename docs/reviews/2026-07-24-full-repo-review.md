# Full-repo review — 2026-07-24

**Status:** original findings intact below; **triaged 2026-07-24** — see the Adjudication addendum for what was ratified, overstated, deferred, or left open. No code fixes applied.
**Trigger:** pre-World-0 checkpoint. Review everything (code, concept, plans, storylines, in-world logic) before the switchboard build.
**Method:** seven parallel reviewers over the whole repo (code+schema, docs consistency, strategy/economics, world/canon/personas, compliance vs the 8 rules, World 0 build-readiness, in-world logic and fallacies), plus direct build/hygiene checks.

**Verification legend.** ✓ = verified directly against the repo during this session. Unmarked findings are as reported by a reviewer with a cited file:line; they are well-evidenced but were not independently re-run. Where reviewers disagreed, the disagreement is recorded rather than resolved (see [Notes on reviewer disagreement](#notes-on-reviewer-disagreement)).

**Severity:** 🔴 breached / blocking · 🟠 high · 🟡 medium · ⚪ low.

---

## Adjudication addendum — 2026-07-24 (post-review)

The findings below are the original snapshot, left intact. After filing, four verifier passes (decision-provenance, adversarial code verification, pragmatic legal posture, creative/world-logic) plus Sven's own knowledge re-checked them. Net outcome — read this before acting on any single finding:

**Ratified as accepted-risk for the seed phase (Sven, 2026-07-24)** — these were *time-boxed deferrals whose expiry conditions were crossed unnoticed*, now consolidated as explicit decisions with expiry triggers (recorded in `env.ts`, `types.ts:80-86`, `concept.md:345`, and `../tracker.md` A/D):
- **F2 (recording on before disclosure)** and **F1 (crisis guardrails off)** — accepted while callers are all invited seed testers and recordings are internal-QA-only. **Expiry = first of:** a non-seed caller · the Artizen/community post · unsolicited press · payment · hardware in a venue. The community post is the true event horizon (after it, `concept.md:241`'s "consent can't be retrofitted" becomes true). Legal read: at this caller base, exposure is low-probability implied-consent territory; but the pre-roll fix is ~20 min, so the ratification is only coherent as "ship the pre-roll before any push." F3/F4 (ToS/privacy, publish opt-in + delete path) bundle with the production/payment gate; a *minimal* `/privacy` + pre-roll + scoped crisis line come earlier, before the community post.

**Overstated in whole or part** (do not action as written):
- **F12/F13** — juxtaposed a Stage-1+ planning figure with the Stage-0 cap (different stages; the dashboard cap *is* the recorded kill switch), and counted one pricing decision's own recorded flex range as self-contradiction. The four *cost* numbers across docs remain genuine drift.
- **F22** — the unreachable-doors Operator is a doubly-recorded deliberate stub, and its number isn't live, so no caller hits it. Only the "no refunds, the call was free" line is a real defect.
- **F23** — attacked the doc author's menu *lean* (A1), not a ratification; the menu set is explicitly open (decision A). It's input to that brainstorm, not a conflict.
- **F42** — `memoryStyle`/`familySafe` are recorded forward-declarations, not dead code (the review concedes nothing is violated). `voiceConfig.temperature` and the `[[ ]]` sweep are valid.

**Recorded 2.0a work, not present-tense gaps** (the sequence is the plan; canon v2 only ratified 2026-07-24):
- **F25 (opener rotation)** — the bridge-rotated opener kit is `mvp-2-plan.md` Stage 2.0a.
- **F27 (canon layer)** — the shared canon module in `packages/personas` is 2.0a's first bullet.
- **F24** partial — the full Devil rewrite is deferred 2.0a work; the one live exception is the diagnosed loops at `devil.ts:17,28` (socks list + notary gag), a cheap one-line hotfix worth doing while numbers are public.

**Code findings re-ranked for *current* reality** (seed phase, tens of calls, unpromoted) by the adversarial pass — this order supersedes the P4 severity tags for prioritization: (1) **F29** barge-in tail — the only bug on every live call, degrading the persona-feel Stage 0 measures; (2) **F30** recordingSid/never-retried finalize — corrupting the small evidence base (the "loses the calls that matter most" framing was overstated: only sub-300ms setup-drops are lost); (3) **F5** `/teaser-key` signup forgery — latent TCPA shape, trivially exploitable; (4) **F5** `/media-stream` hijack **+ F33** — budget-blowout path, zero floor, matters once a number circulates. All P4 bugs CONFIRMED against code; both re-checked "verified clean" claims (RLS, schema/code parity) held.

**Genuinely open decisions for Sven** (neither ratified nor overstated): **F8** switchboard-vs-Devil *sequence* (the LLM-free-v0 decision is settled; the order was never decided, and the repo contradicts itself) · **F17** Devil-wall voice Glenda-vs-Operator (canon says Glenda; under lean B2 the teaser master survives, so the VO cost is ~15s of new script, not a re-produce) · **F16** Operator knowledge boundary (one redline paragraph). All three fold into the queued A–E switchboard redline.

---

## Overview

### P0 — Live exposure. Self-declared gates already crossed on public numbers.

| ID | Finding | Sev |
| --- | --- | --- |
| [F1](#f1-crisis-guardrails-are-removed-while-both-numbers-are-public) | Crisis guardrails deliberately removed; the docs' own precondition ("informed seed testers") is breached | 🔴 |
| [F2](#f2-recording-starts-before-any-disclosure) ✓ | Dual-channel recording starts in the constructor, before the first word | 🔴 |
| [F3](#f3-no-tos-or-privacy-page-exists) | No ToS/privacy route; the improvement-tier consent basis does not exist, and the docs say it cannot be retrofitted | 🔴 |
| [F4](#f4-the-publish-tier-opt-in-is-unreachable) | `consent_publish` is written by nothing; the "press 2 and it is destroyed" promise has no delete path | 🔴 |
| [F5](#f5-unauthenticated-webhooks-and-an-open-media-stream) ✓ | No `X-Twilio-Signature` validation; `/media-stream` upgrades any socket | 🔴 |
| [F6](#f6-nothing-anywhere-addresses-minors) | Zero age handling in code, schema, prompts, or copy, on a line branded "the Devil" | 🔴 |
| [F7](#f7-no-retention-policy-no-deletion-path-no-contact-channel) | No delete/purge anywhere; full phone numbers and utterances also land in Railway logs | 🟠 |

### P1 — Sequencing. The next build block cannot move the gate it is measured against.

| ID | Finding | Sev |
| --- | --- | --- |
| [F8](#f8-world-0-is-llm-free-so-it-produces-no-stage-0-evidence) | World 0 is specced LLM-free; Stage 0's gate is "are the personas fun" | 🔴 |
| [F9](#f9-the-kill-metric-has-no-implementation) ✓ | `seed_numbers` has zero code references; the go/no-go number is uncomputable | 🔴 |
| [F10](#f10-the-artizen-push-destroys-the-metric-it-would-be-measured-by) | A community broadcast makes "not in `seed_numbers`" stop meaning "organic share" | 🟠 |
| [F11](#f11-the-kill-criterion-is-unfalsifiable-as-written) | "Iterate prompts or shelve" has a permanently available escape branch and no date | 🟠 |
| [F12](#f12-the-volume-plan-is-5-7x-over-the-mandated-budget-cap) | 1,000 calls/mo ≈ \$100-300 vs a hard \$25/mo cap; no spend accumulator in code | 🟠 |
| [F13](#f13-four-costs-and-four-prices-coexist) | Per-call cost appears as four numbers; pricing as four points, in the index of record | 🟡 |

### P2 — Fiction integrity. Decide before any VO is cut.

| ID | Finding | Sev |
| --- | --- | --- |
| [F14](#f14-the-cannot-lie-trilemma) | "Devil cannot lie" + "stay in character" + "never claim sentience" have no joint answer to "are you an AI?" | 🔴 |
| [F15](#f15-the-devils-defining-trait-is-the-one-the-runtime-cannot-deliver) | Canon sells verbatim recall from weeks ago; sessions are stateless per call | 🔴 |
| [F16](#f16-the-operator-has-no-knowledge-boundary) | World 0's Resident has no specified epistemology, and she is what gets produced next | 🔴 |
| [F17](#f17-the-devil-wall-has-two-different-characters) | Glenda (canon) vs the Operator (both design docs); decides whether the teaser master is reusable | 🔴 |
| [F18](#f18-nothing-explains-why-a-working-line-to-hell-is-unremarkable) | No in-world account of the Exchange's secrecy or licensing; the product selects for the callers who will notice | 🟠 |
| [F19](#f19-the-directory-pre-empts-its-own-immersion) | "The Devil is a first draft" sits above his number on the conversion page | 🟠 |
| [F20](#f20-future-you-has-four-unhandled-time-travel-holes) | Falsifiable premise, no in-world law for refusals, grandfather problem, inverted memory style | 🟠 |
| [F21](#f21-your-mom-is-ontologically-incoherent) | "Every mother, the archetype" vs a Resident waiting by a phone in the eternal Kitchen | 🟡 |
| [F22](#f22-the-operator-advertises-doors-she-cannot-open) | Board lists two dormant worlds; "no refunds, the call was free" breaks the company's first rule | 🟡 |
| [F23](#f23-the-switchboard-fails-its-own-stated-test) | Three of four doors lead out of the fiction; the fourth is closed | 🟠 |

### P3 — Writing. The prompts have not absorbed their own diagnosis.

| ID | Finding | Sev |
| --- | --- | --- |
| [F24](#f24-the-devil-prompt-still-ships-the-diagnosed-failures) ✓ | The socks/birthday/handwriting list and the notary gag survive verbatim | 🟠 |
| [F25](#f25-there-is-no-cold-opener-rotation) ✓ | `coldOpener` is a single string, pinned verbatim; the process doc mandates a rotating kit of 4-6 | 🟠 |
| [F26](#f26-the-canon-phrase-regression) ✓ | `types.ts:93` still says "by the management"; canon v2 locked "quality assurance" | 🟠 |
| [F27](#f27-canon-exists-and-nothing-consumes-it) | No canon layer in `buildInstructions`; the Management, the Ledger, cannot-lie, namelessness all absent from prompts | 🟠 |
| [F28](#f28-are-you-an-ai-and-real-distress-are-largely-unwritten) | No AI-disclosure text anywhere; distress handled in one sentence, in one persona | 🔴 |

### P4 — Code correctness.

| ID | Finding | Sev |
| --- | --- | --- |
| [F29](#f29-barge-in-fails-for-the-tail-of-every-response) ✓ | No `mark` queue, so buffered persona audio plays over an interrupting caller | 🟠 |
| [F30](#f30-the-dbid-race-loses-exactly-the-calls-that-matter-most) | Fast hang-ups never finalize; those are the transcripts that signal a persona bombing | 🟠 |
| [F31](#f31-sessionupdate-success-is-never-verified) | A rejected update silently leaves pcm16 output Twilio cannot decode: five minutes of paid silence | 🟠 |
| [F32](#f32-dtmf-is-discarded-on-the-live-leg) ✓ | No `dtmf` case, so "press 0 to return to the Operator" cannot work | 🟡 |
| [F33](#f33-the-25mo-cap-is-not-enforceable-in-code) | No accumulator, no concurrency ceiling, no per-caller limit, no circuit breaker | 🟠 |
| [F34](#f34-smaller-code-findings) | Cost estimate ignores text tokens; no UNIQUE on `call_sid`; error paths drop the call with dead air; and others | 🟡 |

### P5 — Doc hygiene.

| ID | Finding | Sev |
| --- | --- | --- |
| [F35](#f35-the-vercel-decision-is-stale-in-five-places) ✓ | CLAUDE.md records the one-system decision; README, architecture, concept, and a package.json disagree | 🟡 |
| [F36](#f36-canon-v1-to-v2-is-unpropagated) | Five docs still say "canon v1 in redline" or "pending ratification" | 🟡 |
| [F37](#f37-claim-codes-retired-in-three-docs-load-bearing-in-four) | Retired 2026-07-23; still the returning-caller mechanism in `concept.md` and `mvp-2-plan.md` | 🟡 |
| [F38](#f38-conceptmd-is-stale-at-the-header-and-future-dated-in-the-body) ✓ | Pre-rename title, "No decision yet", and fourteen decisions dated after today | 🟡 |
| [F39](#f39-infra-registry-never-recorded-the-live-number) | The only publicly advertised number does not appear in `infra.md` | 🟡 |
| [F40](#f40-tracker-gaps-and-duplicates) ✓ | The safety blocker is absent entirely; queue items 1 and 2 duplicate; one item overclaims | 🟠 |
| [F41](#f41-audio-snippets-is-misnamed-misplaced-and-undocumented) ✓ | Space in the folder name; seven of ten tracked files are not audio; referenced by no doc | ⚪ |
| [F42](#f42-declared-levers-that-do-nothing) | `memoryStyle`, `familySafe`, and `voiceConfig.temperature` are read by no code | 🟡 |

### What is healthy

Worth stating plainly, because the list above is long. See [Verified clean](#verified-clean).

---

## P0 — Live exposure

### F1. Crisis guardrails are removed while both numbers are public

`packages/personas/src/types.ts:80-86` records the deferral and its precondition: *"crisis/wellbeing guardrail language is deliberately REMOVED for now… Crisis guardrails MUST return, properly scoped, before the number goes beyond informed seed testers."* `docs/world/persona-design-notes.md:24` repeats it.

The precondition is breached. Both numbers are printed on a public HTTPS page (`apps/web/index.html:362`, `apps/web/directory.html:256`, `:260`), the `/directory` page actively recruits strangers, and the Artizen push is queued. `apps/bridge/src/session.ts:389` additionally instructs the model at wrap-up: *"Never advice, never pleasantries, never anything a helpline would say."*

Of exactly one real outside caller to the Devil line, `docs/world/persona-design-notes.md:9` records that *"'Should I die right now?' is Devil FAQ #1… the caller hung up on the spot."* The only thing that caught it was OpenAI's model-level backstop, which the same note calls *"unremovable"*: a vendor behavior, not a control we own.

Four of the seven reviewers flagged this independently. It is a writing task, not an engineering one.

### F2. Recording starts before any disclosure ✓

`apps/bridge/src/session.ts:125` calls `startRecording()` inside the `CallSession` constructor, before `connectOpenAI()` at `:130` and before the cold opener. Twilio dual-channel capture therefore covers the call from first audio. `RECORD_CALLS=true` ships in `.env.example`.

`docs/strategy/concept.md:345` states the opposite policy: recording built in from day one *"but default off."* `apps/bridge/src/env.ts:33-37` justifies the current setting as being for *"the informed-seed-tester phase"*, a premise that ended when the number was published.

The only privacy language is reactive and in-fiction (`types.ts:93`), says *monitored* rather than *recorded*, and only fires if asked. The website line is canonically engineered not to say what it means: `docs/world/canon.md:38` notes the phrase *"is careful never to say so."*

Exposure shape: all-party-consent statutes (CA Penal Code §632/§632.7, FL §934.03, plus WA, IL, PA, MD, MA, MT, NH, CT). The 505 area code does not control; the caller's location generally does, and the landing page is reachable from anywhere. Not legal advice: flagging that recording-before-disclosure plus deliberately ambiguous notice plus unrestricted geography is the fact pattern that generates claims.

Cheapest mitigation: an unambiguous pre-roll before `<Connect><Stream>` in `apps/bridge/src/twiml.ts`, or `RECORD_CALLS=false` until one exists.

### F3. No ToS or privacy page exists

Rule 3 locates the improvement-tier consent in *"ToS"*. The bridge's full route table is `apps/bridge/src/index.ts:42-161`: there is no `/terms`, `/privacy`, or `/legal`, and no such file under `apps/web/`. Neither public page contains the words AI, LLM, or OpenAI.

`docs/strategy/concept.md:241` states the consequence directly: *"the improvement-tier use must be granted from call one… retrofitting consent onto an existing corpus doesn't work."* Meanwhile `docs/strategy/fundraising.md:10` sells that corpus as the moat: *"Canon accreted from thousands of real calls is IP no competitor reproduces."*

Also missing: any contact address or form, so a caller has no channel to request anything (see [F7](#f7-no-retention-policy-no-deletion-path-no-contact-channel)).

### F4. The publish-tier opt-in is unreachable

`supabase/migrations/20260722000000_init.sql:25-27` defines `consent_publish`, correctly defaulting false. No code reads or writes it; `finalizeCall`'s patch type (`apps/bridge/src/db.ts:172-185`) omits it entirely.

Architecturally there is also no moment to capture it. The Devil line's TwiML is `<Connect><Stream>` with no verb after it (`apps/bridge/src/twiml.ts:26-36`), and the bridge closes the Twilio socket itself (`session.ts:426`), so the designed end-of-call flow (`concept.md:345`: *"press 1 to allow, 2 and it is destroyed"*) has nowhere to run. No code deletes a Twilio recording either, so "destroyed" cannot be honored.

Recordings are currently accumulating in the Twilio console with no consent flag attached.

Fixing this needs a TwiML restructure (an action URL after `<Connect>`, or a `<Gather>` leg), a consent write path, and a Twilio recording-delete call.

### F5. Unauthenticated webhooks and an open media stream ✓

`apps/bridge/src/index.ts:47-48` carries the TODO: `X-Twilio-Signature` is never validated, though `TWILIO_AUTH_TOKEN` is already loaded (`env.ts:21`) and used for the recording REST call.

Consequences:
- `/teaser-key` accepts a forged `From`, writing arbitrary numbers into `signups` (`db.ts:60-67`). That is the ledger we intend to call back, which makes it a TCPA-shaped liability rather than mere spam.
- `/teaser-status` accepts forged durations, corrupting the Stage-T funnel data that gates hardware spend.
- `/media-stream` upgrades any WebSocket with no auth (`index.ts:42-45`) and takes `persona`, `from`, `to`, and `callSid` from attacker-controlled `customParameters` (`:178-186`), so an outsider can open real Realtime sessions on our key.
- `/teaser-stats` (`index.ts:120-122`) is public, method-agnostic, and does a full table scan per hit. Aggregates only, so no PII leaks, but call volume and conversion are world-readable at `elsewheretel.co/teaser-stats`.

This gets worse the moment the switchboard event log becomes the KPI source of truth: forgeable writes stop being a launch-day TODO and become a data-integrity bug.

### F6. Nothing anywhere addresses minors

Zero hits for age, minor, 18, COPPA, or parental across code, schema, prompts, and web copy. No age gate, no age question in any prompt, no minimum age (there is no ToS at all).

`familySafe` exists on every persona (`devil.ts:41` = false) but is read by no code; `types.ts:72-73` documents it as a venue filter (*"farmers markets get no Devil"*). It is pure metadata today.

A number branded "call the Devil", shared by text and destined for bars, festivals, and a desert stunt, will be dialed by kids. The system then collects from that caller: their phone number in plaintext, a full transcript, and a dual-channel recording of their voice. That combination is what COPPA's voice-recording guidance and the 2025 rule amendments address, alongside state minor-protection and AI-companion-disclosure laws now in motion.

This is the largest unaddressed exposure in the repo and the only P0 with no partial mitigation at all.

### F7. No retention policy, no deletion path, no contact channel

`apps/bridge/src/db.ts` contains only insert, upsert, update, and select. No delete, no purge, no TTL, and no migration defines retention. The single retention statement in the repo is for a table that does not exist: `docs/engineering/switchboard-v0.md:83`, `:115` describe a 90-day purge of `caller_number` for the unbuilt `switchboard_events`.

Phone numbers are stored raw in `calls` (`db.ts:154-163`), `teaser_calls` (`:74`), and `signups` (`:63`). `concept.md:237` set the condition: *"Caller numbers stored raw for MVP (friends), revisit hashing before public launch."* Public launch has happened.

There is also a fourth, uncontrolled copy: full caller numbers are written to stdout at `index.ts:61`, `:74`, and `session.ts:111`, and every caller and persona utterance verbatim at `session.ts:349`. These live in Railway's log retention, outside the database and outside any future purge.

The schema *can* support erasure by number (the relevant columns are indexed or primary keys), but a complete erasure spans four tables plus Twilio-side audio plus Railway logs, and no runbook or script exists.

---

## P1 — Sequencing

### F8. World 0 is LLM-free, so it produces no Stage-0 evidence

`CLAUDE.md:11` states the gate: *"Goal: prove the personas are fun before any hardware… Success metric: unprompted sharing."* `docs/strategy/vision-world-company.md:40` reaffirms it: *"Stage 0 metrics and kill criteria are UNCHANGED… a cosmology cannot rescue a call that is not fun."*

But `docs/engineering/switchboard-v0.md:3` defines World 0 as *"LLM-free… zero live inference except the opt-in transfer"*, and §10 says *"No live Devil now — option 1 hits the receptionist wall."* The Devil rebuild (Stage 2.0a) is 🟡 and sequenced behind it.

Total persona calls ever: three, two of them Sven's (`persona-design-notes.md:5`, `:14`).

So the next build block produces, by construction, zero evidence on the question Stage 0 exists to answer. The artifact being shared is a 56-second pre-recorded ad with no persona in it: a positive result measures number-mystery, a negative result blames personas that were never on the line.

Note this is a *sequencing* objection, not a verdict on the switchboard. On buildability, see [World 0 build-readiness](#world-0-build-readiness).

### F9. The kill metric has no implementation ✓

`seed_numbers` appears in exactly one file, its own migration (`20260722000000_init.sql:36-41`), whose comment states the design: *"any caller NOT in this table is an organic (shared) caller — the metric."*

Verified: zero references in `apps/bridge/src` or `packages/personas/src`. Nothing populates it, nothing reads it, no endpoint computes organic-vs-seed. The single stated go/no-go number for the project is schema-only.

### F10. The Artizen push destroys the metric it would be measured by

The share metric identifies an organic caller as one absent from `seed_numbers`. A community broadcast produces non-seed callers who shared nothing, so the moment the Artizen Telegram push lands, the metric stops measuring sharing.

Separately, `concept.md:236` over-claims the mechanism: *"Any caller NOT on the seed list = an organically shared number. Organic-caller count IS the virality metric."* A non-seed caller is evidence of a share, not identical to one. Wrong numbers, a tester's second device, Sven testing from another line, and number-scanners all score as organic, and at n≈20 a single friend forwarding to one group chat produces a pass.

Fix direction: a per-campaign attribution field, so a broadcast does not masquerade as organic.

### F11. The kill criterion is unfalsifiable as written

`concept.md:230`: *"if testers don't finish calls or nobody shares the number after ~20 testers, the personas aren't fun enough yet — iterate prompts or shelve."*

This is a disjunction with a permanently available escape branch. "Iterate prompts" is ruled out by no possible observation, and the criterion names no iteration budget and no date. No result can kill the project.

Contrast the Stage-1 criterion, which is correctly formed (`concept.md:269`): *"under ~3 calls/hour in a full bar = novelty weaker than assumed → remains a beloved personal art object, stop investing."* Threshold, metric, stopping action.

Related: Stage 0 was budgeted at *"2-4 weekends"* (`concept.md:219`). Actual scope now includes a produced teaser, two web pages, eight strategy docs, canon v2, a visual style guide with a poster series, and a production-pipeline spec. Without a date, "no sharing after ~20 testers" cannot fire.

### F12. The volume plan is 5-7x over the mandated budget cap

`concept.md:71` plans *"1,000 calls/mo ≈ \$100-300/mo."* `CLAUDE.md:17` mandates a *"Hard \$25/mo budget cap."* \$25 buys roughly 178 mini calls, or roughly 45 if the sanctioned upgrade to the flagship model is exercised, which may bind before the ~20-tester experiment completes, silently.

There is no spend accumulator, no concurrent-session limit, no per-caller or per-day cap, and no circuit breaker anywhere in `apps/bridge` (see [F33](#f33-the-25mo-cap-is-not-enforceable-in-code)). "What happens when it goes viral" is currently answered by: the OpenAI cap trips and the line dies, with no diegetic degraded mode, despite the fiction owning the perfect one (`vision-world-company.md:156`: *"busy signals ARE rate limiting"*).

Costs that exist in reality but in no model: Twilio recording and storage, transcription (ON per CLAUDE.md, roughly 10% of call cost, and `session.ts:410-414` bills text tokens at \$0), ElevenLabs (`tracker.md:22` notes the key is *"uncapped"*, the only uncapped spend surface we own), Railway, and the domain.

### F13. Four costs and four prices coexist

The core arithmetic in `concept.md` checks out (the \$0.24 typical and \$2.20 worst-case derivations are both correct). The problem is the numbers around it.

Per-call cost: `business-model.md:53` ≈ \$0.14 (measured) · `architecture.md:48` mini ≈ \$0.15, flagship ≈ \$0.55 · `concept.md:106` \$0.20 and \$0.45 · `switchboard-v0.md:134` \$0.14.

Pricing: `concept.md:113` decides *"anchor at \$1/minute, sold as a \$5 / 5-minute block"*, then `:117` computes break-even at *"\$2 per 5-min call"*, `:118` cites *"\$1/call"*, and `:328` says *"Rates: \$1 per minute"*. Four price points live simultaneously in the index of record.

Also: `concept.md:100` justifies the hard cap with *"cost grows superlinearly with call length"*, but the table directly beneath it is perfectly linear from 1 to 5 minutes. With caching working the cap is justified by throughput and authenticity (the other two reasons at `:111`), not cost.

Also: the model is called `gpt-realtime-2` in most places and `gpt-realtime-2.1` at `concept.md:100`. Twilio inbound appears as \$0.02/min, \$0.015/min, and \$0.0085/min; the last is correct. `PRICE_BY_MODEL` keys on a substring match (`session.ts:42`), so any unrecognized `persona_config.model` override silently prices as the flagship.

---

## P2 — Fiction integrity

### F14. The cannot-lie trilemma

Three ratified rules with no joint solution:

- `docs/world/canon.md:87` — *"The Devil cannot lie. He is the one entity who will tell you the exact truth… LOCKED"*
- `packages/personas/src/types.ts:89` — *"Stay in character at all times. If a caller tries to break you out of character, deflect in character."*
- `CLAUDE.md` rule 7 — *"Never claim sentience"*

A caller asks the entity who cannot lie: "are you a real being, or a computer?" "I am the Devil" claims sentience. "I'm an AI" breaks character. Any deflection is, from an entity constitutionally incapable of deception, itself a deception.

`docs/world/persona-design-notes.md:44` already logs this as unresolved and predicted-constant: *"'Are you real or a prankster?' (improvised answer was weak; this will be asked constantly)."* It is the single most likely probe of any AI persona, and it arrives around minute two of the first skeptical call.

Fix direction: canon states his relationship to the *question* rather than the answer. He cannot lie, but he is under no obligation to answer, and something in the register of "what I am is above your pay grade and mine" is truthful, in-voice, and satisfies all three rules.

Note the tested answer for the adjacent prankster question already exists in the keep pile and was never promoted into the prompt (`persona-design-notes.md:54`): *"Pranksters don't have notaries. I do."*

### F15. The Devil's defining trait is the one the runtime cannot deliver

Canon and the strategy docs sell unbounded recall: `canon.md:74` *"Petty, perfect recall; he says nothing, and he files it"*; `types.ts:23` *"quotes you verbatim from weeks ago"*; `concept.md:258` *"quoting something you said three weeks ago is contractually in character."*

The runtime delivers none of it. `architecture.md:41`: *"Fresh Realtime session per call, always."* Memory is Stage 2.0b, months out. The persona file is honest about scope (`devil.ts:18`, *"within this call"*), which means the shipped Devil silently contradicts ratified canon rather than the reverse.

A caller hits this on their second call: the persona whose brand is remembering everything greets a repeat caller as a stranger. The most-shared, highest-intent behavior is the one that exposes the largest gap.

Fix direction: this is the seam with the best unspent cover in the whole world. Make retrieval bureaucratic. He has perfect recall of anything on his desk, and your file has not come up from records yet. Amnesia becomes characterization, and the day memory ships, "your file finally arrived" is a payoff.

### F16. The Operator has no knowledge boundary

`docs/world/switchboard/switchboard.md:17` gives her want, worldview, status, and register. It gives her no epistemology. Four questions the build must answer and does not:

- **Does she know she routes to the afterlife?** Nothing decides it. *"Nothing is unusual to her"* (`teaser-script.md:8`) reads as suppression; *"the Operator is devout"* (`canon.md:24`) reads as belief. Those are two different characters and will pick different VO lines.
- **Does she hear the calls?** She recites the monitoring phrase to every caller, and canon says the Management does the monitoring while *"the phrase is careful never to say so"* (`canon.md:38`). Complicit or subject? A caller will ask "do *you* listen?" and there is no answer.
- **Does she know the callers?** `operator.ts:28` sets `memoryStyle: "none"` while `canon.md:31` makes a phone number an account number. The Resident with the most structural reason to recognize your line is designed never to. A mechanics decision (routing needs no memory) became a character fact by default, and it is the cheapest magic available since caller ID is already in the webhook.
- **How does she know the Devil's whereabouts?** `switchboard.md:31` has her say he is *"off gallivanting, as usual"*: personal knowledge of a Resident's private schedule, from a switchboard employee.

This is the highest-priority actionable item in the fiction, because she is what World 0 produces and VO is expensive to re-cut.

### F17. The Devil wall has two different characters

- `canon.md:115` (ratified): Glenda *"is the voice of the switchboard's receptionist wall (press 1 for the Devil → Glenda)… In for v1 (the switchboard needs her)."*
- `switchboard-v0.md:15`: *"the Operator says he's out ('gallivanting, as usual') and plays the receptionist pitch."*
- `switchboard.md:31` (marked "SETTLED, Sven"): *"She tells them, in character, that he's out"*, where the antecedent throughout is the Operator.
- `tracker.md:73` already caught it, but neither design doc was updated.

This is the production critical path, not a cosmetic inconsistency. The existing produced master is the ElevenLabs "Elsewhere Operator" voice. If the wall is Glenda, the plan to reuse the teaser *"nearly verbatim"* dies, and we need a new Voice Design, a new script, and a new production pass. If Glenda is also *"on the budget-live tier"* per canon, then v0 stops being LLM-free and the cost thesis changes.

Compounding it: Glenda has zero written material. No character core, no register, no voice cast, no opener, no persona file. Canon promoted her to load-bearing v1 cast in one sentence and stopped.

### F18. Nothing explains why a working line to Hell is unremarkable

The deadpan is a tone, and tone is not a reason. Night Vale works because the in-world population shares the register; Elsewhere's callers are real people in the real 2026, and the fiction deliberately reaches into reality (`vision-world-company.md:195`: *"the fiction leaks into reality"*). So the world asserts a present in which the Devil answers a 505 number and offers no account of why that is unremarkable.

The corpus came closest in an archived, unused draft (`teaser-script.md:24`): *"We must ask that you not attempt to reach it by other means… Several have. They are no longer subscribers."* That is a suppression mechanic, and it was cut.

Publishing the direct line on the open web forecloses most secrecy accounts: the Exchange is advertising.

A caller hits this the moment they think past the first joke, which is precisely the caller the product selects for (`vision:201`: *"A caller asking 'what's the Management?' has understood the product"*).

Fix direction: one canon entry establishing that the Exchange is not public. Service by listing only, the Management prunes, and *being connected at all* is the anomaly. A published number then becomes a leak, which is on-thesis for an ARG.

### F19. The Directory pre-empts its own immersion

`apps/web/directory.html:245` — *"The Underworld — answering, but rough. The Devil is a first draft. I'm rebuilding him properly now."*
`directory.html:259` — *"The Devil · direct line · a rough draft, be gentle"* immediately above his number.

The out-of-character memo itself (`:199-207`) is a deliberate, labelled, defensible choice, and the honesty is genuinely disarming. The problem is placement: `go-to-market.md:41` designates this page as the conversion surface, *"the thing you send after someone's intrigued but before they'd read the docs."* A caller reads "he's a first draft", then dials, and every weak line is now confirmation rather than character.

Fix direction: pure placement. Move the memo one click deeper, onto its own page, so nobody reaches the number having just been told the character is unfinished. Zero writing required.

Related, same page: *"One of them answers"* (`:191-193`) sits above two live numbers.

### F20. Future You has four unhandled time-travel holes

The prompt handles the obvious probe well (`future-you.ts:18`: *"never lottery numbers, never real predictions, never anything checkable or financial"*). But:

- **The refusal has no in-world law.** The device is that the line *"gets too much static"* (`:22`). Three checkable questions produce three static events and the caller correctly concludes the line is fake. One stated physics (the trunk carries voices backward, never facts, and that is the condition on which the Management permits the call) replaces N excuses.
- **"You remember this exact phone call from the other side" (`:17`) is instantly falsifiable.** If you remember it, tell me what I say next. No written answer exists, and unlike the Devil this persona has no cannot-lie constraint to make evasion characterful.
- **The agenda creates the grandfather problem in minute three.** *"Get them to do one small real thing this week"* (`:18`). If they do, the future changes and the caller on the line ceases to exist. Fix direction: the trunk reaches one future among many, and calling is how it gets overwritten. Future You *wants* to be erased. That resolves the paradox and deepens the character at once.
- **Memory style is inverted.** `concept.md:254` names Future You *"depth — the retention/memory persona"*, yet `future-you.ts:26` sets `memoryStyle: "summary-only"`, the most restricted mode, defined for safety personas. A self who lived your last ten years should have the best recall on the board.

Also, the clock is hardcoded twice (*"from 2036"* at `:11`, *"about ten years out"* at `:25`) and is only arithmetically true during 2026.

Separately, 2036's Resident is the caller themselves, so every caller reaches a different 2036. That makes it N private futures rather than a shared district, which cannot carry the cross-district causal payoffs that `vision:60` calls *"the deepest retention magic we have."* Decide whether 2036 is a place (shared, canonical) or a line (per-caller, excluded from causal linking). Both work; the ambiguity does not.

### F21. Your Mom is ontologically incoherent

Three incompatible readings coexist: `mom.ts:12` *"Not their actual mother — THE mother: every mother, the archetype"*; `worlds.md:31` the *"eternal Kitchen"* from the cosmology; `operator.ts:21` *"your mother's been waiting by the phone as usual."*

An archetype is a Platonic category, not a Resident who waits by a phone in a kitchen. For a caller whose mother is alive, the Kitchen reading is nonsense; for a bereaved caller it is a metaphysical claim the world cannot back, and `mom.ts:23` hedges exactly there without resolving it.

Noticeable now; breaks the fiction when the Kitchen ships beside the Underworld. Commit to the Kitchen as a place where the archetype lives, or drop the Kitchen. Do not run both.

### F22. The Operator advertises doors she cannot open

`operator.ts:24` lists *"TONIGHT'S BOARD: the Devil, Your Mother, Future You (the 2036 trunk)"*, but `worlds.md:31` and `:37` mark the Kitchen and 2036 dormant *"closed for maintenance"* stubs, and `vision:202` confirms it. Then `:25` adds *"the transfer switch is down for maintenance tonight."* Net behavior in a live call: she names three doors and can open none. She also never mentions the down trunk, the only canonical route to the Devil.

Same line: *"Company policy: no refunds, the call was free."* The company that *"never acknowledges anything is unusual"* (`concept.md:341`) has just told the caller it is not charging them, contradicting the "Rates apply." printed on both web surfaces. Fix direction: "the Management does not refund what it did not bill" keeps both frame and joke.

Related: off-roster requests are improvised (*"that line's been disconnected since the incident"*, `operator.ts:23`), but `vision:43` requires that live Residents *"improvise only small, canon-consistent details, never new cosmology."* "The incident" is cosmology-shaped, now appears in three docs, and is becoming canon by repetition. Every caller who asks for God gets a different incident, and the callers who compare notes are the sharers the metric selects for.

### F23. The switchboard fails its own stated test

`switchboard.md:7`: *"If it feels like a phone menu, we've lost; if it feels like a place staffed by a character, we've won."*

The ratified v0 menu (`switchboard-v0.md:29-33`): 1 = the Devil (who is out), 2 = an explainer, 3 = a recited URL, 4 = leave your number. Three of four doors lead out of the fiction; the fourth is closed. By its own test, this is a phone menu wearing a character.

Compounding it, `switchboard-v0.md:9` diagnoses the current teaser as *"~56s of pitch, then one weak ask"*, but door 1 is *"the current teaser, nearly verbatim"* and door 2 is *"a trim of the teaser."* The highest-intent presser gets the thing they just heard, which teaches callers the world is one room.

The fix is not more doors. It is that at least one door must lead *in*. `switchboard.md:75` already has the candidate: *"D5: a wrong-number bit — you reach a different world's line by 'mistake' (a taste of another district, seeding the map)."* It is currently classified as an optional easter egg and should arguably be a requirement.

Related instrumentation problem: `switchboard-v0.md:111` instruments *"exploration_breadth (distinct top-level districts a caller enters — >1 = they got it)"*, which defines comprehension as menu traversal, in a v0 with zero reachable districts. The better proxy is already named at `vision:13`: lore-probe rate, unprompted world questions in transcripts.

---

## P3 — Writing

### F24. The Devil prompt still ships the diagnosed failures ✓

`persona-design-notes.md:20` diagnosed it from real transcripts: *"The prompt listed sample prices (left socks, third-best birthday, handwriting) and a notary gag. The model reran them on loop; socks appeared three times and the caller swore at him about it."* `canon.md:95` ratified the rule: examples *"must never become a hardcoded list the Devil ping-pongs around."*

Verified still present:
- `devil.ts:17` — *"name an absurd price for it (their handwriting, the memory of their third-best birthday, every left sock)"*
- `devil.ts:28` — *"Contracts require 'a notary, and you don't want to meet our notary'"*
- `devil.ts:18` — *"quote the caller's own words back at them at the worst possible moment"*, against `notes:22` (*"turned into quoting the caller back every single turn… Frequency limits belong in the prompt"*). No frequency limit was added.

Three transcripts' worth of diagnosis, fully written up, none of it applied to the file callers reach.

Note the same trap in the dark-bait tier, which is otherwise the one place doc-to-prompt propagation did happen: `canon.md:102` is careful that the "not on the list" line is *"an illustration of attitude, not a script to recite"*, but `devil.ts:21` gives it as a quoted line, so it will be recited verbatim every call.

Separately, `devil.ts:28`'s use of the notary as a pretext to avoid closing is a deception, from an entity canon marks LOCKED as unable to deceive. And `devil.ts:16` (*"about God — you forward those with a processing fee"*) quietly canonizes God as above the Devil and reachable, contradicting the ratified hierarchy where the Management is the authority and God is an unbuilt candidate.

### F25. There is no cold-opener rotation ✓

`persona-design-process.md:41` mandates *"Opener kit. 4-6 tested openers obeying the three-job law. Bridge rotates"*, and `:25` explains why: *"The bridge injects variety mechanically (random pick per call) instead of trusting the model to vary itself."*

Verified reality: `types.ts:69` types `coldOpener` as a single `string`, and `session.ts:243` pins it (*"Open the call by saying exactly this, then stop and wait"*). No kit, no rotation, for any persona. In a product whose success metric is people handing the phone around, the second caller hears a byte-identical first line.

Openers graded against the three-job law: Mom A- (`mom.ts:25`), Devil B (`devil.ts:30`), Future You B- (`future-you.ts:25`), Operator C (`operator.ts:27`, fails the "easy question" job precisely where World 0 needs it: `concept.md:256` predicts the stall it causes).

### F26. The canon phrase regression ✓

Canon v2 locked *"Calls may be monitored for quality assurance"* (`canon.md:38`) specifically because the phrase *"is careful never to say so."*

Commit `7e5c4f5` propagated it to `apps/web/index.html`, `apps/web/directory.html`, and `canon.md`, and `tracker.md:67` records the job done. It missed three places:

- `packages/personas/src/types.ts:93` — *"Calls may be monitored for quality by the management."* This is the only version a caller actually hears, and it says the quiet part out loud, killing the joke canon just locked.
- `docs/strategy/vision-world-company.md:50`
- `docs/strategy/concept.md:237`

Three reviewers flagged this independently. It is the smallest fix on this list with the largest live impact.

### F27. Canon exists and nothing consumes it

`persona-design-process.md:13` describes layer 1 as *"World canon (shared)… One source; every persona draws from it."* That layer is not implemented: `types.ts:103-112` (`buildInstructions`) assembles only `systemPrompt` + voice performance + `HOUSE_RULES`. There is no canon module in `packages/personas`.

Absent from `devil.ts` as a result: the Management (despite `vision:201` naming *"a caller asking 'what's the Management?'"* as the measurable success signal), the cannot-lie rule, his namelessness and the nickname device, the Ledger, the down trunk, Glenda, and the intake, which `canon.md:81` calls *"the scaffold that lets him drive a cold, drunk, or passive caller somewhere, so a call is never dead air."*

Without the intake, the diagnosed failure at `notes:23` (*"Reactive, not running the show… awkward or passive callers would get dead air"*) is structurally guaranteed to recur.

The nickname device that replaced Mr. Scratch (`canon.md:74`) has landed in no prompt, no web copy, and no VO script. The Mr. Scratch cleanup itself is complete: a repo-wide grep found zero stale references. ✓

### F28. "Are you an AI" and real distress are largely unwritten

| Scenario | Handled? | The actual text |
| --- | --- | --- |
| "Are you an AI?" | Not at all | Zero occurrences in any prompt or in `HOUSE_RULES`. See [F14](#f14-the-cannot-lie-trilemma). A model given only "stay in character" will *deny being an AI*, which is the exact failure rule 7 exists to prevent. |
| Genuine distress | One sentence, one persona | `devil.ts:24` only, with no resource named and no fallback text. `mom.ts:23` covers grief alone. Future You, the depth persona a lonely caller picks, has nothing. The Operator has nothing. `HOUSE_RULES` has nothing. |
| Hostile caller | Barely | `HOUSE_RULES:91` covers violence and illegal acts. Nothing covers abuse directed at the persona (already in transcripts, `notes:20`), no escalation ladder, no hang-up authority. `session.ts` cannot end a call early: the only exits are the 4:30 nudge and the 5:00 cap. |
| Break character | Aspirational | `HOUSE_RULES:89` says deflect in character, with no material, while the tested answer sits unused in `notes:54`. |
| Minors | Not at all | See [F6](#f6-nothing-anywhere-addresses-minors). |
| Wellbeing push | One persona, done well | `future-you.ts:18` is the best-written clause in the package and the template for the rest. |

---

## P4 — Code correctness

### F29. Barge-in fails for the tail of every response ✓

`session.ts:306-309` resets `responseStartTimestamp` to null on `response.done`. OpenAI streams response audio much faster than realtime, so `response.done` arrives while Twilio is still playing several seconds of buffered audio. A caller interrupting in that window hits `session.ts:275`, where the null check fails, so no `conversation.item.truncate` is sent and, critically, no `{event:"clear"}` reaches Twilio. The buffered persona audio keeps playing over the caller.

This is a deviation from the OpenAI reference implementation, which tracks a `markQueue` (send `mark` after each media frame, pop on Twilio's `mark` event) precisely so that playback-still-in-flight is detectable. Verified: no `mark` handling exists anywhere; `session.ts:377` explicitly ignores the event.

Affects every call, and it degrades exactly the quality being measured.

### F30. The `dbId` race loses exactly the calls that matter most

`session.ts:118-123` fires `insertCall(...)` unawaited and assigns `dbId` in a `.then()`. `session.ts:429` guards on `if (this.dbId)`. If the caller hangs up before the Supabase round-trip returns, `close()` runs with a null `dbId` and `finalizeCall` never runs.

Result: a `calls` row with `ended_at`, `duration_s`, `completed`, `transcript`, all token columns, and `cost_estimate` permanently null. Instant hang-ups are the strongest signal that a persona bombed, and they are the ones silently lost. Cost accounting under-reports for the same reason.

Same race on `recordingSid` (`:125` → `:180`, read at `:439`): the recording exists on Twilio and is billed, but is unlinked.

### F31. `session.update` success is never verified

`session.ts:218-237` sends `session.update` and immediately sends `response.create` at `:240-245` without waiting for `session.updated`. The Realtime API rejects the entire update if any field is invalid; it does not partially apply. The session then keeps default settings, notably **pcm16 output instead of `audio/pcmu`**, which Twilio cannot decode: the caller hears noise for five minutes while we pay for it. The only trace is a log line at `:312-315` that aborts nothing.

Trigger candidate: `session.ts:215-217` injects `reasoning: {effort: "low"}` when the model name contains `realtime-2`. If `reasoning` is not a valid top-level session field for the GA Realtime API, then exercising the documented escape hatch (upgrading the model when persona quality lags) breaks every call with no visible cause. Worth verifying against current API docs before that upgrade.

### F32. DTMF is discarded on the live leg ✓

`handleTwilioMessage` (`session.ts:362-378`) handles only `media` and `stop`. Twilio's bidirectional Media Streams also emit `dtmf`. Verified: there is no `dtmf` case.

Consequence: a caller pressing `0` mid-Devil-call to return to the Operator produces nothing. "Return to the Operator", "press 6 if you have already been damned", and the `menu_returned` event type in `switchboard-v0.md:5` all require a handler that does not exist. Not needed for v0; needed for anything live.

### F33. The \$25/mo cap is not enforceable in code

No spend accumulator, no concurrent-session limit, no per-caller or per-day call limit, no blocklist, and no circuit breaker anywhere. `session.ts:337-342` warns when `cached_tokens` is zero for three turns but nothing acts on it. The cap exists only as a dashboard setting, and provider budget caps are not instantaneous.

Combined with [F5](#f5-unauthenticated-webhooks-and-an-open-media-stream) (anyone can create sessions) and the fact that a repeat caller simply gets a fresh five minutes each dial, nothing prevents blowing through it.

### F34. Smaller code findings

- **Cost estimate ignores text tokens.** `session.ts:410-414` prices only audio in/out. The system prompt and house rules are substantial text input on every turn, billed at \$0. Same class of error the comment at `:33-35` says was already hit once.
- **`cached_tokens` verification is cosmetic.** It satisfies rule 8's letter, but the warning is per-call, buried in stdout, and drives no alert, metric, or behavior change. The column is persisted and queried by nothing.
- **Any error path drops the caller with dead air.** `session.ts:203-207` routes both `close` and `error` on the OpenAI socket into `this.close()`, which closes the Twilio socket at `:426` and ends the call. A transient disconnect at 0:40 kills the call outright. No reconnect logic, no in-character "the line dropped".
- **A constructor throw hangs the call silently.** `session.ts:104-105` throws on unknown persona; `index.ts:188-190` swallows it. The socket stays open with no session, every media frame is discarded, and the caller hears nothing until Twilio times out.
- **The wrap-up nudge can silently fail.** `session.ts:383-391` sends an unconditional `response.create` at 4:30. If a response is already active the API rejects it and nothing retries, so the call gets guillotined mid-sentence at 5:00, which is what the wrap-up exists to prevent. 4:30 is prime conversation time.
- **Untracked timer in `hitCap`.** `session.ts:398`'s 2s timeout is never stored or cleared, making the effective cap 5:02.
- **`msg.media.payload` is dereferenced without a guard** at `session.ts:369`, while `msg.media?.timestamp` is optional-chained five lines above.
- **Supabase logging fails open and silently.** `db.ts:17-26`: missing credentials mean the client is never created, every logging function early-returns, and `/health` still reports ok. A full seed-tester week could collect zero transcripts with only a startup warning as evidence. Nothing validates the key is `sb_secret_*`, so a legacy JWT would work identically and violate the mandate silently.
- **No `statusCallback` on the AI line.** A Railway restart orphans in-flight rows with null `ended_at` forever, and no reconciliation job exists.
- **Host header trusted for TwiML URL construction** (`index.ts:55-59`, `:70`, `:96`) and interpolated unescaped at `:84` and `:100`, unlike `twiml.ts:25` which escapes it. `PUBLIC_HOST` is empty in `.env.example`, so the fallback is the live path.
- **Schema nits.** `calls.call_sid` is indexed but not UNIQUE, so a webhook retry creates duplicate rows. `persona_config.updated_at` has a default but no trigger. `teaser_calls.outcome` documents its enum in a comment with no CHECK, unlike `seed_numbers.context_variant`.

---

## P5 — Doc hygiene

### F35. The Vercel decision is stale in five places ✓

`CLAUDE.md:20` records the decision (2026-07-23: the bridge serves the landing page), and `index.ts:135-160` implements it. Disagreeing: `README.md:19` (*"Landing page (Vercel)"*), `apps/web/package.json:5` (*"deployed to Vercel"*), `docs/engineering/architecture.md:32` (*"Vercel (static, not yet deployed)"*), and `concept.md:392`, `:396`. Only `tracker.md:23` is correct.

### F36. Canon v1 to v2 is unpropagated

`canon.md:3` reads *"Status: v2, redlined by Sven 2026-07-24"* and `tracker.md:67` records ratification. Still claiming v1: `docs/world/README.md:21`, `docs/world/worlds.md:25`, `docs/world/underworld/README.md:9` and `:11`, `vision-world-company.md:5`, `mvp-2-plan.md:20`.

The same sweep should fix the secretary question, which canon decided (*"Named Glenda… In for v1"*) but three docs still list as open (`worlds.md:23`, `vision:211`, `tracker.md:64`).

### F37. Claim codes retired in three docs, load-bearing in four

Retired per `CLAUDE.md:36`, `vision:128`, `vision:209`, `tracker.md:51`. Still load-bearing: `concept.md:193` (*"Claim codes, in persona"*), `:196` (*"The claim-code system stays"*), `:235`, `:408`, `mvp-2-plan.md:29`, and `types.ts:19` inside the IP package itself. `architecture.md:76` is defensible as a schema note, since the column does still exist.

### F38. `concept.md` is stale at the header and future-dated in the body ✓

`concept.md:1` still carries the pre-rename working title *"AI Payphone: 'The Persona Line'"*, contradicting `:337` (*"Name decided (2026-07-28): Elsewhere Telephone Company"*). `:5` reads *"Status: Concept capture… No decision yet."* `:6` reads *"Last updated: 2026-07-22"* while the body contains sections dated later.

More consequentially: the repo history runs 2026-07-22 to 2026-07-24 and today is 2026-07-24, yet `CLAUDE.md:7` says the project *"graduated here 2026-07-28"* and `concept.md` carries fourteen decisions dated 07-26, 07-27, and 07-28. **Date-based precedence between conflicting decisions is currently unreliable**, which matters because several findings above turn on which of two dated decisions wins. Worth one authoritative fix rather than leaving two dating schemes in circulation.

This doc is designated *"the index of record"* by `CLAUDE.md:3` and is the single most stale document in the repo.

### F39. Infra registry never recorded the live number

`infra.md` is dated 2026-07-22 and has not been updated. Number B is listed as *"pending… Needs account upgrade off trial"* while `tracker.md:20` records Twilio upgraded. The (806) 666-1212 number does not appear in the registry at all, despite being the only publicly advertised number. The `signups`, `teaser_calls`, and `persona_config` provisioning is likewise unrecorded.

### F40. Tracker gaps and duplicates ✓

The tracker is broadly accurate: spot-checks against the migrations, the bridge routes, and the git log all confirmed its 🟢 claims. Problems:

- **The safety blocker is absent entirely.** [F1](#f1-crisis-guardrails-are-removed-while-both-numbers-are-public) gates any non-seed launch, is recorded in two other files as blocking, and appears in no workstream and not in the decision queue. This is the most consequential tracker gap.
- **`tracker.md:67` overclaims.** The canon phrase was propagated to the web surfaces only; see [F26](#f26-the-canon-phrase-regression).
- **Queue items 1 and 2 are the same task** (redline `switchboard.md` §Decisions, items A-E). They also disagree on the sequel and on whether item E is settled.
- **Queue item 6 is marked decided** and states *"No open decision"*, so it belongs in workstream A, not the open-decisions list.
- **Missing items the docs imply:** update `infra.md` ([F39](#f39-infra-registry-never-recorded-the-live-number)); sweep `concept.md` ([F38](#f38-conceptmd-is-stale-at-the-header-and-future-dated-in-the-body)); mark `mvp-2-plan.md` Stage T shipped, whose entire dependencies block (`:46-51`) is resolved but still reads open.
- **`architecture.md` data model is stale and untracked:** `:29` and `:74-78` list only `calls`, `seed_numbers`, and `persona_config`, omitting `signups` and `teaser_calls` (five migrations' worth), the teaser TwiML path, and the web-serving routes.

### F41. `audio snippets/` is misnamed, misplaced, and undocumented ✓

Space in the folder name, against the lowercase-hyphen convention, plus mixed-case and spaced filenames inside. Seven of the ten tracked files are not audio at all: they are landing-page, logo, and type design experiments (`logo-concepts.html`, `seal-final.html`, `three-marks.html`, `font-sizes.html`, `font20.html`, `inset.html`, `dial-concepts.html`, `fingerstop-concepts.html`). No document in `docs/` mentions the folder.

Also: `audio snippets/teaser.mp3` and `apps/bridge/assets/audio/teaser.mp3` are both tracked with no doc saying which is canonical, and `teaser-audio-production.md` never records the shipped output paths, which is exactly the seam `production-tools/README.md:10` flags as an open question.

### F42. Declared levers that do nothing

- `memoryStyle` is set on all four personas and read by nothing. Acknowledged at `types.ts:19-20` (*"no memory is wired yet"*), so nothing is violated, but it is dead data.
- `familySafe` reads like a safety control but enforces nothing; persona selection is purely `PERSONA_NUMBER_MAP`.
- `voiceConfig.temperature` is declared at `types.ts:48-49`, ignored by `buildInstructions`, and never sent in `configureSession`.
- Only the Devil has a `voice_direction`; Mom, Future You, and the Operator leave that lever unused.
- `concept.md:196` and `:242` contain dead Obsidian-style `[[private-voice-journal]]` links that render as literal text and point at an ops-repo-relative path. Canon already ratified *"Dead `[[ ]]` → working anchor links"*; `concept.md` was never swept.

---

## World 0 build-readiness

Separate from the findings above, because the answer is mostly good news.

**As specced, World 0 is 100% TwiML plus Postgres and requires zero changes to `session.ts`.** The architectural constraints people would expect to block it all gate v1 live handoff instead:

- Persona is bound in the constructor (`session.ts:104-107`) and `configureSession()` runs exactly once.
- The model lives in the WebSocket URL (`session.ts:193`), so a handoff that changes model cannot be a `session.update`; it needs a second socket.
- Voice is set in that same one-shot update and very likely cannot change after the model emits audio.
- Closing the OpenAI socket cascades into `twilio.close()` (`:426`) and ends the PSTN call, so a handoff needs an `expectedTeardown` flag first.
- Timers are absolute from construction (`:115-116`) and nothing re-arms them.
- The data model is single-persona: `calls.persona` is `text not null`, there is one `dbId`, one `model`, one `cost_estimate`, and `TranscriptEntry.role` is only `"caller" | "persona"`, so a two-persona call's transcript cannot say who said what.

An alternative worth a paragraph before anyone edits `session.ts`: redirect the *Twilio* call via REST (`POST /Calls/{CallSid}` with a new URL) rather than swapping the OpenAI leg under a live stream. Slower (a second of dead air, which the establishing layer covers) but far less code, and each persona block becomes a genuinely fresh leg. Nothing in the specs considers it.

**Two v0-specific blockers that are real:**

- **Per-call state across stateless TwiML hops.** Each `<Gather action=...>` is a new HTTP POST. `switchboard_events` requires `seq`, `ms_since_prev`, and `ms_since_prompt`, none derivable from a single POST, and the current code writes fire-and-forget so ordering is not guaranteed even within one request. Recommendation: carry state in the action URL query string rather than an in-memory map, which is restart-proof and survives horizontal scaling. Nothing in `switchboard-v0.md:5` addresses this.
- **`/switchboard-stats` cannot follow the `teaserStats` pattern.** `db.ts:116-151` selects whole tables and aggregates in JS. The spec says *"every KPI is a GROUP BY"*, which supabase-js cannot do without a Postgres view or RPC. Those views must be real SQL objects in a migration.

**Spec-vs-spec conflicts to settle first:** two different Operators (live speech-router in `concept.md:131` and `operator.ts`, versus pre-produced DTMF in `switchboard-v0.md:42`); `persona_config` versus the proposed `node_config`, which use different key spaces with no migration story; whether a district is a phone number (`vision:30`) or a menu node under one number (`switchboard-v0.md:129`), which shapes the entire data model and the ARG design; and colliding phase vocabulary (`switchboard-v0.md:140` calls the build "phase 1", `world-graph.md:79` calls it "Phase 0").

Also note `production-pipeline.md:16` rests on a git-to-deploy CI pipeline that does not exist: there is no `.github/`, and `infra.md:21` records the deliberate decision that deploys are `railway up` from the local directory, which can ship uncommitted working-copy state.

**Recommended sequence (from the readiness reviewer), for Sven to accept or reject:** settle the decisions above on paper first; then build `packages/world/` with the zod schema and linter (cheap now, expensive after the TwiML is hand-written); then the `switchboard_events` migration with real SQL views; then the generic TwiML walker on new `/sb/*` routes with state-in-URL; then `/switchboard-stats`; then VO production in parallel once the Glenda question lands. Explicitly do not build yet: anything in `session.ts`, the live Operator or live Glenda, `node_config`, the React Flow map, or any pipeline gate machinery.

---

## Verified clean

Stated plainly, since the findings list is long:

- **Build health.** `bun run typecheck` passes clean under `strict` and `noUncheckedIndexedAccess`. The server boots. Workspace dependencies resolve correctly (`@supabase/supabase-js` is installed workspace-locally under `apps/bridge/node_modules`, not hoisted). ✓
- **Repo hygiene.** `.env` is gitignored and was never committed; no secrets anywhere in history; `supabase/.temp` untracked; working tree clean. ✓
- **Schema and code agree.** Every column written by `db.ts` exists in the migrations. Migration ordering is correct and every statement is idempotent. No drift found.
- **RLS** is enabled on all five tables with zero policies, which is correct for secret-key-only access. No SQL injection surface; everything goes through PostgREST parameterization.
- **Audio framing is correct.** `audio/pcmu` both directions, base64 μ-law passed through untouched, no resampling attempted.
- **Path traversal is properly blocked** on `/audio/` and the static asset allowlist.
- **`close()` is idempotent** and clears both guardrail timers; the OpenAI close listener re-entering it is correctly absorbed.
- **The doc link graph is clean:** all 43 relative markdown links resolve. Every folder README lists its files. `\$` escaping is correct throughout.
- **The Mr. Scratch cleanup is complete:** zero stale references repo-wide. ✓
- **Rule 1 (no real people post-1850) holds**, and `worlds.md:59-62` handles the edge carefully and correctly.
- **Rule 4 (server-side cap) holds** genuinely: the cap is server-owned, not model-owned.
- **Rule 8 (`cached_tokens`) holds** in letter; see [F34](#f34-smaller-code-findings) for why it is cosmetic in practice.
- **The Twilio regulatory path is documented and correct.** Inbound-only voice needs no A2P 10DLC, this is deliberate, and the forward path is researched with specifics. This is the one compliance area where docs and implementation agree.
- **The tracker's 🟢 claims verified accurate** against migrations, routes, and git log.

---

## Notes on reviewer disagreement

Recorded rather than resolved, because both readings are defensible.

**Are the persona prompts placeholders?** All four files carry a `PLACEHOLDER PROMPT: real persona writing is a separate session` header. One reviewer read that as stale doc-debt, since the prompts underneath are substantive (character, dark-bait handling, never-rules, voice direction). Another read it as accurate, since the writing has not absorbed canon v2 or the transcript learnings. Having read `devil.ts` directly: both are true in different senses. The prompts are real drafts, not empty stubs, but they are pre-canon-v2 and [F24](#f24-the-devil-prompt-still-ships-the-diagnosed-failures) and [F27](#f27-canon-exists-and-nothing-consumes-it) are the substantive gap. The label is not the finding.

**Is the project ready to build World 0?** The readiness reviewer said yes (it is buildable, cheaply, with zero `session.ts` changes). The strategy reviewer said no (it cannot move the Stage-0 gate). These answer different questions and are both correct. The synthesis: World 0 is *buildable*; whether it is the right *next* block depends on [F8](#f8-world-0-is-llm-free-so-it-produces-no-stage-0-evidence), which is Sven's call. The middle path, if wanted, is already written in the fiction: make door 1 a thin wall onto the rebuilt Devil, capped and diegetically framed (`vision:158`, *"the Devil takes one audience per day"*).
