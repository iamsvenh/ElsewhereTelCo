# Elsewhere as a world company — vision

**Status: v2, ratified by redline 2026-07-23.** Reframes the product per the worldbuilding direction. `concept.md` remains the operational record (stages, economics, kill criteria — unchanged by this doc); this describes what the thing IS and where it goes. Canon and the Devil bible are cut from this.

> **What this does NOT change:** the next work block is still World One — canon v1 + the Devil bible. Everything below enriches the *frame* we build the Devil inside; none of it competes with him for the next block. Vision is not a to-do list; it is the shape the to-do list has to fit.

## 1. The reframe

Elsewhere Telephone Company is not an AI-voice novelty. It is an **interactive fiction company whose medium is the telephone**: a coherent universe explored entirely by voice, entered through vintage phones across time and space (one deserted in a desert; some installed in novel places — urban cores, bars; others temporary at events) and through phone numbers. Personas are not the product; they are _Residents_ — doorways into districts of one world. The measure of a great call is that the caller went somewhere and wants to go back.

Why this framing wins:

- **It attacks the documented #1 risk.** Novelty decay kills gag personas; worlds retain (people revisit places, not punchlines).
- **Voice-only is a differentiated artistic position.** In a saturated visual culture, a world you can only _hear_ — through a handset, eyes free — is unusual, intimate, and cheap to produce relative to any visual medium.
- **The moat compounds.** Canon accreted from thousands of real calls (§10) is IP no competitor can copy with the same model API.
- The vintage phone remains the perfect portal artifact: secondary as technology, essential as threshold.

## 2. Terminology (locked)

The house vocabulary. Use these words consistently in docs, prompts, and canon.

| Term            | Meaning                                                                                              |
| --------------- | ---------------------------------------------------------------------------------------------------- |
| **Elsewhere**   | the universe — the one cosmology                                                                     |
| **the Exchange**| the connecting company / infrastructure fiction; the diegetic UI (rate cards, Operator, tariffs)     |
| **the Management** | the off-stage authority everyone answers to, including the Devil. Never voiced. Also our editorial hand, masked (§4) |
| **world / district** | a tonally distinct region a line connects to (the Underworld, the Kitchen, 2036)                |
| **line**        | a phone number / doorway into a district                                                             |
| **Resident**    | an inhabitant you call — the Devil, Mom, God, Future You. They _reside_ in districts                  |
| **subscriber**  | a human caller with an account. Their **phone number is their account number** (§7)                  |
| **the Ledger**  | the Management's registry of subscribers and accounts (the Underworld flavors it "the Eternal Ledger")|
| **the back-channel** | any contact the world initiates back toward a subscriber — text, voicemail, callback (§5)        |

Residents _have_ a listing in the directory; they _are_ Residents. Subscribers are the humans; Residents are who they reach.

## 3. Guardrails (staged — vision vs. how we build early)

The discipline that keeps this from becoming mush, written so it does not pigeonhole the ambition. Each rule distinguishes the **invariant** (never changes) from the **early-stage constraint** (temporary scaffolding while we prove fun).

1. **Sequencing.** Stage 0 metrics and kill criteria are UNCHANGED. World investment follows caller pull; a cosmology cannot rescue a call that is not fun.
2. **The call is the unit of delivery, not the unit of story.** _Early:_ every element must be reachable and fun within a single 5-minute call, because there is no memory yet — each call stands alone. _As progression lands:_ the story unit grows past one call — arcs span sessions, unlocked by extensions, codes, and memory. Not NES-restart. **Invariant:** everything must be reachable by phone and fun to hear. "Experienced" scales from one call to a long campaign; "by phone" never bends.
3. **Canon is always authored and ratified — postcard now, districts later.** _Early:_ build one postcard at a time, behind where callers actually push; don't build the whole map before anyone walks it. _Later:_ deliberate district-scale world-craft as retention proves out. Caller-pull is _one_ input; authorial conviction is the other — we build behind callers AND ahead of them where we have vision. **Invariant:** every entry passes the editorial gate (§10); nothing is live-improvised into permanence. AI Dungeon is the cautionary tale.
4. **Offline generation only.** LLMs may draft world extensions between calls (§10); live Residents improvise only small, canon-consistent details, never new cosmology.
5. **Abstraction is the purpose; the concrete is the method.** "Meaning" is not a district. But the concrete places exist _precisely_ to make the abstract explorable: Hell is how you explore mortality, 2036 how you explore consequence. Write the person, the object, the place — and the theme comes through them.

