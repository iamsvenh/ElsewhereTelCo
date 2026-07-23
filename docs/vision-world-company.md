# Elsewhere as a world company — vision draft

**Status: DRAFT for Sven's redlines, 2026-07-23.** Reframes the product per the worldbuilding direction. `concept.md` remains the operational record (stages, economics, kill criteria — all unchanged by this doc); this describes what the thing IS and where it goes. Ratify by redline, then we cut MVP 2.0 stages from it.

## 1. The reframe

Elsewhere Telephone Company is not an AI-voice novelty. It is an **interactive fiction company whose medium is the telephone**: a coherent universe explored entirely by voice, entered through vintage phones and phone numbers. Personas are not the product; they are *inhabitants* — doorways into districts of one world. The measure of a great call is that the caller went somewhere and wants to go back.

Why this framing wins:
- **It attacks the documented #1 risk.** Novelty decay kills gag personas; worlds retain (people revisit places, not punchlines).
- **Voice-only is a differentiated artistic position.** In a saturated visual culture, a world you can only *hear* — through a handset, with your eyes free — is unusual, intimate, and cheap to produce relative to any visual medium.
- **The moat compounds.** Canon accreted from thousands of real calls (see §6) is IP no competitor can copy with the same model API.
- The vintage phone remains the perfect portal artifact: secondary as technology, essential as threshold.

## 2. Non-negotiable guardrails on the vision

1. **Sequencing:** Stage 0 metrics and kill criteria are UNCHANGED. The 5-minute call is the atomic unit; if it isn't fun, no cosmology saves it. World investment follows caller pull, never precedes it.
2. **Callable lore only:** every canon element must be reachable and fun within a 5-minute voice call. If it can't come up in a call, it doesn't get written.
3. **Postcard canon:** the world is built one postcard at a time behind where callers actually push, never speculatively ahead of them.
4. **Offline generation only:** LLMs may draft world extensions between calls (see §6); live personas improvise only small, canon-consistent details. AI Dungeon is the cautionary tale — infinite live freedom produces mush.
5. **Abstractions are themes, not worlds.** "Meaning" is not explorable; a person in 2036 who knows how your choices aged is. Concrete places, characters, objects carry the abstract register.

## 3. Cosmology (pending ratification)

**One universe, many districts.** The Elsewhere Telephone Company operates the exchange connecting all realms: Hell, 2036, the eternal Kitchen, and anywhere else we open a line to. Everyone — the Devil, your mother, the dead, the future, eventually God — is a *subscriber*. Above them all: **the Management.** Never met, never voiced, never explained. "Calls may be monitored for quality by the management" is not boilerplate; it is the only thing anyone truly knows about them. Each inhabitant has a relationship to the Management (the Devil resents them; the Operator is devout; Mom finds them lovely — they send a card). The company frame is the cosmology; the deadpan never breaks.

Districts are tonally independent (Hell runs bureaucratic comedy; 2036 runs melancholy hope) but factually coherent — cross-references between lines are deliberate retention magic.

## 4. The ontology (elements of the medium)

