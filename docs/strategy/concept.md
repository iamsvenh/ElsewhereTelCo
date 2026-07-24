# AI Payphone: "The Persona Line"

One-liner: A real old-school payphone, self-contained (power + cellular), connected to an AI voice persona that rotates weekly or monthly ("Your Mom", "God", "Your Future Self"). Pick up, drop a quarter, talk.

**Status:** Concept capture + economics + deployment analysis. No decision yet.
**Last updated:** 2026-07-22

---

## 1. Concept

A working payphone as a vessel for AI conversation. The form factor does the marketing: nobody expects a payphone to answer back, and the handset creates privacy and intimacy that no kiosk or speaker install can match. Rotating personas create repeat visits ("who's on the line this month?").

Persona spectrum, silly to serious:
- **Fun:** Your Mom (guilt-trips you about not calling), Your Ex, the 1962 Operator, the Devil (takes complaints), Death (surprisingly chill), a conspiracy theorist, Drunk Future You.
- **Serious:** God, Buddha, a Stoic philosopher, "the listener" (confession/venting line), Your Future Self (10 years out), a stranger who just listens.
- **Local flavor:** a ghost of the building the phone is in, a Route 66 hitchhiker, the town's founding madam.

### Precedents (this works)

- **"Deus in Machina" AI Jesus, Lucerne (2024):** GPT-4o + Whisper avatar in a real confessional booth. 900+ visitors in two months, two-thirds reported a spiritual experience, global press coverage. Proof that persona + sacred/nostalgic physical vessel is powerful, not just gimmicky.
- **Audio guestbook phones:** rotary phones that record voicemails at weddings rent for \$150-350/event and spawned dozens of rental businesses (After the Tone, FeteFone, Etsy sellers). Proof that "old phone at an event" is a proven rental category, and those phones don't even talk back.
- **Wind Phone (kaze no denwa), Japan:** a disconnected phone booth for talking to lost loved ones, replicated worldwide. Proof of the serious/emotional end of the register.
- Meow Wolf (Santa Fe) already uses interactive phones as installation elements. Relevant both as precedent and as a potential customer 1 hour away.

---

## 2. Personas and legality

The 2024-2025 legal wave made real-person voice personas radioactive:

- **Tennessee ELVIS Act (effective July 2024):** first law making *voice* an explicit right-of-publicity property, aimed squarely at AI voice simulation. Elvis specifically is owned by Elvis Presley Enterprises (Authentic Brands Group), among the most litigious rights holders in existence. Elvis is the single worst possible persona choice, which is funny given the idea's working title.
- **California AB 1836 (effective Jan 2025):** digital replicas of *deceased* personalities' voice/likeness require estate consent. Post-mortem publicity rights run up to 70 years (CA) or effectively forever (TN).
- **Living people:** right of publicity in most states + false endorsement (Lanham Act). Parody defenses are weak for a commercial coin-op machine.

**Rule: invented and ancient personas only.**

| Tier | Examples | Risk |
|---|---|---|
| Green: fictional archetypes | Your Mom, the Operator, the Devil, Death, Future You | None (these are also the funniest) |
| Green: religious/mythological | God, Buddha, Zeus, Coyote | No publicity rights; cultural-sensitivity judgment only |
| Green-ish: distant historical | Shakespeare, Cleopatra, Ben Franklin | No voice recordings exist, rights long expired |
| Red: any real person born after ~1850 | Elvis, celebrities living or dead | ELVIS Act, AB 1836, estates. Do not. |

The constraint costs nothing creatively. "Your mom" beats Elvis.

---

## 3. Economics

### Architecture: latency is the deciding factor

Two ways to build the voice loop, and latency (not cost) should pick the winner:

**A. Speech-to-speech (recommended for v1).** OpenAI's Realtime API takes audio in and produces audio out in one model: no STT → LLM → TTS chain, so voice-to-voice latency lands around **500-800 ms**, which feels like a real phone call. Interruption handling (caller talks over the persona) comes built in. Billed per audio token; real-world **~\$0.06-0.11/min on the flagship, ~\$0.02-0.05/min on mini** with caching working. Tradeoffs: locked to OpenAI's voice palette (fewer wild character voices), and persona depth depends on the realtime model's intelligence.