## 4. Cosmology

**One universe, many districts.** The Exchange connects all realms: Hell, the future, the eternal Kitchen, anywhere else we open a line to. Every Resident — the Devil, your mother, the dead, the future, eventually God — answers to the same authority.

**The Management.** Never met, never voiced, never explained. "Calls may be monitored for quality by the management" is not boilerplate; it is the only thing anyone truly knows about them. Each Resident has a relationship to the Management (the Devil resents them; the Operator is devout; Mom finds them lovely — they send a card). The company frame is the cosmology; the deadpan never breaks.

**The Management is also our editorial hand, wearing an in-fiction mask.** Three layers:

1. **The Management** (in-fiction, off-stage): the authority everyone answers to. Never voiced, because the author is never a character.
2. **The Exchange / ETC** (diegetic company): what the subscriber touches.
3. **Us** (real builders): the writers' room, outside the fiction.

This gives us a **diegetic changelog**: every product decision becomes lore. Cost caps = the Management rationing. Downtime = an audit. A removed feature = "that exchange has been decommissioned by order of the Management." A new rule = "Management policy." Our god-hand reaches into the world without ever breaking the wall.

**Districts are tonally independent but share one timeline.** Hell runs bureaucratic comedy; 2036 runs melancholy hope. But they are **factually and causally coherent**, and this is core, not decoration: a thing that happens in Hell's _now_ can be revealed as the cause of a future you already visited (the Back-to-the-Future reveal). Non-linear cross-district payoffs are the deepest retention magic we have. This is a 2.1+ payoff (needs the world clock + multiple districts), but we **design toward it now** — every canon entry carries causal links from day one (§10).

## 5. The ontology (elements of the medium)

