# Elsewhere — work tracker

The working board until we move to a real ticketing system. Updated as things move. Four workstreams. Newest status at the top of each.

**Legend:** 🔴 blocked-on-Sven · 🟡 in progress · 🟢 done (recent) · ⚪ queued

---

## A. Infra & ops
Numbers, hosting, DB, domains, the teaser plumbing, landing page.

- 🔴 **Pre-launch consent/security gates — open, numbers already public** (2026-07-24 review, F2-F5). (a) dual-channel recording starts in the `CallSession` constructor *before* the cold opener, `RECORD_CALLS=true`, and the only notice says "monitored" not "recorded" and only if asked — vs `concept.md:345` "default off"; (b) no `/terms` or `/privacy` route exists and `concept.md:241` says improvement-tier consent can't be retrofitted; (c) `consent_publish` is written by no code and `<Connect><Stream>` leaves no post-call moment, so the "press 2 and it is destroyed" promise has no delete path; (d) `X-Twilio-Signature` still unvalidated (`index.ts:47`) and `/media-stream` upgrades any socket → forged signups + free Realtime sessions on our key. Cheapest interim: `RECORD_CALLS=false` until a pre-roll disclosure exists
- 🟢 Signup capture window FIXED + DEPLOYED (2026-07-24) — teaser is 56s; old single `<Gather>` window (56+4s) missed any "press 1" during the ~7s goodbye. This silently ate EVERY real friend press (Erick +505-204 and ≥1 other both pressed; `signups` was empty). Goodbye now has its own `<Gather>`, main timeout 6s. ⚠️ conversion numbers to date are undercounts
- 🟢 Signup funnel VERIFIED live — press-1 records correctly (`signups` + `teaser_calls.outcome=signup` both landing; confirmed via Sven's own test call). Hardened `setTeaserOutcome` to upsert (was update) so outcome records even if the pickup insert races/fails
- 🟢 **World Graph = the backbone — phased path ADOPTED** (2026-07-24). Source of truth = a git-versioned, `zod`-validated structured graph (worlds/nodes/edges + `node_config` overlay) the bridge walks. **Phase 0** = build the switchboard schema-first + linter in CI (≈0 extra). **Phase 1** = interactive **read-only** React Flow map + basic red/yellow/green status overlay (~3–5d; static Mermaid rejected). **Phase 2** = full production pipeline `production-pipeline.md` (gated content CI/CD: design/linter→assets→produce→sign-off, rollup to staging→production, agent-operable) — SPEC'd now, built later behind triggers. Docs: `engineering/production-tools/`
- 🔴 **v0 Switchboard — designed (arch + experience)**. Build spec `engineering/switchboard-v0.md`; experience/world design `world/switchboard/switchboard.md` (**Switchboard = World Zero**, Operator as a Resident). SETTLED: Devil option hits a **receptionist wall** (current teaser = the Devil's receptionist; no live Devil / no cost yet); SMS deferred (recite URL now); record whole journey (event log + user-journey view, two POVs); Operator pre-produced-now/live-later. Carry infra fix: one ring + confirm connection before VO (fixes cut-off intro). OPEN (brainstorm, `world/switchboard/switchboard.md` §Decisions): menu set/order · Devil-wall copy · fall-through · easter egg · Operator name. Then build phase 1
- 🟢 Teaser analytics — logs EVERY call (teaser_calls: outcome, duration, status, repeat callers via caller_number+created_at). Twilio status callback → duration for dropoff analysis. `/teaser-stats` = calls · unique · repeat · signups · conversion% · avg duration
- 🟢 Teaser timing tuned to Sven's ear — one ring, minimal gap (dropped `<Pause>`, 0.35s lead silence), barge-in "press one at any time"
- 🟢 Teaser line **(806) 666-1212** live — routes, signups table, deployed
- 🟢 Devil line **(505) 551-3551** live (bridge, guardrails, logging, recording)
- 🟢 Railway bridge, Supabase (new keys), Twilio upgraded off trial
- 🟢 Domain **elsewheretel.co** purchased
- 🟢 ElevenLabs Starter active — "Elsewhere Operator" voice saved to library; key uncapped
- 🟢 **Landing page LIVE** — served by the bridge from apps/web (not Vercel; one-system decision). Seal logo (vectorized rotary phone + Special Elite curved text), favicons, click-to-call number, 5 easter eggs. brand-voice tariff card
- 🟢 **`/directory` lore page LIVE** (deployed 2026-07-24) — discoverable via landing footer; `noindex` (flippable to search-public). In-world Directory front-matter + two-voice split (fiction ↔ honest memo). Modern type-scale redesign (70rem canvas, 20px base, fluid scale, multi-column), "old phones" copy removed, em-dash/AIism sweep
- 🟢 **Landing page widened + rescaled** (deployed) — bigger hero tagline, larger number, 50rem frame, legibility bumps. Per type-scale research
- 🟢 **elsewheretel.co LIVE over HTTPS** (root + www, valid certs, Namecheap→Railway). The landing page is publicly reachable
- ⚪ Signup notification mechanism (outbound SMS/call = A2P/TCPA) — defer, manual round at friend-scale

## B. Strategy & concept
The vision, positioning, business model, pitch. Mostly docs.

- 🟢 **Full-repo review FILED** (2026-07-24, `reviews/2026-07-24-full-repo-review.md`) — pre-World-0 checkpoint, seven parallel reviewers (code+schema · docs consistency · strategy/economics · world/canon/personas · compliance vs the 8 rules · World 0 readiness · in-world logic). 42 findings in 5 tiers. Headlines: 3 self-declared safety/consent gates already breached on the public numbers (P0); World 0 is specced LLM-free so it cannot move the Stage-0 "are the personas fun" gate (F8); `seed_numbers` has zero code refs so the kill metric is uncomputable (F9); the cannot-lie / stay-in-character / never-claim-sentience trilemma has no answer to "are you an AI?" (F14); the Devil-wall voice (Glenda vs Operator) is the VO critical path (F17). Also: build is clean, link graph is clean, schema/code agree. **Nothing actioned — Sven triages.** New `docs/reviews/` folder seeded
- 🟢 **Doc-structure discipline ENFORCED** (2026-07-24) — standing rule: on every new doc, review the docs/ tree + add structure if needed + update all READMEs/refs in the same change set. Three layers: CLAUDE.md rule, memory, and a PostToolUse(Write) hook (`.claude/hooks/new-doc-structure-check.sh`) that reminds on any new `.md` under docs/
- 🟢 **Docs: per-world subfolders** (2026-07-24) — `world/` root = generic cross-world docs (worlds/canon/persona-design ×2); each world gets its own folder (`world/switchboard/` = World Zero, holds switchboard + teaser docs). READMEs per folder; refs updated. Also standardized the connection lead-in to **one ring** everywhere (was 2-3)
- 🟢 **Docs restructured by domain** — `docs/{strategy,engineering,world}/` + README index in each; `docs/README.md` is the front door; `tracker.md` stays at root. All cross-refs (CLAUDE.md, README, code comments) updated
- 🟢 **Business model + economics** captured (`strategy/business-model.md`) — revenue streams, pricing fiction, unit economics; **in-lore native sponsorship** idea recorded (the Devil shills Pepsi, resents it)
- 🟢 **Fundraising** captured (`strategy/fundraising.md`) — media-company thesis, Gimlet-lineage comps + strategic-partner/investor angle, raise-on-retention, timing
- 🟢 **Go-to-market** captured (`strategy/go-to-market.md`) — mystery-as-marketing, the (806) line as the pipe, channels, the 3 pitch decks (public/investor/partner), discipline gate
- 🔴 **Artizen Telegram teaser** — draft ready (`strategy/outreach-log.md`), framed light for the Renee/investor optic. Sven to send, then log `/teaser-stats` + feedback. First non-seed audience test
- 🟢 Outreach log started (`strategy/outreach-log.md`) — track every community push + results
- 🟢 **Vision v2 RATIFIED** (`strategy/vision-world-company.md`) — redlines resolved 2026-07-23. Terminology locked (Elsewhere/Exchange/Management/world/line/**Resident**/subscriber/Ledger/back-channel); Management = authorial mask + diegetic changelog; surveillance/observe-don't-lecture theme; cross-district shared timeline core; staged guardrails (call = unit of delivery not story); reachable vs referenced cast; feeling-first cost spectrum w/ characterized latency; phone-number identity (claim codes retired); knowledge-as-save-state; back-channel (async world→subscriber); two-channel diegetic marketing; hardware phones = dedicated physical object; Phreak district = future candidate
- 🟢 Early tester signal (2026-07-24): "very intriguing" ×multiple; spontaneous **Meow Wolf** association (our comp), one "it was fun, I pressed 1." New comp surfaced: **Ministry of Awe** (Philadelphia, phone-based immersive). This is the "understood there's a world" signal, not novelty
- 🟢 World One locked: the Underworld
- 🟢 Pitch drafted (one-liner / 30s / 90s) — tested informally, "good"
- ⚪ Artizen framing (art-drop launch, funding, AR/VR collaborators) — later

## C. MVP build (World One)
Per `engineering/mvp-2-plan.md`. The actual product.

- 🟢 Runtime persona config (3 levers: model / voice / personality) — DB-driven, no redeploy
- 🟡 Stage 2.0a — **Devil rebuilt**: canon v1 + Devil bible + mechanics (opener kit, silence timer, day-mood). UNBLOCKED (vision v2 ratified) — next work block
- ⚪ Stage 2.0b — Subscribers (identity = **phone number** + PIN on shared devices; per-district memory. NO claim codes)
- ⚪ Stage 2.0c — First overworld pieces (one IVR, one voicemail box, one secret extension)
- ⚪ Stage 2.0d — Launch surfaces (landing page, Yellow Pages v0)
- ⚪ Back-channel (async world→subscriber: text/voicemail/callback) — consent-gated (A2P/TCPA), lands w/ 2.1

## D. Persona & world writing
The IP: prompts, canon, lore, the transcript flywheel.

- 🔴 **Crisis/wellbeing guardrails MUST return — launch-gating, was never on this board** (surfaced by the 2026-07-24 review, F1). `personas/src/types.ts:80-86` removed them on the explicit condition they return "before the number goes beyond informed seed testers" — both numbers are now on a public HTTPS page and the Artizen push is queued, so the condition is breached. Only handler today is OpenAI's model-level backstop, which our own notes call "unremovable" = a vendor behavior, not a control we own. Devil FAQ #1 from one real outside caller was "should I die right now?". Writing task, not engineering. Also unwritten: any "are you an AI?" answer (F14/F28 — collides with cannot-lie + stay-in-character), and distress handling beyond one sentence in one persona
- 🟢 Persona format + 4 stubs; design process v1; design notes (calls 1-3)
- 🟢 **Devil visual aesthetic LOCKED** (`world/underworld/devil-visual-aesthetic.md`) — the weary amber-lit mid-century clerk with the horned shadow (human, sinister-charming, not a cartoon devil). Derived a style guide + kept the "Call Me Maybe" poster series (v1-v3, v3=hero) and the exact reproduction prompts, all version-controlled. New `world/underworld/` folder seeded (World One)
- 🟢 Devil dark-bait deflection added
- 🟢 **Teaser SHIPPED (final production)** — ElevenLabs "Elsewhere Operator" (smoky-2 Voice Design) reading v2 script, over living-switchboard bed (eerie drone + chatter + laugh + weep + dial tone), intro'd by real vintage-phone pickup foley (Sven's recording) + synth ringback. Mixed in Audacity by Sven, telephone-mastered. confirm + goodbye also in operator voice. Live on (806) 666-1212
- 🟢 Teaser script DECIDED v2 — depth pass: elsewhere-as-universe, agency, scale, ambience
- 🟡 Devil bible — UNBLOCKED (vision v2 ratified). Core/registers/mood; resolve reachable-cast roster (secretary? notary?) here; Mrs. Devil stays an undefined slot
- 🟢 **Establishing layer** added to universe architecture (vision §5c/§5-ontology/§8) — pre-produced scene-setting (ambient bed + optional narration) that stages the threshold into a Resident; voice-only's stage directions. Zero live cost, bookends live encounters (short live time → rich scene). Open: per-world narrator vs one signature narrator; Operator does the handoff
- 🟢 Worlds register started (`world/worlds.md`) — all districts (Underworld/Kitchen/2036/divine/Phreak) + NEW seed: **the Philosophical realm** (Sven's — big questions, philosophers as sparring Residents; flagged: modern names Camus/Sartre legally out, flavor via invented Residents). Needs a proper brainstorm later
- 🟢 Canon v2 RATIFIED (`world/canon.md`) — Sven's redline in. THE ONE RULE: canon is facts/stances, never scripts (examples illustrate voice; the thin-Devil ping-pong failure). Locked: subscriber's phone number = their line = effectively their soul; "calls monitored for quality assurance" (propagated to landing+directory surfaces); Devil cannot lie (never self-admitted); prices/souls-on-schedule = generative seasoning not cornerstones; intake = procedure not storyline; Glenda the secretary IN v1 (= the switchboard receptionist wall; may-or-may-not be Mrs. Devil); the Devil has NO name — the world calls him affectionate-demeaning folk diminutives (Serpie/Luzi/Beezy/Old Grump…), terrified he hears (he does). Operator nameless (revisitable); down-trunk kept (leans technical, revisitable). Dead `[[ ]]` → working anchor links. Devil bible unblocked
- ⚪ Weekly transcript-review loop (lore harvest → thin-wall detection → ratify → canon)

---

## Open for Sven (consolidated decision queue)
1. **Triage the full-repo review** (`reviews/2026-07-24-full-repo-review.md`) — 42 findings, 5 tiers. Decide what gets actioned and in what order. The three that change sequencing rather than just adding chores: **P0 safety/consent gates** (breached now, cheap to close) · **F8** World 0 is LLM-free so it produces no Stage-0 evidence — build it anyway, or ship the Devil rebuild first, or make door 1 a thin wall onto a capped live Devil ("the Devil takes one audience per day" is already written) · **F17** Devil-wall voice = Glenda or the Operator, which decides whether the produced teaser master is reusable and is therefore the VO critical path
2. **Redline `world/switchboard/switchboard.md`** (the A–E brainstorm) — the last design pre-work. Resolve: menu set/order (A) · the Devil-wall copy (B; now = **Glenda** the receptionist, per canon, not the Operator — but both design docs still say Operator, see F17) · fall-through (C) · easter egg (D) · (Operator nameless, E) · data-model sign-off. Review adds two: the Operator's **knowledge boundary** (F16 — what she knows/must not know, decide before VO is cut) and whether a district is a **phone number or a menu node** (F-readiness — shapes the whole data model). Then → build V0 switchboard = production Phase 0
3. **Send the Artizen teaser** — approve/tweak the draft (`strategy/outreach-log.md`) and post to the Artizen Telegram; then log results. ⚠️ review recommends holding until the P0 gates close: it's our highest-fit non-seed audience and we get one first impression, and the push also breaks the share metric (F10 — a broadcast makes "not in `seed_numbers`" stop meaning "organic share")
4. **Re-ping Erick + the Meow Wolf friend** — their press-1 was lost to the (now-fixed) capture bug; ask them to call once more so it records
5. **Send to more friends** — text (806) 666-1212, watch `/teaser-stats` (now a clean measurement)
6. _(decided — phased path adopted)_ **World Graph** Phase 0 folds into the switchboard build (build it schema-first); Phase 1 map (interactive read-only + status overlay) follows. Full pipeline spec'd, deferred. No open decision — sequences behind the switchboard build. See `engineering/production-tools/`

## Cadence
Commit per change set; push in intervals; this tracker updated each working session. Real hygiene (branches/CI/PRs) when we exit prototype phase.