**Model pick: [gpt-realtime-2](https://developers.openai.com/api/docs/models/gpt-realtime-2)** (audio \$32/\$64 per M tokens, 128k context). Two properties fit the payphone exactly:
- **Cached audio input is \$0.40/M** (~99% off the \$32 uncached rate). Since realtime cost grows with call length because the audio history is re-sent every turn, cheap cached input largely defuses the superlinear-cost problem — as long as caching is set up correctly, a 5-min call stays near the low end of the range.
- **Configurable reasoning effort.** Higher effort = smarter but slower. For a novelty phone call, run at the lowest effort: personas need wit and consistency, not chain-of-thought, and latency is the product. If a persona feels dumb, nudge effort up one notch before switching models. The stronger instruction-following is directly useful for keeping personas in character against drunk adversarial callers.

Mini (\$10/\$20 audio) remains the cost floor for v0 testing; upgrade to gpt-realtime-2 when persona quality or character-breaking becomes the complaint.

**How minutes → tokens (sanity check on the "cheap" numbers):** audio is metered at 1 token/100 ms for user speech (600 tokens/min) and 1 token/50 ms for assistant speech (1,200 tokens/min). So \$32/M input = ~28 hours of listening (~\$0.02/min) and \$64/M output = ~14 hours of talking (~\$0.08/min). A half-and-half 5-min call: 1,500 input tokens (\$0.05) + 3,000 output tokens (\$0.19) ≈ \$0.24 fresh speech. The hidden cost is history re-sent as input every turn (~15-20k tokens over 10 turns ≈ \$0.50+ uncached) — which cached input at \$0.40/M reduces to under a cent. Note output is ~4x input per minute (denser tokens × double price): **chatty personas cost more; terse, punchy personas are cheaper AND funnier. Prompt style is a cost lever.**

**B. Pipeline (STT → LLM → TTS).** More control: any brain (Claude Haiku 4.5 at \$1/\$5 per MTok is ~\$0.01/min with a cached persona prompt), any voice (ElevenLabs for characters). Cost ~\$0.05-0.07/min with good components, ~\$0.10-0.15/min with premium voice or a platform (Vapi/Retell/ElevenLabs Agents). But best-case latency is ~800 ms-1.5 s, and every 100 ms matters for the illusion.

**Verdict:** v1 on the Realtime API (mini first, gpt-realtime-2 at low reasoning effort when quality matters). The pipeline remains the fallback if a persona needs a very specific character voice or a smarter brain. Latency masking is still worth building either way: dial tone, ring, line static, in-character "connecting you now..." operator beats. They buy 2-3 free seconds at call start and make pauses feel like the medium, not a bug.

### Cost per call

- Budget **\$0.05-0.10/min all-in**. Typical call 2-4 min → **\$0.10-0.40 per call**. 1,000 calls/mo ≈ \$100-300/mo.
- A quarter per call doesn't cover premium settings; \$1 for 5 minutes does. At events the host pays, not the caller, so per-call cost is a rounding error against a \$500 rental.
- No telephony cost (Twilio's \$0.02/min doesn't apply): the "phone" talks straight to the voice API over IP. The handset is just a mic/speaker.

### Worst-case cost calculation (added 2026-07-26)

Stack every pessimistic assumption at once: flagship gpt-realtime-2 (no mini), **caching completely broken** (all history re-billed at \$32/M), a chatty persona (80% talk share), rapid back-and-forth (20 turns in 5 min, maximizing history re-sends), and a ~2k-token persona prompt re-sent uncached every turn.

| Component (5-min call, all-worst-case) | Tokens | Cost |
|---|---|---|
| Caller speech in (1 min) | 600 | \$0.02 |
| Persona speech out (4 min) | 4,800 | \$0.31 |
| History re-sends, uncached (avg ~2.7k × 20 turns) | ~54,000 | \$1.73 |
| Persona prompt re-sends, uncached (2k text × 20) | ~40,000 | \$0.16 |
| **Worst-case 5-min call** | | **≈ \$2.20** |

**Verdict: a \$5 block still nets ~\$2.80 (55% margin) with everything on fire.** Typical case remains \$0.20-0.45. The economics don't break on a bad call; they break only in two tail scenarios:

1. **Chained re-ups on one session.** If re-ups continue the same session, history compounds: a 15-min uncached session (~50 turns, avg ~8k history) approaches **\$13** against \$15 revenue. Mitigation: each re-up starts a *fresh session* carrying a 2-3 sentence summary of the prior block ("caller is Jake, sold his soul twice already"). Bounds cost per block, and the reset is invisible behind the Operator's "reconnecting you now."
2. **Host-paid saturation.** An event phone running free-to-caller at full queue: 12 calls/hr × 10 hr × \$2.20 worst case ≈ **\$265/day** vs. ~\$15 typical. A \$500/day rental survives it, but barely enjoys it.

**Standing mitigations (cheap, do all of them):**
- Hard 5-min cap enforced by the box, not the model.
- Fresh session per block (kills compounding).
- Verify `cached_tokens` in API usage responses during the first deployment — cache failure is silent and is the entire gap between \$0.24 and \$2.20.
- OpenAI project budget limit + daily spend alert sized to the venue (e.g. \$30/day bar, \$300/day festival) as the kill switch.

### Unit economics: per-call cost, pricing, break-even (added 2026-07-24)

**Variable cost per call.** Planning numbers: gpt-realtime-mini ~\$0.04/min, gpt-realtime-2.1 ~\$0.09/min (cached). Important: realtime-API cost grows *superlinearly* with call length, because each turn re-sends the growing audio conversation as input tokens. Long calls are disproportionately expensive, which independently argues for a hard cap.

| Call length | mini | 2.1 |
|---|---|---|
| 1 min | \$0.04 | \$0.09 |
| 3 min (expected typical) | \$0.12 | \$0.27 |
| 5 min (proposed cap) | \$0.20 | \$0.45 |
| 10 min | \$0.45-0.60 | \$1.00-1.50 |

**Fixed cost per unit per month:** SIM \$10 + misc (Stripe/web app share) ~\$5 + hardware amortization (\$700 over 24 mo) ~\$30 → **~\$45/mo**.

**Cap at 5 minutes.** Three independent reasons converge: (1) cost curve bends up after ~5 min; (2) throughput — at an event a 5-min cap means ~10 callers/hour, and the queue IS the marketing; (3) it's authentic — payphones always cut you off. The cutoff is done in character: at 4:30 the Operator breaks in ("please deposit another coin for five more minutes") or the persona wraps it ("your time is up, mortal"). Re-up = pay again, which is the upsell.

**Pricing: sell the block, not the minute.** Decision (2026-07-26): anchor at **\$1/minute, sold as a \$5 / 5-minute block** at festivals (where a drink is \$10, a fiver for a conversation with the Devil is an easy yes); flex down to \$2-3/block for bars. Per-minute billing needs meters, running totals, and disputes; a block is one decision and matches the payphone mental model. Within the block, one persona or several doesn't matter for cost — it's all the same minutes. At \$5/block against \$0.20-0.45 API cost, margin is ~90%+ and break-even drops to ~10 calls/month.

**Coins reality check:** \$5 = 20 quarters is a jam-prone hopper problem and most people carry zero cash. Keep coins as *theater*, not the payment rail: the mid-call Operator "please deposit 25 cents" extension moment can accept one real quarter (acceptors are \$15-25, GPIO-trivial) while QR carries the actual revenue. Best of both: the coin drop sound stays in the experience.

**Break-even (consumer-paid unit, \$2 per 5-min call on mini):**
- Margin per call ≈ \$1.80. Covering \$45/mo fixed = **25 calls/month, less than one per day.** At \$1/call it's ~56/month. Break-even is trivially low.
- The real question is upside, not break-even: \$500/mo/unit needs ~280 calls (9-10 per night in a bar). Plausible only in genuinely high-traffic venues, which is another argument for events-first.
- **Host-paid event rental is the degenerate (good) case:** \$500/day rental vs. maybe \$15 of API cost for 100 calls. ~95% margin; per-call cost is noise.

### UX decisions (thinking out loud, 2026-07-24)

**Payment: QR prepay, coins as theater.**
- v1 events: host pays, phone just works off-hook. No payment UX at all.
- Consumer-paid units: QR on the phone → Stripe checkout (\$2) → screen shows a 4-digit code → caller dials the code on the keypad → call starts. Everything stays in the phone; no Bluetooth pairing, no app.
- Coins aren't dead: multi-coin acceptors are \$15-25 and wire straight to Pi GPIO. \$0.25 doesn't cover costs but "deposit four quarters" does, and the coin drop is pure theater. Hybrid (coins OR code) is a v2 nicety; collection/theft hassle means QR is the workhorse.

**Persona discovery: the instruction card.** Real payphones had printed instruction cards and a phone book on a chain — use exactly that. A laminated "directory" hanging off the unit lists tonight's personas ("Dial 1: Your Mother · 2: God · 3: The Devil · 4: Death · 5: Future You"), so callers know the options before picking up. The Operator is the fallback for anyone who ignores the card ("not sure who to call? Tonight's board has..."). Rotating the card per venue/season is also how the roster stays fresh without touching software.

**Persona selection: the Operator IS the menu.** Pick up → a 1962 switchboard operator answers: "Operator. Who are you trying to reach?" Either keypad IVR ("press 1 for your mother, 2 for God, 3 for the Devil...") or — better and nearly free since the model already listens — the caller just *says* who they want and the Operator connects them, with period sound effects. The menu becomes part of the show, and one unit carries the whole persona roster. v0 can still ship with a single hardwired persona; the Operator-router is the v1 upgrade.

**Context: personas gather their own.** No pre-call forms. Every persona opens the call (the phone RINGS the caller conceptually — the Devil answers "Devil's line. What."). Personas that need context about the caller simply *ask*, in character: Future You opens with "whoa, this connection... what year is it there? Okay — tell me where you're at right now," and 30 seconds later it has everything it needs. Context = system prompt + whatever the caller says. Optional later: the QR prepay page collects one field ("what should your future self know?") and injects it into that session's prompt, keyed to the 4-digit code.

### Connectivity: yes, fully self-contained

Voice AI audio is ~50 kbps compressed. A 3-minute call is 1-2 MB; even 500 calls/month is under 1 GB. A \$100-150 LTE router (GL.iNet/Teltonika) + a \$5-15/mo IoT SIM covers it. **The unit is genuinely plug-into-power-and-done**, and could run a full festival day on a ~300 Wh battery (Pi + modem + audio draw ~10-15 W).

### Hardware BOM (per unit)

| Item | Cost |
|---|---|
| Real payphone shell (eBay, Western Electric/GTE) | \$150-400 |
| Raspberry Pi 5 + storage | ~\$100 |
| Handset audio interface + hook-switch GPIO + amp | ~\$60 |
| LTE router + antenna | ~\$120 |
| PSU, wiring, mounting, coin mech (optional, mostly theatrical) | ~\$100 |
| **Total** | **~\$550-850** |

The handset solves the loud-bar problem: mic at the mouth, speaker at the ear, which no open-air kiosk can claim. Latency strategy lives in the architecture section above.

---

## 4. Deployment models, ranked

1. **Festivals and events (best).** Captive playful audience, alcohol, and the host pays. Comps: audio guestbook rentals \$150-350/wedding for a phone that doesn't talk; brand activations run \$500-2,500+/weekend. Realistic: \$400-1,000/event rental. One unit pays for itself in 1-2 bookings. Weddings ("call your future selves"), music festivals, corporate parties, Halloween events (seasonal personas write themselves).
2. **Immersive venues / museums.** Meow Wolf is 60 minutes from home and already installs interactive phones. A licensing or build-for-hire deal here is worth more than a fleet of bar units. Also science museums (education framing: "talk to Ben Franklin").
3. **Bars (fleet concept).** Recurring novelty, alcohol helps, and the handset form factor works in noise. But: vandalism, beer in the handset, maintenance visits, and the novelty decays for regulars unless persona rotation is aggressive. Model: free placement + bar pays \$100-150/mo as entertainment/decor, or revenue share on \$1 coin drop. Works as expansion after events prove demand, not as the entry point.
4. **Street/downtown.** Great PR stunt, bad business: permits, weather, vandalism, no revenue capture. Do once for the video.
5. **Other:** hotel/hostel lobbies, tourist kitsch corridors (Route 66!), coworking spaces, Airbnb Experiences, seasonal pop-ups (Valentine's "call your ex", Día de los Muertos).

---

### Festival GTM: three routes to the circuit (added 2026-07-26)

Consumer pricing works at festivals, but *getting onto* festival grounds is the actual problem. Three routes, easiest first:

1. **Ride existing vendors.** Photo-booth and audio-guestbook rental companies already work the festival/wedding circuit and have the vendor relationships. Sell or white-label units to them (\$2-3k/unit or rev-share) and let them do the B2B grind. Fastest path to volume, lowest margin, zero sales infrastructure needed.
2. **Direct activation applications.** Mid-size regional festivals (NM/CO/AZ circuit, Meow Wolf events) take experiential-vendor applications directly. Coachella-tier is agency-gated and not a year-one target.
3. **Brand sponsorship.** Experiential agencies hunt for exactly this kind of weird. "Talk to Death, presented by Liquid Death" is almost embarrassingly on-brand — a persona-of-the-festival sponsorship covers the fee and pays a premium. One agency relationship could book a season.

Sequence: prove it at a bar/local event (stage 1) → arm a circuit vendor or land one regional festival (stage 2) → sponsorship money (stage 3).

### Launch stunt: the desert phone (added 2026-07-26)

Plop a unit alone in the high desert near Taos and let the internet discover it. This has two direct precedents, both cult phenomena:

- **The Mojave Phone Booth (1997-2000):** a lone payphone in the middle of the Mojave became an internet legend — people worldwide called it around the clock, others made pilgrimages to answer it, until the NPS removed it. That was a phone that did *nothing*. Ours answers as the Devil.
- **Prada Marfa (2005-present):** a fake storefront in the West Texas desert, still an Instagram pilgrimage site 20 years on. Template: inexplicable object + empty landscape = infinite content.

The build is uniquely in-house: solar + battery + LTE makes it fully off-grid (Pi + modem ≈ 15 W → a ~200 W panel and small LiFePO4 runs it 24/7), and that's literally the skoolie skill set. Free to callers; it's a marketing asset, not a revenue unit — worst-case API burn if it goes viral is capped by the daily budget limit.

Practicalities: place it on own/permissioned land near a passable road (BLM/highway ROW placement invites removal, which — Mojave-style — is also content); don't wait for organic discovery, seed 2-3 regional TikTok/IG creators with coordinates "leaked" as a mystery; a phone number ON the phone that posts its own location clue occasionally is extra mythology. Weather/vandalism are acceptable losses on a \$700 asset that generates the origin story.

**The neon sign (design anchor, 2026-07-27):** Beetlejuice-model energy — a big vintage flashing neon arrow in the empty desert pointing at the phone. Practical version: **LED-neon flex** (faux neon), not glass — cheap (~\$50-150), 12V (runs off the same solar/LiFePO4 bank), survives wind and idiots, and reads identically on camera at night. An arrow + one word ("TALK", or the brand name) on a steel frame. The night shot of a flashing neon arrow pointing at a lone payphone on the Taos mesa is the single image the whole brand can hang off.

**Connectivity for the desert unit:** LTE first (2-5 W, \$10/mo) — do a cell-coverage site survey before choosing the spot. Starlink Mini is the fallback for a truly dead zone but draws 20-40 W and roughly triples the solar/battery sizing; better to pick a site with bars.

### Returning callers: memory as theater (added 2026-07-26)

The repeat-customer experience is potentially the product's soul, and the *verification itself is the entertainment*:

- **Claim codes, in persona.** At call end, personas that "remember you" issue a themed token: the Devil gives you your **soul contract number**, Death your **appointment number**, God a **confession seal**, Future You a "word only we know." Next visit, the re-establishment is banter, exactly the "Sven who? *The* Sven Herman? Prove it — what's your contract number?" exchange. The code is just a session key; the interrogation around it is the feature. (The cheeky "give me your social security number" gag: fine as a joke the persona makes, as long as it never accepts one.)
- **Mechanics:** backend stores an opt-in *summary* of each conversation (never raw audio — keeps the placard honest), keyed to the code. On a verified return, the summary is injected into the system prompt and the persona genuinely picks up where you left off ("last time you were going to quit that job. Did you?"). Persona asks "shall I remember this?" before issuing a code.
- **Do NOT use voiceprint recognition.** Biometric identifiers trigger BIPA (Illinois) and a growing family of state biometric laws. Codes and names only.
- **The funnel:** the claim code doubles as user onboarding. The code redeems on a web app where the conversation can continue — which is where this connects to [[private-voice-journal]] (`ideas/private-voice-journal/concept.md`). **SHELVED (2026-07-27):** the journal backend is a large engineering product in its own right; treat it as a someday-branch, not part of this plan. The claim-code system stays (it's cheap and the codes/summaries accumulate), so the option remains open without building anything.

### Parking lot (feature creep containment)

Ideas that are real but explicitly NOT v1:
- **"Send me my call":** enter your number / scan link post-call, get the conversation (audio or transcript). Doubles as list-building and a funnel to whatever comes next. Requires storing the call — must be opt-in per call to keep the "we don't record" default stance honest.
- **Future You goose chase:** the persona invents an urgent errand ("you're supposed to meet Emily in Tucson tomorrow!") — scripted chaos, shareable stories. Pure prompt work, zero infra, but polish later.
- Pre-call personalization via the QR page (one field injected into the session prompt).
- Multi-unit "party line" (two phones at one festival can call each other's callers).
- Seasonal persona packs (Halloween, Valentine's "call your ex", Día de los Muertos).

## 5. Honest assessment

- **This is a lifestyle/side business, not a venture.** Ceiling is maybe a few units earning \$1-3k/mo each in good event season, plus possible one-off installation commissions. That's real money at Sven-scale burn, and the build is squarely within existing skills (Pi, solar/electrical, API integration).
- **The moat is theatrical, not technical.** Anyone can wire a Pi to ElevenLabs. The defensible parts are persona writing (the scripts/system prompts ARE the product), the physical build quality, and event-booking relationships.
- **Novelty decay is the main risk** for fixed placements; rotation and seasonality are the countermeasure. Event rentals dodge the problem entirely because the audience rotates instead.
- **Content risk:** drunk people will say horrible things to the phone. Personas need robust guardrails, and "the Devil" still needs to decline actual harm. Also record/privacy: don't store audio, say so on a placard.
- **Weird-idea kicker:** the same box is a content machine. "We put an AI payphone in a dive bar, here's what people asked God" is exactly the video that goes viral (with consent placard + opt-in).

## 6. Roadmap: idea → market → profitable business (rev 2, 2026-07-27)

Each stage has a spend cap, a metric, and a kill/pivot criterion. Hardware waits until the personas are proven fun on software alone.

### Stage 0 — Software-only persona validation (~\$50-100, 2-4 weekends)

The insight: **a phone number IS the product minus the box.** Two builds, in order:

1. **Persona playground (weekend 1):** browser mic → OpenAI Realtime WebRTC. Zero telephony, instant persona iteration. This is where the art happens: prompt-craft the Devil, the Operator, Your Mom, Future You until *Sven* laughs. The persona prompts are the actual IP of this business; everything else is plumbing.
2. **"Call the Devil" number (weekend 2):** Twilio number bridged to the Realtime API (OpenAI publishes a reference implementation for exactly this). ~\$1/mo + ~\$0.015/min telephony + API. Now it's shareable: text a phone number to friends, family, the Artizen community.

**Testing pool:** friends/family first, then **Artizen** — art-native community, already primed for weird participatory pieces, and the personas can be framed as an art drop (possibly even Artizen prize/grant material, which would make validation revenue-positive). Artizen is also a legitimate *launch* venue later, not just a testbed.

**Metrics that matter:** average call length (>3 min = engaging), completion (do they talk until the cap), unprompted shares (do testers send the number to someone else without being asked — the single strongest signal), repeat calls, and which persona wins.

**Kill/iterate criterion:** if testers don't finish calls or nobody shares the number after ~20 testers, the personas aren't fun enough yet — iterate prompts or shelve. **No hardware purchases until unprompted sharing happens.**

**MVP spec (rev 2, 2026-07-27): analytics and memory are baked in from day one.**

- **Stack:** Bun/TypeScript bridge server (Twilio Media Streams ↔ OpenAI Realtime WebSocket), Supabase for storage. Landing page + the number = the whole product.
- **Per-call record:** caller number, persona, start/end time, duration, completion (cap vs hangup), full transcript (Realtime API emits text transcription of both sides — store as text, cheap), claim code if issued, consent flags.
- **Share detection, the clean trick:** keep a seed list of numbers Sven personally texted. Any caller NOT on the seed list = an organically shared number. Organic-caller count IS the virality metric, measured automatically, no survey needed.
- **Privacy stance for a public-ish product — two-tier consent:** (1) **Improvement tier, default:** every call is transcribed and stored, used internally to improve personas and the product; disclosed in character ("calls may be monitored for quality by the management") and in the ToS/rate card. (2) **Publishing tier, explicit opt-in only:** any marketing/public use of a recording requires the end-of-call press-1 consent (Marketing Assets section). Caller numbers stored raw for MVP (friends), revisit hashing before public launch.

**Transcripts are the flywheel (2026-07-27).** The corpus of what people actually say to the personas is the core asset and the moat:
- **The iteration loop:** review transcripts weekly → surface each persona's real FAQ ("what is the meaning of life" will hit God's line within the first dozen calls) → *write* answers to the top questions — comedic, deep, or both — and fold them into the persona prompts. Improv becomes rehearsed material. This is exactly how comedians build a tight five: field-test, keep what lands. After 1,000 calls the Devil has a body of tested bits that no competitor with the same API can copy. The prompts are the IP; the transcripts are how the IP compounds.
- **ToS requirement:** the improvement-tier use must be granted from call one (see two-tier consent above) — retrofitting consent onto an existing corpus doesn't work.
- **Long-term arc this enables:** gimmick → genuinely entertaining show → personas people have ongoing relationships with (via claim codes + per-persona memory styles) → someday the take-it-home companion ([[private-voice-journal]], still shelved). Each step is funded by the previous one and uses the same corpus.
- **Wellbeing guardrail (the AI-psychosis concern, on the record):** relationship ≠ dependency. Design lines: personas are episodic entertainment, not companions — they never claim sentience, never discourage real-world relationships, and the introspective ones (Future You) explicitly push callers *toward* real-world action ("go call Emily, not me"). If usage data ever shows someone calling daily at length, that's a signal to soften, not to monetize. Revisit formally before any take-it-home product.
- **Cold-open funnel design — the first 10 seconds are the product.** Test protocol: send friends the number with deliberately minimal context ("do me a favor, call this real quick") — this *simulates the desert/bar cold pickup*, which is the hard case the product must survive anyway. The persona's opener must do three jobs: establish who they are, put the caller in a role, and ask an easy question. Compare: "Hello?" (fails all three) vs. the Devil: *"Devil's line. You're calling about your soul, I assume?"* — premise established, caller cast as a soul-negotiator, easy yes/no on the table. Every persona needs an engineered cold opener; A/B them via the seed texts (half get zero context, half get one line: "ask for the Devil"). If cold callers convert to 3+ minute calls, everything downstream works.

**MVP persona roster (decided 2026-07-27): three personas + the Operator, tested as a two-number A/B.**

Run two Twilio numbers (\$1/mo each):
- **Number A — the Devil answers directly.** Tests the direct-pickup cold open. This is the desert-phone/marketing configuration, and the Devil is the spearhead persona.
- **Number B — the Operator switchboard.** Tests discovery + routing. This is the venue configuration.

Same bridge server, same personas behind both. The one-vs-many question resolves with data instead of a decision, and both deployment modes get validated at once.

**Roster of three, chosen to cover the axes:** the **Devil** (comedy/edge — the spearhead), **Your Mom** (warmth — the broad-appeal crowd-pleaser for callers who bounce off the Devil), **Future You** (depth — the retention/memory persona). Operator makes four voices total.

**Operator design: she's a persona, not a menu.** She keeps the 10-second cold-open job, just does it as a switchboard employee: *"Elsewhere Telephone Company, operator. Who are you trying to reach?"* — the company name itself does the framing (calls here go... elsewhere). When the caller stalls ("uh... who can I reach?"), that confusion is the cue for a **teaser, not a list**: *"Well — tonight the Devil's line is open, your mother's been waiting by the phone as usual, and there's one slot left on the 2036 trunk. Who'll it be?"* Rules: never voice more than three options; phrase them as switchboard status, not menu items; off-roster requests get improvised in character ("that line's been disconnected since the incident") rather than an error.

**Per-persona memory style (the "weirdly obsessive" bug is a feature, allocated correctly):** the Devil has *petty perfect recall* — quoting something you said three weeks ago is contractually in character and hilarious. Your Mom *misremembers slightly* (devastatingly accurate). God *knows everything but theatrically checks the records anyway*. The same memory data renders differently through each persona; obsessiveness is only creepy on personas built for safety (The Listener gets summaries, never verbatim quotes).

### Stage 0.5 — The rotary phone stopgap (~\$80, between software and payphone)

Already-owned vintage rotary phone, gutted: Pi Zero 2 W + USB audio + electret mic capsule swap + hook switch on GPIO (see Tech Spec). Place it on a bar/café table with a small card: "Pick up." No payment, no menu, one persona (or rotary-dial selection — the dial pulses read fine on GPIO). This tests the *physical object draw* — the real Stage 1 question — for \$80 instead of \$800, using a phone that's already in the house. Aesthetic note: rotary = parlor/wedding vibe, payphone = street vibe; both are valid product lines later (the rotary IS the wedding-rental form factor).

### Stage 1 — One box, one room (~\$800 total, month 2-3)

Buy the eBay payphone (~\$400) and build the unit. Deploy free-to-use at one friendly venue for 2-3 nights.

- **Metric:** calls/hour in a busy room, queue formation, people dragging friends over.
- **Kill criterion:** under ~3 calls/hour in a full bar = novelty weaker than assumed → remains a beloved personal art object, stop investing.
- **De-risk:** venue via personal network (no sales motion yet); free calls (no payment build yet); this stage also produces the photo/video assets everything downstream needs.

**Venue options (Santa Fe/ABQ/Taos in range):**

| Venue | Pros | Cons / build implication |
|---|---|---|
| Bar (evening residency) | Alcohol, dwell time, repeat crowd, indoor plug-in build | Loud (handset mitigates), single audience |
| Art walk (Canyon Road SF, ABQ First Friday Railyard) | Curious foot traffic already in "experience art" mode, free, high share-rate demographic | One-night bursts; need a host business's blessing + power (or battery) |
| Farmers market | Daytime volume, families | **Personas must be family-safe** — needs a "daytime board" (no Devil, more Your Mom/Future You); daytime = worse for neon/mystique |
| Small festival / Artizen event | Best-fit audience, queue dynamics | Needs an invite; effectively a stage-2 rental audition |

Recommendation: rotary-on-bar-table (stage 0.5) → payphone at an art walk night + a 2-week bar residency. Skip farmers markets until a family-safe persona board exists.

**Two build variants, decided by venue (spec once, build twice):**
- **Indoor unit:** payphone on a wall-mount board or freestanding pedestal, wall power, LTE. This is the stage-1/stage-2 rental build.
- **Outdoor/stunt unit (stage 3):** period-appropriate booth or steel-frame stand, heavy base + ground anchor, solar + LiFePO4, weatherized. Marketing assets scale with the venue: table card (rotary) → instruction card + directory (indoor) → the full neon treatment (desert, see stage 3).

### Stage 2 — First revenue: event rentals (month 3-6, target \$1-2k/mo)

Sales motion, cheapest first:
1. **Landing page + the Stage 1 video.** A 60-second clip of a stranger cracking up on the phone sells better than any copy.
2. **3-5 local wedding/event planners** (Santa Fe/Taos wedding market is significant) — planners rebook, so each relationship is worth many events. Price \$400-750/event, undercutting nothing (audio guestbooks charge \$150-350 for a phone that doesn't talk).
3. **One regional festival application + the Meow Wolf email** with the video.
4. Add QR payment build only when a venue wants consumer-paid placement.

**Profitability line:** 2 bookings/mo ≈ \$1k/mo against ~\$60/mo run cost — profitable as a side business at TWO bookings. Build unit #2 from revenue, not savings.

**Channel addendum (2026-07-27):**
- **Wedding/event photographers** are a second planner-like channel: they already upsell add-ons (many sell audio guestbooks today), they're at every event, and they rebook. Offer a referral cut or a photographer wholesale rate. (Sister is a photographer in Germany — no near-term advantage, but useful for channel intuition and eventually EU validation.)
- **Meow Wolf: treat as credential, not customer.** They have the in-house talent to DIY the tech, so don't pitch a rental. What they can't trivially replicate is the persona writing + a proven turnkey unit. Realistic shapes: (a) one-time art commission/build fee, (b) persona licensing, or (c) do it near-free for the placement — "as seen at Meow Wolf" is worth more to rental sales than any fee they'd pay. Warm intro exists via a friend; use it when there's a video.

### Stage 3 — The desert phone (parallel to Stage 2, AFTER the landing page exists)

The stunt is an amplifier, not a validator — fire it only when there's something to amplify (booking link live, rental pitch ready, Twilio number alive as the "call from home" tie-in). Plan: unit on own/permissioned land off a passable road near Taos; solar + LTE build; seed 2-3 regional TikTok/IG creators with "leaked" coordinates; pitch the quirky-beat press (Taos News, ABQ Journal, Atlas Obscura — the Mojave Phone Booth's spiritual home). Budget cap on the API key. Everything that happens to the phone — including theft or removal — is content.

### Stage 4 — Scale decision (month 6-12)

Branch on what actually pulled:
- **Rentals pulled** → build to 3-5 units, then white-label/sell units to photo-booth and audio-guestbook circuit vendors (\$2-3k/unit or rev-share) instead of hiring a sales function.
- **Installations pulled** (Meow Wolf, museums, hotels) → commission/licensing work, higher ticket, fewer customers.
- **Attention pulled** (desert phone goes viral) → sponsorship conversations (Liquid Death archetype) via experiential agencies.

"Real business" bar: 4-6 owned units + one circuit-vendor partner ≈ \$5-10k/mo. Anything beyond that needs the white-label path, since owned-fleet ops don't scale a two-person company.

**Franchise question (2026-07-27):** true franchising is a legal machine (FTC Franchise Rule, FDD disclosures, state registrations) — wrong weight class for this. The franchise *outcome* with none of the law: a **"phone-in-a-box" operator kit** — hardware kit or build spec + persona subscription (the prompts/updates are the recurring IP) + booking playbook, sold to local operators at, say, \$2-3k up front + \$100-200/mo per unit SaaS. Operators get territory informally by virtue of geography. This is the same motion as the circuit-vendor white-label, just packaged for individuals. Revisit only if stage 2-3 demand outstrips owned capacity.

### Capital at risk per stage

| Stage | Cumulative spend | What's known before spending the next dollar |
|---|---|---|
| 0 | ~\$100 | Are the personas actually fun? Do people share it? |
| 1 | ~\$900 | Does the box draw a crowd in a room? |
| 2 | ~\$1,200 | Will anyone pay? (revenue starts here) |
| 3 | ~\$2,000 | Does the story travel? |
| 4 | revenue-funded | Which of three business shapes this is |

## 7. Brand (first pass, 2026-07-27)

**The strong framing: a fake vintage telephone company.** Not "an AI experience" — a deadpan telco that happens to connect calls to the Beyond, the afterlife, your mother, and 2036. The bureaucratic straight face is the joke, and it gives every surface a voice: instruction cards read like tariff notices, the Operator is an employee, rate cards are official ("Rates: \$1 per minute. The Devil is standing by.").

**Name directions (pick later, after saying them out loud in public a few times):**
1. **Elsewhere Telephone Co.** — covers the whole roster (Devil, God, Mom, Future You are all "elsewhere"); warm, mysterious, merch-friendly. Current favorite.
2. **The Long Distance Co.** — "long distance" doing double duty (calls to God are very long distance); classic telco term nobody under 30 has strong associations with.
3. **The Persona Line / The Party Line** — descriptive, safer, less mythology.

Check trademarks/domains before attaching to any of these.

**Name decided (2026-07-28): Elsewhere Telephone Company.** Domain pick: **elsewheretel.co** — the TLD completes the name ("ElsewhereTel.Co" = ElsewhereTelCo), matches the GitHub repo, short enough to say at a bar. RDAP-checked available 2026-07-28, as were these (grab defensively/for lore as budget allows): `elsewheretelco.com` (boring .com), `elsewhere.tel` (the telephone TLD), `elsewhere.exchange` (period-perfect switchboard lore), `elsewhere.directory` (persona directory page), `elsewhere.support` (deadpan ToS/complaints page), `callelsewhere.com` / `dialelsewhere.com` (campaign CTAs). Taken: elsewhere.works/.network/.world/.international/.company. Caveats: registrar may price any of these as premium at checkout; run a quick USPTO search on "Elsewhere Telephone" before printing signage/neon.

**Visual style:** 1950s-70s Bell System Americana, parodied with love — engraved phenolic instruction cards, period typography (think Western Electric manuals), enamel-badge logo, and neon as the night signature. Palette: telco black/chrome/cream + one neon accent. The desert-arrow night shot is the brand image; everything else derives from it.

**Voice:** deadpan official. The company never acknowledges anything is unusual. "Please limit calls to the deceased to five minutes. Other customers are waiting."

## 8. Marketing assets & recording

- **Call recordings are marketing gold and legally touchy.** NM is one-party consent, but callers travel, units travel, and *publishing* a voice needs explicit consent regardless of recording law. Design: recording capability built into the stack from day one (Twilio-side or box-side, trivial) but **default off**; per-call opt-in at the END of great calls, in character — Operator: "The management asks: may we share this call? Press 1 to allow, 2 and it is destroyed." Store the consent flag with the transcript. Never voiceprint, never publish without the flag.
- **Video of people using it:** hoped-for user-generated (desert stunt especially), but engineered too — every deployment night, deliberately capture 60-90 min of consent-signed footage (a small "filming tonight" placard at the venue + release forms for anyone featured). The single best-performing asset will be one stranger laughing into the handset; plan shoots around getting it.
- The phone itself can prompt UGC: instruction card line — "Photos encouraged. Tag @[brand] or don't, we're a telephone company, not the police."

## 9. Tech spec (brainstorm → spec, 2026-07-27)

### Software architecture (MVP through fleet, same stack)

```
Caller → [Twilio number] → Media Streams WebSocket
                              ↓
        Bun/TS bridge server (Fly.io/Railway/VPS)
           ├─ OpenAI Realtime API (persona session)
           ├─ Supabase (calls, transcripts, codes, consent, metrics)
           └─ Stripe (QR prepay → 4-digit codes)   [stage 2+]

Physical unit → same bridge server, but audio originates from the box:
  Pi (WebRTC/WebSocket direct to bridge) — no Twilio leg, no telephony cost
```

Key point: the bridge server + Supabase backend is built ONCE at stage 0 and every later stage reuses it — the boxes are just alternative audio frontends. Payment is fully server-side (Stripe checkout → code in DB → box/bridge validates code via API); the box never touches money.

### Hardware retrofit (rotary and payphone, same recipe)

| Original part | Reuse? | Notes |
|---|---|---|
| Handset shell + cord | ✅ | The tactile soul of the product. Keep. |
| Earpiece speaker (receiver) | ✅ usually | Vintage dynamic receivers (~150-300Ω) drive fine from a \$3 PAM8403 amp off the Pi's USB audio. Test; replace with a modern 8Ω driver in the same housing if tinny. |
| Carbon microphone capsule | ❌ replace | Carbon transmitters need a current loop and sound like 1935. Swap in a \$2 **electret capsule** inside the original mic housing — invisible mod, modern audio. |
| Hook switch | ✅ | Wire to Pi GPIO. Off-hook = session start. The satisfying *clunk* is free UX. |
| Rotary dial | ✅ | Dial pulses read on GPIO (count make/break pulses) — classic Pi project. Dial-a-persona works on the rotary unit. |
| Payphone keypad | ✅ | Matrix-scan to GPIO (or small USB matrix encoder). Needed for code entry + IVR. |
| Coin mech | Optional | Modern \$15-25 electronic coin acceptor wired to GPIO for the theatrical quarter; original mech kept cosmetically. |
| Bells/ringer | ❌ skip | Real bells need ~90V/20Hz. Play ring sounds through the earpiece, or a small speaker in the body for ambient ring-outs (the desert phone RINGING at passersby = mandatory mythology). |

**Electronics per unit:** Pi Zero 2 W (rotary, ~\$20) or Pi 5 (payphone, headroom), USB audio dongle, PAM8403 amp, electret capsule, LTE modem/router, buck converter + PSU. Rotary stopgap lands ~\$80; payphone unit as budgeted (~\$550-850).

**Audio path note:** echo cancellation matters (handset mic hears earpiece). The Realtime API tolerates some, but enable software AEC (or use a USB codec with built-in AEC) before debugging "the persona interrupts itself."

### MVP build checklist (2026-07-28)

**Accounts / services (~\$10-15/mo fixed + usage):**

| What | Choice | Notes |
|---|---|---|
| Git repo | New private GitHub repo (`elsewhere` or similar) | Code repo, separate from ops. Persona prompts live IN the repo — the IP under version control |
| Bridge hosting | **Fly.io or Railway (~\$5/mo) — NOT Vercel** | The bridge holds long-lived WebSockets (Twilio ↔ OpenAI); serverless can't. One small always-on Bun process |
| Landing page | Vercel free tier (or served from the bridge) | Static: brand placeholder, the phone number, one line of copy |
| Database | Supabase free tier | Calls, transcripts, seed numbers, consent flags. Supabase Studio doubles as the transcript-review UI — no admin dashboard build needed |
| Telephony | Twilio: 2 local numbers (~\$1.15/mo each) | Voice-capable; inbound only (no A2P registration hassle). Number A → Devil-direct, number B → Operator |
| AI | OpenAI API account | gpt-realtime-mini to start; **set a hard \$25/mo budget cap day one**; enable input+output transcription events |
| Domain | Defer until name is chosen | vercel.app subdomain is fine for friend-testing |

**Repo skeleton:**
```
apps/bridge/      Bun/TS: Twilio Media Streams ↔ OpenAI Realtime WS relay,
                  call lifecycle, Supabase writes
apps/web/         Landing page
packages/personas/  One file per persona: system prompt, cold opener,
                    memory style, voice config — versioned, reviewable
supabase/         Migrations
```

**Supabase schema (v0):** `calls` (id, called_number, caller_number, persona, started_at, ended_at, duration_s, completed, transcript jsonb, tokens_in, tokens_out, cost_estimate, claim_code, consent_publish bool), `seed_numbers` (number, sent_at, context_variant A/B) — share detection = callers not in `seed_numbers`.

**Wiring:** Twilio number → webhook → bridge `/incoming` → TwiML `<Connect><Stream>` → wss back to bridge → OpenAI Realtime session with persona prompt selected by called number. OpenAI publishes a Twilio↔Realtime reference implementation (Node) to crib from; Bun port is trivial.

**Build order (roughly 3 evenings):** 1) bridge relay with hardcoded Devil prompt, hear it work via Twilio dev number → 2) Supabase logging + transcripts → 3) Operator routing on number B + personas package + landing page → seed the friend list.

## 10. Open questions tracker

- **Full transcript reload vs. summary on return calls:** transcripts are *text*, so reloading even a whole prior call into context is cheap (\$4/M input, \$0.40 cached). The real question is quality: does full-transcript recall feel magical or does it make the persona weirdly obsessive about old details? Experiment at stage 0 with both. (Summaries also degrade gracefully across many calls; transcripts don't scale past a few.)
- Cold-open vs. one-line-context conversion rates (A/B in seed texts — data will answer).
- Family-safe persona board for daytime venues — worth the roster split?
- \$5/block price test per venue type.
- Does the Operator-as-menu confuse cold callers vs. direct-persona answer? (Desert phone probably wants the Devil picking up directly; venue phones want the Operator.)
- Name/trademark check for brand candidates.

Sources: [Deus in Machina coverage (Forbes)](https://www.forbes.com/sites/lesliekatz/2024/12/14/when-ai-jesus-entered-the-confessional-lessons-from-a-divisive-experiment/) · [NBC on AI Jesus](https://www.nbcnews.com/news/world/deus-machina-swiss-church-installs-ai-jesus-connect-digital-divine-rcna182973) · [ELVIS Act (Wilson Sonsini)](https://www.wsgr.com/en/insights/the-elvis-act-setting-the-stage-for-policing-unauthorized-use-of-ai-generated-sound-and-likeness.html) · [CA AB 1836 (Fenwick)](https://www.fenwick.com/insights/publications/californias-new-ai-laws-limit-uses-of-digital-likeness) · [Voice agent pricing 2026 (Famulor)](https://www.famulor.io/blog/ai-voice-agent-pricing-2026-what-10-platforms-actually-cost-per-minute) · [Voice AI cost calculator (Softcery)](https://softcery.com/ai-voice-agents-calculator) · [OpenAI Realtime API pricing, measured sessions (HackerNoon)](https://hackernoon.com/openai-realtime-api-pricing-in-2026-real-world-data-from-4000-measured-sessions) · [Realtime cost/latency traps (TokenMix)](https://tokenmix.ai/blog/openai-realtime-voice-api-2026-cost-latency)
