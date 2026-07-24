# Elsewhere — work tracker

The working board until we move to a real ticketing system. Updated as things move. Four workstreams. Newest status at the top of each.

**Legend:** 🔴 blocked-on-Sven · 🟡 in progress · 🟢 done (recent) · ⚪ queued

---

## A. Infra & ops
Numbers, hosting, DB, domains, the teaser plumbing, landing page.

- 🟢 Signup funnel VERIFIED live — press-1 records correctly (`signups` + `teaser_calls.outcome=signup` both landing; confirmed via Sven's own test call). NO external signup yet: first friend listened to the full 67s teaser twice but didn't press 1 (watch whether the in-audio CTA lands). Hardened `setTeaserOutcome` to upsert (was update) so outcome records even if the pickup insert races/fails
- 🟢 Teaser analytics — logs EVERY call (teaser_calls: outcome, duration, status, repeat callers via caller_number+created_at). Twilio status callback → duration for dropoff analysis. `/teaser-stats` = calls · unique · repeat · signups · conversion% · avg duration
- 🟢 Teaser timing tuned to Sven's ear — one ring, minimal gap (dropped `<Pause>`, 0.35s lead silence), barge-in "press one at any time"
- 🟢 Teaser line **(806) 666-1212** live — routes, signups table, deployed
- 🟢 Devil line **(505) 551-3551** live (bridge, guardrails, logging, recording)
- 🟢 Railway bridge, Supabase (new keys), Twilio upgraded off trial
- 🟢 Domain **elsewheretel.co** purchased
- 🟢 ElevenLabs Starter active — "Elsewhere Operator" voice saved to library; key uncapped
- 🟢 **Landing page LIVE** — served by the bridge from apps/web (not Vercel; one-system decision). Seal logo (vectorized rotary phone + Special Elite curved text), favicons, click-to-call number, 5 easter eggs. brand-voice tariff card
- 🟡 **`/directory` lore page** — v0 built + screenshotted (hidden, noindex, shareable for 1:1 follow-ups). In-world Directory front-matter + two-voice split (fiction ↔ honest memo). Route wired in bridge. Awaiting Sven's read → then deploy
- 🟢 **elsewheretel.co LIVE over HTTPS** (root + www, valid certs, Namecheap→Railway). The landing page is publicly reachable
- ⚪ Signup notification mechanism (outbound SMS/call = A2P/TCPA) — defer, manual round at friend-scale

## B. Strategy & concept
The vision, positioning, business model, pitch. Mostly docs.

- 🟢 **Docs restructured by domain** — `docs/{strategy,engineering,world}/` + README index in each; `docs/README.md` is the front door; `tracker.md` stays at root. All cross-refs (CLAUDE.md, README, code comments) updated
- 🟢 **Business model + economics** captured (`strategy/business-model.md`) — revenue streams, pricing fiction, unit economics; **in-lore native sponsorship** idea recorded (the Devil shills Pepsi, resents it)
- 🟢 **Fundraising** captured (`strategy/fundraising.md`) — media-company thesis, Gimlet-lineage comps + strategic-partner/investor angle, raise-on-retention, timing
- 🟢 **Go-to-market** captured (`strategy/go-to-market.md`) — mystery-as-marketing, the (806) line as the pipe, channels, the 3 pitch decks (public/investor/partner), discipline gate
- 🔴 **Artizen Telegram teaser** — draft ready (`strategy/outreach-log.md`), framed light for the Renee/investor optic. Sven to send, then log `/teaser-stats` + feedback. First non-seed audience test
- 🟢 Outreach log started (`strategy/outreach-log.md`) — track every community push + results
- 🟢 **Vision v2 RATIFIED** (`strategy/vision-world-company.md`) — redlines resolved 2026-07-23. Terminology locked (Elsewhere/Exchange/Management/world/line/**Resident**/subscriber/Ledger/back-channel); Management = authorial mask + diegetic changelog; surveillance/observe-don't-lecture theme; cross-district shared timeline core; staged guardrails (call = unit of delivery not story); reachable vs referenced cast; feeling-first cost spectrum w/ characterized latency; phone-number identity (claim codes retired); knowledge-as-save-state; back-channel (async world→subscriber); two-channel diegetic marketing; hardware phones = dedicated physical object; Phreak district = future candidate
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

- 🟢 Persona format + 4 stubs; design process v1; design notes (calls 1-3)
- 🟢 Devil dark-bait deflection added
- 🟢 **Teaser SHIPPED (final production)** — ElevenLabs "Elsewhere Operator" (smoky-2 Voice Design) reading v2 script, over living-switchboard bed (eerie drone + chatter + laugh + weep + dial tone), intro'd by real vintage-phone pickup foley (Sven's recording) + synth ringback. Mixed in Audacity by Sven, telephone-mastered. confirm + goodbye also in operator voice. Live on (806) 666-1212
- 🟢 Teaser script DECIDED v2 — depth pass: elsewhere-as-universe, agency, scale, ambience
- 🟡 Devil bible — UNBLOCKED (vision v2 ratified). Core/registers/mood; resolve reachable-cast roster (secretary? notary?) here; Mrs. Devil stays an undefined slot
- ⚪ Canon v1 (`world/canon.md`) — postcard: Exchange, Management, Devil personnel file. Structured entries w/ causal-link fields from entry #1 (markdown until ~50 entries)
- ⚪ Weekly transcript-review loop (lore harvest → thin-wall detection → ratify → canon)

---

## Open for Sven (consolidated decision queue)
1. **Send the Artizen teaser** — approve/tweak the draft (`strategy/outreach-log.md`) and post to the Artizen Telegram; then log results. First non-seed audience test
2. **Send to friends too** — text (806) 666-1212 to a few people, watch `/teaser-stats` (the pitch test)
3. **World One kickoff** — greenlight starting the Devil bible + canon v1 (vision v2 ratified; next work block)

## Cadence
Commit per change set; push in intervals; this tracker updated each working session. Real hygiene (branches/CI/PRs) when we exit prototype phase.
