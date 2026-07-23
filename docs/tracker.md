# Elsewhere — work tracker

The working board until we move to a real ticketing system. Updated as things move. Four workstreams. Newest status at the top of each.

**Legend:** 🔴 blocked-on-Sven · 🟡 in progress · 🟢 done (recent) · ⚪ queued

---

## A. Infra & ops
Numbers, hosting, DB, domains, the teaser plumbing, landing page.

- 🟢 Teaser timing tuned to Sven's ear — one ring, minimal gap (dropped `<Pause>`, 0.35s lead silence), barge-in "press one at any time"
- 🟢 Teaser line **(806) 666-1212** live — routes, signups table, deployed
- 🟢 Devil line **(505) 551-3551** live (bridge, guardrails, logging, recording)
- 🟢 Railway bridge, Supabase (new keys), Twilio upgraded off trial
- 🟢 Domain **elsewheretel.co** purchased
- 🔴 **ElevenLabs Starter (\$5/mo)?** — decision gates final teaser VO + future character voices
- ⚪ Landing page at elsewheretel.co (static tariff card) — build after teaser VO
- ⚪ Point elsewheretel.co DNS (Vercel) — with landing page
- ⚪ Signup notification mechanism (outbound SMS/call = A2P/TCPA) — defer, manual round at friend-scale

## B. Strategy & concept
The vision, positioning, business model, pitch. Mostly docs.

- 🟢 Vision doc complete (`vision-world-company.md`) — world company, districts, ontology, production layers, economics
- 🟢 World One locked: the Underworld
- 🟢 Pitch drafted (one-liner / 30s / 90s) — tested informally, "good"
- 🔴 **Vision redlines** (`vision-world-company.md` §8): Management cosmology · Mrs. Devil · terminology table · in-world name for the Underworld exchange
- ⚪ Artizen framing (art-drop launch, funding, AR/VR collaborators) — later

## C. MVP build (World One)
Per `mvp-2-plan.md`. The actual product.

- 🟢 Runtime persona config (3 levers: model / voice / personality) — DB-driven, no redeploy
- 🟡 Stage 2.0a — **Devil rebuilt**: canon v1 + Devil bible + mechanics (opener kit, silence timer, day-mood). BLOCKED on vision redlines (canon needs the cosmology decision)
- ⚪ Stage 2.0b — Subscribers (identity: caller-ID + claim codes + memory)
- ⚪ Stage 2.0c — First overworld pieces (one IVR, one voicemail box, one secret extension)
- ⚪ Stage 2.0d — Launch surfaces (landing page, Yellow Pages v0)

## D. Persona & world writing
The IP: prompts, canon, lore, the transcript flywheel.

- 🟢 Persona format + 4 stubs; design process v1; design notes (calls 1-3)
- 🟢 Devil dark-bait deflection added
- 🟢 Teaser script DECIDED — Draft B (Sven edited: "since 1666", subscribers list, eternal ledger)
- 🟡 Devil bible — waiting on canon (see 2.0a)
- ⚪ Canon v1 (`canon.md`) — postcard: Exchange, Management, Devil personnel file — waiting on redlines
- ⚪ Weekly transcript-review loop (lore harvest → ratify → canon)

---

## Open for Sven (consolidated decision queue)
1. **ElevenLabs \$5/mo:** yes/no — unblocks final teaser VO (+ pickup foley) + character voices. Teaser is send-ready the moment this lands
2. **Vision redlines:** Management cosmology · Mrs. Devil · terminology · Underworld exchange name — unblocks ALL canon/Devil-bible work
3. (verify) Call (806) 666-1212 — does the ring/timing feel right now?

## Cadence
Commit per change set; push in intervals; this tracker updated each working session. Real hygiene (branches/CI/PRs) when we exit prototype phase.