| Element | What it is | Examples / notes |
|---|---|---|
| **Universe** | The one cosmology: the Exchange, the Management, the physics of what can happen | §3 |
| **Districts (worlds)** | Tonally distinct regions a line connects to | Hell; 2036; the Kitchen. Each has tone, geography, cast, and its own clock |
| **Primary personas** | Playable doorways = phone lines. Full character bibles (core / registers / mood) | Devil, Mom, Future You, Operator |
| **Supporting cast** | Voiced *through* a persona (quoted, overheard, muffled), one prompt paragraph each | The notary. Mrs. Devil (unratified — a marriage reshapes the wound; decide deliberately) |
| **Off-stage entities** | Load-bearing mysteries. NEVER voiced, never explained | The Management |
| **Interaction model** | Telephony verbs — the switchboard is the world map | dial, ask, hold (Hell's hold music), transfer, extensions, busy signals, wrong numbers, deposit coin, call back |
| **Objects / artifacts** | Speakable, persistent things | contract numbers, form 666-B, appointment slips, claim codes — anything a caller can say back later |
| **State & memory** | What persists | per-caller (claim codes + summaries = progression), per-district (the world clock: audit season, outages), global (canon) |
| **Secrets** | Easter eggs native to the medium | unlisted extensions, a number the Devil mutters once, magic words, cross-line references. In this medium, an Easter egg IS a phone number |
| **The frame** | The company itself as diegetic UI | rate cards, disclaimers, tariff notices, the Operator. The brand is inside the fiction |

## 4b. The IRL axis (added from Sven's reactions, 2026-07-23)

Every object has a location: **in-world**, **IRL**, or **both**. "Both" is where the magic and the merch live — nostalgic physical artifacts that are simultaneously game surfaces:

| Object | In-world | IRL |
|---|---|---|
| Vintage phone | the subscriber's terminal | the portal artifact (already core) |
| Switchboard | the world map | future admin/atlas view |
| **Yellow Pages of Elsewhere** | the directory inhabitants reference | printed book chained beside the phone — numbers, "disconnected" lore entries, a few live Easter eggs |
| Classified ads | how inhabitants advertise | print/posters with callable numbers ("LOST: one horse. Ask for the DEVIL.") |
| Rate card / tariff notices | the Management's pricing | the pricing page and venue placards |
| Calling cards | long-distance payment | prepaid gift cards |

Design rule: high-tech experience, nostalgic interface — on BOTH sides of the portal.

## 4c. Production layers (the cost architecture)

The vision multiplies engagement hours; inference cannot scale linearly with them. Three layers, cheapest carrying most of the time:

1. **Live AI personas** — the boss encounters. Scarce, premium, capped. The 5-minute cap is *fiction now*, not just a guardrail: an audience with the Devil is rationed, of course it is. Highest cost (\$0.04-0.11/min), highest magic.
2. **Pre-produced audio** — the overworld, near-zero marginal cost, and period-authentic by nature: haunted IVR trees ("press 6 if you have already been damned"), hold music from Hell, supporting-cast voicemail boxes, disconnected-number recordings ("...since the incident"), time-and-temperature for 2036. Full character voices (ElevenLabs et al.) are available here precisely because latency doesn't matter for clips. Callers should be able to explore this layer for many minutes per session.
3. **Print/web lore** — the atlas layer. Yellow Pages, tariff documents, the map artifact. Zero marginal cost, infinite depth.

Diegetic cost control (the frame's unfair advantage): busy signals ARE rate limiting, "please deposit 25 cents" IS metering, off-peak rates ARE load shaping. No cost mechanism ever needs to break the fourth wall.

**Economics sketch:** heavy player at 10 hrs/mo pure-live ≈ \$25-65 inference (unworkable). Same hours at 20-30% live ratio ≈ \$6-18 (workable under subscription). Pricing fiction: **you don't buy AI minutes, you get a phone plan** — subscriber plans, prepaid calling cards, long-distance rates to the Beyond; the claim code is your account number. Venue/event economics (short capped calls, \$/block) are untouched and remain the near-term revenue per concept.md.

## 5. Craft blueprints borrowed from adjacent media

- **TV writers' rooms:** the *show bible* (our canon file) + showrunner authority (Sven as editor-in-chief) + writers who pitch (LLM drafting pipeline).
- **TTRPG game-mastering:** prep situations, not plots; improvise within canon; the world has its own clock and moves between sessions. This is the actor-craft layer's lineage.
- **Immersive theater / Meow Wolf:** discovery beats exposition. The world never explains itself unprompted; callers who dig are rewarded. Meow Wolf is also the commercial comp: lore-dense worlds behind mundane portals — and a potential customer.
- **Audio drama (Night Vale, Magnus Archives, Wolf 359):** tone discipline and serialized lore drops; Night Vale is our register's closest cousin and proof of decade-scale retention in audio-only weird.
- **ARG (ilovebees, Cicada 3301):** the fiction leaks into reality. Phone numbers are reality-native; the desert phone is an ARG node by birth.
- **Interactive fiction (Zork → AI Dungeon):** freedom needs landmarks to be legible; constraint is what makes generative fiction art.
- **SCP Foundation:** the endgame precedent for community-written canon under editorial gates (stage 4+).

## 6. The world-growth system (the flywheel, aimed at lore)

1. Personas improvise small canon-consistent details live (never new cosmology).
2. Nightly/weekly: analysis pass over transcripts finds (a) improvised lore worth keeping, (b) **thin walls** — places callers pushed and found the world shallow (the "upper management?" moment).
3. Backend drafts canon extensions for thin walls (a cheaper/stronger text model with worldbuilding instructions — NOT the realtime model, NOT live).
4. Sven reviews; git review is the ratification gate; approved entries join canon; every persona knows them next call.
5. Canon is stored as **structured entries** (type: place/character/object/fact; district; links), not prose — so the same data feeds persona prompts now, a queryable lore index later, and eventually the visual atlas / map artifact.

## 7. Trajectory (media-company arc, each stage funded by the last)

- **Now → Stage 0 (unchanged):** one line, one district door. Prove the call is fun and gets shared. Everything below waits on this.
- **MVP 2.0 — "World One":** Hell district done properly: canon v1, Devil bible (core/registers/mood), opener kit + silence + mood mechanics, 1-2 supporting cast, 2-3 secrets (first unlisted extension), Operator as the switchboard frame on Number B. Metrics: repeat calls, call length, shares.
- **2.1 — Progression:** claim codes = memory = the caller's save file; cross-line coherence; the world clock starts ticking (audit season).
- **3 — More districts + the lore engine:** structured canon store, thin-wall detection, drafting pipeline with approval UI (Studio at first); the map artifact becomes renderable.
- **4 — The media company:** contributor program (SCP-style editorial gates), ARG surface (the desert phone campaign), licensing/commissions (Meow Wolf-shaped deals: physical portals into our universe), possibly the visual atlas as a product surface.
- **Physical units** (payphones, rotary, desert phone) remain the premium portals throughout — the brand's soul, now explicitly *thresholds into the world* rather than the product itself.

## 8. Open questions for redline

- Ratify the Management/Exchange cosmology (§3)?
- District naming: does "Hell" stay informal or get an in-world exchange name (e.g. "the Down Exchange")?
- Mrs. Devil: in or out (wound implications)?
- Claim-code fiction per district (contract numbers vs appointment numbers) — when do we wire memory?
- How much canon-entry structure now vs later (schema in Supabase vs markdown in repo)? Recommendation: markdown in repo until entries exceed ~50, then revisit.
