# Elsewhere — work tracker

The working board until we move to a real ticketing system. Updated as things move. Four workstreams. Newest status at the top of each.

**Legend:** 🔴 blocked-on-Sven · 🟡 in progress · 🟢 done (recent) · ⚪ queued

---

## A. Infra & ops
Numbers, hosting, DB, domains, the teaser plumbing, landing page.

- 🟢 Teaser analytics — logs EVERY call (teaser_calls: outcome, duration, status, repeat callers via caller_number+created_at). Twilio status callback → duration for dropoff analysis. `/teaser-stats` = calls · unique · repeat · signups · conversion% · avg duration
- 🟢 Teaser timing tuned to Sven's ear — one ring, minimal gap (dropped `<Pause>`, 0.35s lead silence), barge-in "press one at any time"
- 🟢 Teaser line **(806) 666-1212** live — routes, signups table, deployed
- 🟢 Devil line **(505) 551-3551** live (bridge, guardrails, logging, recording)
- 🟢 Railway bridge, Supabase (new keys), Twilio upgraded off trial
- 🟢 Domain **elsewheretel.co** purchased
- 🟢 ElevenLabs Starter active — "Elsewhere Operator" voice saved to library; key uncapped
- 🟢 **Landing page LIVE** — served by the bridge from apps/web (not Vercel; one-system decision). Seal logo (vectorized rotary phone + Special Elite curved text), favicons, click-to-call number, 5 easter eggs. brand-voice tariff card
- 🟡 **elsewheretel.co DNS set** (Namecheap: root ALIAS + www CNAME + TXT verify, all resolving). Railway validating cert (auto, ~mins). Goes live automatically
- ⚪ Signup notification mechanism (outbound SMS/call = A2P/TCPA) — defer, manual round at friend-scale

## B. Strategy & concept
The vision, positioning, business model, pitch. Mostly docs.

- 🟢 Vision doc complete (`vision-world-company.md`) — world company, districts, ontology, production layers, economics
- 🟢 World One locked: the Underworld
- 🟢 Pitch drafted (one-liner / 30s / 90s) — tested informally, "good"
- 🔴 **Vision redlines** (`vision-world-company.md` §8): Management cosmology · Mrs. Devil · terminology table · in-world name for the Underworld exchange — still open, gates all canon/Devil work
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
- 🟢 **Teaser SHIPPED (final production)** — ElevenLabs "Elsewhere Operator" (smoky-2 Voice Design) reading v2 script, over living-switchboard bed (eerie drone + chatter + laugh + weep + dial tone), intro'd by real vintage-phone pickup foley (Sven's recording) + synth ringback. Mixed in Audacity by Sven, telephone-mastered. confirm + goodbye also in operator voice. Live on (806) 666-1212
- 🟢 Teaser script DECIDED v2 — depth pass: elsewhere-as-universe, agency, scale, ambience
- 🟡 Devil bible — waiting on canon (see 2.0a)
- ⚪ Canon v1 (`canon.md`) — postcard: Exchange, Management, Devil personnel file — waiting on redlines
- ⚪ Weekly transcript-review loop (lore harvest → ratify → canon)

---

## Open for Sven (consolidated decision queue)
1. **Landing page** — approve the proposed approach (see below / chat), then I build
2. **Vision redlines:** Management cosmology · Mrs. Devil · terminology · Underworld exchange name — unblocks ALL canon/Devil-bible work
3. **Send the teaser** — text (806) 666-1212 to a few people, watch `/teaser-stats` (the pitch test)

## Cadence
Commit per change set; push in intervals; this tracker updated each working session. Real hygiene (branches/CI/PRs) when we exit prototype phase.