| Element                 | What it is                                                                         | Examples / notes                                                                                                                          |
| ----------------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Universe**            | the one cosmology: the Exchange, the Management, the physics of what can happen    | §4                                                                                                                                        |
| **Districts (worlds)**  | tonally distinct regions a line connects to                                        | Hell; 2036; the Kitchen. Each has tone, geography, cast, and its own clock                                                                |
| **Residents (primary)** | playable doorways = phone lines. Full character bibles (core / registers / mood)   | Devil, Mom, Future You, Operator                                                                                                          |
| **Referenced cast**     | voiced _through_ a Resident (quoted, overheard, muffled), one prompt paragraph each | the notary. Mrs. Devil (undefined slot — see §5a)                                                                                         |
| **Reachable cast**      | a secondary Resident you can actually be connected to. Shallower bible, cheaper model, latency-tolerant | the Devil's secretary; the notary you can call. Gatekeepers and stepping-stones in the quest (§8)                       |
| **Off-stage entities**  | load-bearing mysteries. NEVER voiced, never explained                              | the Management                                                                                                                            |
| **Interaction model**   | telephony verbs — the switchboard is the world map                                 | dial, ask, hold (Hell's hold music), transfer, extensions, busy signals, wrong numbers, deposit coin, call back                           |
| **The establishing layer** | pre-produced scene-setting that stages the threshold _into_ a Resident: ambient bed + short narration. Voice-only's answer to a play's stage directions | the smoky Left-Bank café you _hear_ before the philosopher picks up; Hell's typewriters + hold music. Zero live cost; bookends the live encounter (§8, §5c) |
| **The back-channel**    | contact the world initiates back toward the subscriber (async, world→you)          | the Devil texts "you up?" at 4am; a voicemail from 2036 on a Tuesday. Re-engagement loop (§5b)                                            |
| **Objects / artifacts** | speakable, persistent things                                                       | contract numbers, form 666-B, appointment slips — anything a subscriber can say back later                                                |
| **State & memory**      | what persists                                                                      | per-subscriber (the Ledger + summaries = progression), per-district (the world clock: audit season, outages), global (canon)              |
| **Secrets**             | Easter eggs native to the medium                                                   | unlisted extensions, a number the Devil mutters once, magic words, cross-line references. In this medium, an Easter egg IS a phone number |
| **The frame**           | the company itself as diegetic UI                                                  | rate cards, disclaimers, tariff notices, the Operator. The brand is inside the fiction                                                    |

### 5a. Mrs. Devil — undefined slot

Not canonized as a wife. A feminine presence adjacent to the Devil exists as a supporting-cast slot with the relationship **deliberately undefined** — a consort, an ex who won't leave, or a damned soul angling for favor. Resolve via transcript pull, not upfront. The ambiguity is usable, and it unblocks the Devil bible (which no longer has to answer "is he married").

### 5b. The back-channel (async, world → subscriber)

The first mechanic that reaches _out_ of the call. Between sessions, the world can text, leave a voicemail, or call back. This is the re-engagement / lead-magnet loop that turns a one-off call into a relationship: you called Hell once, and at 4am the Devil texts. It works to **any** device (a subscriber's cell included), so it is not exclusive to hardware phones. **Consent-gated:** outbound SMS/calls are A2P/TCPA-regulated (same bucket as signup-notify). The fiction carries the opt-in ("may the Exchange reach you on this line?"). Lands post-Stage-0 with the A2P work.

### 5c. The establishing layer (scene-setting — Sven, 2026-07-24)

Voice-only has no set. A play sets the stage in stage directions; a text adventure describes the room; we have neither a screen nor a live budget to narrate every scene. So the world is staged by a **pre-produced establishing beat** on the threshold _into_ a Resident: an **ambient bed** (you _hear_ the smoky Left-Bank café — murmur, an accordion, a cup set down) plus, optionally, a few lines of **scene-setting narration** ("A café off a wet alley. Someone has been nursing the same coffee for three hours."). Then the live Resident picks up.

Three tools, sound doing the heavy lifting: (1) **ambient bed** — the most immersive and most diegetic (hearing the place beats being told about it); (2) **narration** — the play's stage-direction instinct, a light seasoning; (3) the **Resident's own dialogue** implying setting. All pre-produced (Sven's call, and correct): zero live cost, authored/consistent, reusable every visit.

**Narrator register is per-world, not one universal voice** (the café is literary; Hell is bureaucratic ambient — typewriters, hold music). The **Operator** does the deadpan telco handoff ("connecting you to the Left Bank, hold please"); the establishing beat is the world's threshold. _Open:_ whether a single **signature narrator** (Night-Vale-style recurring brand voice) ever unifies it — powerful but centralizing; decided per world for now.

Why it's load-bearing beyond atmosphere (see §8): pre-produced staging **bookends** the expensive live minutes, so a 3-minute live encounter _feels_ like a whole visit (you arrived through a place and leave through one). Short live time reads as rich — it directly serves metered-depth / unmetered-breadth, and it fixes the cold "pickup" into an actual threshold (the vintage-phone-as-portal thesis made audible).

## 6. The IRL axis, and what a hardware phone actually is

Every object has a location: **in-world**, **IRL**, or **both**. "Both" is where the magic and the merch live — nostalgic physical artifacts that are simultaneously game surfaces:

| Object                        | In-world                            | IRL                                                                                                  |
| ----------------------------- | ----------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Vintage phone                 | the subscriber's terminal           | the portal artifact (§6a)                                                                            |
| Switchboard                   | the world map                       | future admin/atlas view                                                                              |
| **Yellow Pages of Elsewhere** | the directory Residents reference   | printed book chained beside the phone — numbers, "disconnected" lore entries, a few live Easter eggs |
| Classified ads                | how Residents advertise             | print/posters with callable numbers ("LOST: one horse. Ask for the DEVIL.")                          |
| Rate card / tariff notices    | the Management's pricing            | the pricing page and venue placards                                                                  |
| Calling cards                 | long-distance payment               | prepaid gift cards; also the key-in-your-number identity flow (§7)                                   |

Design rule: high-tech experience, nostalgic interface — on BOTH sides of the portal.

### 6a. Numbers vs. ETC hardware phones

Two ways a human enters Elsewhere, and they are **not** the same:

- **The subscriber's own device** (cell/landline): dials an entry number. Caller ID = identity, automatically. Outbound doorways, available to anyone.
- **An ETC hardware phone** (desert phone, venue payphone, a home unit): a physical object we make and place. Its pitch is not "it can ring" (the back-channel rings any phone) — it is being a **dedicated physical object**:
  - a thing in your home that connects to _nothing but Elsewhere_ and can ring on its own — a haunted object beats a notification;
  - **placeable in the world** (desert, bar, venue) — public/shared access and ARG nodes; a number can't sit in a desert;
  - **tactile, dial-only affordances** — a real rotary, a coin slot, physical extension cards;
  - **shared-device identity** — you key in your own number + PIN (§7).

Physical units remain the premium portals throughout — the brand's soul, explicitly _thresholds into the world_ rather than the product itself.

## 7. Identity & progression

**Your phone number is your identity — no claim codes.** When the Exchange registers you in the Ledger, your account number _is_ your phone number. Nothing cryptic to remember.

- **Own device:** caller ID recognizes you frictionlessly. If you have an active plan / credit, you're let in.
- **Shared or hardware device:** you key in your own phone number (which you always know) + a PIN. This is exactly how calling cards worked — period-authentic, and it ties to the calling-card artifact.
- **Never voiceprints** (BIPA — absolute).

Requires: a `subscribers` table keyed on phone number, per-district memory summaries, recognition on both paths. Onboarding is in-fiction: the Exchange opens a subscriber file; Residents note your number in character.

**Progression has two axes, and one of them needs no database:**

1. **Account state** (needs the Ledger): plan tier, credit, per-district memory, unlocked lines. This is the save file.
2. **Knowledge-as-save-state** (needs nothing): knowing a secret extension, a magic word, how to reach the secretary — the knowledge lives in the caller's head. A Stage-0 caller who _learns_ an unlisted extension has genuinely progressed with zero identity infrastructure. Much of "leveling up" is learning the world's affordances. Cheap, deep, and available now.

**Leveling is dressed as telco billing.** Long-distance costs more; the deeper you go, the more it costs; the direct line to the Devil is premium, the secretary cheaper. As you level, you **unlock cheaper access** — the resident/local discount, loyalty pricing. Real telco (loyalty plans) and real game progression (grinding unlocks) in one fiction.

## 8. Production layers & economics

**The feeling comes first; the cost layers serve it, never the reverse.** We build the encounter to feel _dynamic_ and alive, then find the cheapest way to deliver _that_ feeling — and if cheap feels dead, we ramp back up and do the math. Dynamism is the north star; cost discipline is in service of it.

With that established, delivery is a **spectrum**, and the key insight is that **latency and model quality can be characterized** — a slow, terse NPC is a feature, not a defect:

1. **Premium live** (realtime-2, low latency) — the boss encounters. The Devil. Rationed, capped, fiction-justified: an audience with the Devil is scarce, of course it is. Highest cost (\$0.04–0.11/min), highest magic.
2. **Budget live** (mini or cheaper, latency-tolerant) — the secretary, minor Residents. Slowness baked in as character: "the notary takes his time." Carries more interaction hours cheaply.
3. **Pre-produced audio** — the overworld, near-zero marginal cost, period-authentic: haunted IVR trees ("press 6 if you have already been damned"), hold music from Hell, voicemail boxes, disconnected-number recordings ("...since the incident"), time-and-temperature for 2036. Full character voices (ElevenLabs et al.) live here because latency doesn't matter for clips. Explorable for many minutes per session.
4. **Print/web lore** — the atlas. Yellow Pages, tariff documents, the map artifact. Zero marginal cost, infinite depth.

**Pre-produced staging amplifies the live layers.** Layer 3 isn't only a standalone overworld — it also _stages_ the live encounters. The establishing beat (§5c) bookends a Resident: the threshold in (ambient bed + scene-setting) before the live minutes, a closing beat after. Voice-only has no set; this is how we build one, and it makes a short, cheap live encounter feel like a full scene — the cleanest lever for "short live time, rich experience."

**Diegetic cost control (the frame's unfair advantage):** busy signals ARE rate limiting, "please deposit 25 cents" IS metering, off-peak rates ARE load shaping. No cost mechanism ever needs to break the fourth wall.

**Economics sketch:** heavy player at 10 hrs/mo pure-live ≈ \$25–65 inference (unworkable). Same hours at 20–30% live ratio ≈ \$6–18 (workable under subscription). Pricing fiction: **you don't buy AI minutes, you get a phone plan** — subscriber plans, prepaid calling cards, long-distance rates to the Beyond. Metered depth, unmetered breadth: the meter gates only the premium live layer, never the overworld. "The Devil takes one audience per day on the basic plan" (Wordle-style scarcity as retention ritual).

**Self-hosting seam (stage 4 / fundraising).** At scale, inference is COGS and vertical integration (self-hosted open-weight voice/realtime models) becomes a margin lever and a fundraising story. We already future-proofed it: the runtime persona config makes _model_ a DB lever, so a self-hosted backend slots into that exact seam with no rewrite. Design nothing new today; note it.

**Business model.** Venue B2B is the revenue floor; the deep game trends toward subscription dressed as a phone plan (per-minute stays as _fiction_ on the rate card regardless of what's underneath). The fundraising artifact is retention evidence + the video, not lore volume. Artizen: testing pool AND funding fit (match rounds, art-drop framing) AND future collaborators for the eventual visual layer.

## 9. Themes & stance

The world can hold a mirror to real conditions — surveillance, precarity, bureaucratic dehumanization (the Management), consequence and climate (2036), mortality (Hell) — and this is part of the mission. But:

**The world observes; it never lectures. Register carries the critique.** The deadpan telco frame _is_ the stance: it satirizes systems by playing them perfectly straight (Vonnegut, Orwell, Night Vale's surveillance-state-as-municipal-cheer). The Management is the panopticon — Big Brother recast as a phone company's quality-assurance department — which makes "calls may be monitored" the timely, load-bearing line it is.

**Non-partisan by construction:** we critique conditions and systems, never parties, figures, or named real-world politics (also enforced by the no-real-people guardrail). 2036 is the home for near-future societal what-ifs; Hell for the moral and mortal; the Management for control and surveillance. No character ever delivers an op-ed.

## 10. The world-growth flywheel (aimed at lore)

1. Residents improvise small canon-consistent details live (never new cosmology).
2. Nightly/weekly: an analysis pass over transcripts finds (a) improvised lore worth keeping, (b) **thin walls** — places callers pushed and found the world shallow (the "what's the Management?" moment).
3. The backend drafts canon extensions for thin walls (a cheaper/stronger text model with worldbuilding instructions — NOT the realtime model, NOT live).
4. Sven reviews; git review is the ratification gate; approved entries join canon; every Resident knows them next call.
5. Canon is stored as **structured entries** (type: place/character/object/fact; district; **causal links** — designed in from day one for §4's cross-district payoffs), not prose — so the same data feeds persona prompts now, a queryable lore index later, and the visual atlas eventually.

## 11. Marketing & anticipation (diegetic growth signals)

How we announce "there is more now" without giving it away. A **two-channel split**:

- **Loud but vague** to the signup list — in-fiction service bulletins: "the Exchange is pleased to announce the Down trunk is now open." Never "new AI persona." **We already built the pipe:** the (806) 666-1212 signups are the broadcast channel. When World One opens, they get "your line to the Underworld is connected. Dial ___." That IS the 0→2.0 announcement mechanism.
- **Silent but specific** — the actual new extensions and numbers, found by digging (ARG-native). You are _told_ there is more; you have to _find_ what. The patch-notes-vs-actual-exploration split.

**Discipline:** Stage 0's metric is _unprompted sharing_, and the fundraising artifact is retention, not reach. Build the announcement _pipe_ (cheap, we have it); don't build a marketing _machine_ before the sharing signal exists. Leak, don't spray.

## 12. Craft blueprints borrowed from adjacent media

- **TV writers' rooms:** the _show bible_ (our canon) + showrunner authority (Sven as editor-in-chief) + writers who pitch (the LLM drafting pipeline).
- **TTRPG game-mastering:** prep situations, not plots; improvise within canon; the world has its own clock and moves between sessions. The lineage of the actor-craft layer.
- **Immersive theater / Meow Wolf:** discovery beats exposition. The world never explains itself unprompted; callers who dig are rewarded. Also the commercial comp (lore-dense worlds behind mundane portals) and a potential customer.
- **Audio drama (Night Vale, Magnus Archives, Wolf 359):** tone discipline and serialized lore drops; Night Vale is our register's closest cousin and proof of decade-scale retention in audio-only weird.
- **ARG (ilovebees, Cicada 3301):** the fiction leaks into reality. Phone numbers are reality-native; the desert phone is an ARG node by birth.
- **Interactive fiction (Zork → AI Dungeon):** freedom needs landmarks to be legible; constraint is what makes generative fiction art.
- **SCP Foundation:** the endgame precedent for community-written canon under editorial gates (stage 4+).

## 13. Trajectory (media-company arc, each stage funded by the last)

- **Now → Stage 0 (unchanged):** one line, one district door. Prove the call is fun and gets shared. Everything below waits on this. **Amended question:** not only "do they share it" but "_did the caller understand there's a world to explore, or was it a novelty conversation?_" Measurable now via lore-probe rate (unprompted world questions in transcripts), repeat-call rate, sharing. A caller asking "what's the Management?" has understood the product.
- **MVP 2.0 — "World One" (the Underworld, LOCKED):** Hell done properly — canon v1, Devil bible (core / registers / mood), opener kit + silence + mood mechanics, 1–2 supporting cast (referenced + one reachable), 2–3 secrets (first unlisted extension), Operator as the switchboard frame on Number B (company-level in fiction — "tonight only the down trunk is open" — so future worlds are one-line additions). Mom and Future You go dormant as stubs ("closed for maintenance"). Depth-first beats breadth-first. Metrics: repeat calls, call length, shares.
- **2.1 — Progression:** phone-number identity + per-district memory = the save file; cross-line coherence; the world clock starts ticking (audit season); the back-channel goes live (consent-gated).
- **3 — More districts + the lore engine:** structured canon store, thin-wall detection, drafting pipeline with approval UI (Studio at first); the map artifact becomes renderable. **Candidate future districts:** the Kitchen (Mom), 2036 (Future You), and the **Phreak/Hacker district** — the network's underbelly, people gaming the Exchange against the Management, where the blue box is a literal diegetic cheat code and the surveillance theme finds its resistance.
- **4 — The media company:** contributor program (SCP-style editorial gates), ARG surface (the desert phone campaign), licensing/commissions (Meow Wolf-shaped deals: physical portals into our universe), possibly the visual atlas as a product surface. Self-hosted inference becomes viable at this volume.

## 14. Still open

- Claim-code fiction is retired; identity is the phone number + PIN. Remaining identity work is just the `subscribers` table + memory summaries (2.1).
- Canon-entry structure: markdown in repo until entries exceed ~50, then a Supabase schema. Causal-link fields designed in from the first entry regardless of storage.
- Reachable-cast roster for World One (secretary? notary?) — decide during the Devil bible, driven by the quest shape.
