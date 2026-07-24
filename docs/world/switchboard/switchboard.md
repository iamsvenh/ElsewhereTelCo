# The Switchboard — World Zero (experience & Operator design)

**Status: design DRAFT for Sven's redline, 2026-07-24.** The switchboard treated as a *world*, so it gets the same craft as any other (Sven's call): world canon + a real Resident (the Operator) + a designed experience, not a phone tree. Pairs with the engineering/build spec in `docs/engineering/switchboard-v0.md` (menu architecture, KPI event model, compliance); this is the creative/experience layer.

## Why it's a world

The switchboard is where **every caller lands first** — the hub, the lobby, World Zero. The first ~20 seconds decide everything (concept rule 5 / the cold-opener law, at system scale). If it feels like a phone menu, we've lost; if it feels like a *place* staffed by a *character*, we've won. So: the Exchange floor is a location, the Operator is a Resident, and the caller is routed *through* her to every other world. Designing it as a world also means the connective frame and the eventual real switchboard are the same thing, built with the same principles (`../worlds.md`).

## The place — the Exchange floor

The establishing bed already exists (produced for the teaser): the living-switchboard ambience — faint cross-talk, a woman laughing, someone weeping in a language you don't know, a dial tone from nowhere, a snatch of hold music that isn't quite music. That *is* World Zero's establishing layer (vision §5c). You don't need to be told it's a vast exchange; you hear it. Register: deadpan, mysterious, the endless night shift, a board lit with lines to everywhere.

## The Resident — the Operator (character core)

Grounded in what's already decided (teaser delivery note: "1950s switchboard operator, clipped/deadpan, nothing is unusual to her"; the smoky-2 Voice-Designed voice: "grumpy lady, 50s hairdo, cigarette, can barely be bothered"; canon: "the Operator is devout to the Management").

> **Want:** to get you connected and off her board — it's a busy night and she's seen everyone. **Worldview:** nothing is unusual; the strange is the routine; the Company frame is absolute and the Management is to be revered. **Status:** she holds the power — she decides which lines are open tonight, and whether she puts you through. **To the caller:** you are one of thousands on a lit board; she's brisk, a half-beat impatient, never cruel, and every so often lets slip something that hints at the vastness behind her.

She runs the same "assertive by structure" engine as the Devil (`../persona-design-notes.md`): she conducts the call — she's the one connecting you, not the one being interviewed. That's what makes a passive or confused caller feel guided instead of lost.

**Open:** nameless (like the Management — adds mystique; my lean) vs. named (humanizes). Recommend nameless for now.

## The experience flow

**Beat 0 — Connection (infra, settled fix).** **One ring** — that's enough (more feels slow); confirm the media connection is fully established, let a beat of the exchange bed breathe, *then* she speaks. This fixes the live bug Sven logged (the VO currently starts before connection and the intro cuts off / jumbles). The establishing bed lives here. Non-negotiable: the first words must always land clean.

**Beat 1 — The Operator's cold-open (3-job law, ≤8s).** Establish who she is (operator, the exchange), cast the caller (you've reached the switchboard; you want something), hand them the keypad. Grounded in "Elsewhere Telephone Company, operator speaking." Then straight into the menu (barge-in on).

**Beat 2 — The menu.** The switchboard choices. *Open — brainstorm (see §Decisions).*

**Beat 3 — Press 1, the Devil → the receptionist wall (SETTLED, Sven).** The hottest-intent callers press 1. She tells them, in character, that he's out ("off gallivanting, as usual"), and plays the **receptionist pitch — which is the current teaser, nearly verbatim** — then captures them (notify / leave number). So the people who most want the product get the full pitch *and* the capture, exactly when they're most primed. This defers both the cost and the thin-Devil first impression, while the switchboard still *sounds* like it connects to the Devil. When the Devil rebuild ships, this beat flips from "he's out" to actually connecting (or to a subscriber gate — see §staging).

**Beat 4 — Press 2, "what is this."** A shorter "what is Elsewhere" explainer (a trim of the teaser, or its own clip), ending by offering the link.

**Beat 5 — the link / leave your number.** Capture; recite the vanity URL aloud now (SMS later, per compliance).

**Beat 6 — Fall-through** (repeated no-input/invalid). *Open — needs design (see §Decisions).*

**Beat 7 — Hidden easter egg** (unannounced key). *Open — brainstorm (see §Decisions).*

Throughout: **react in character the instant they press** ("Connecting you. Don't say I didn't warn you."); **vary the lines** (a small pool per beat so repeat callers and hand-the-phone-around sharers get something new). Impatience is the comedy; the "you didn't press anything" state is a beat, not an error tone.

## Production & staging

- **Now: pre-produced, high production value** (Sven's mandate: not boring). Same pipeline as the teaser (smoky operator VO + real ambience + foley, telephone-mastered), plus line-variant pools. The bar is "sounds like a place with a person in it," not "IVR."
- **Later: the Operator goes live** (Stage 2+). Design her character *now* so the pre-produced her and the future live her are the same person — the pre-produced menu is her "on script"; live, she improvises within the same core and routes dynamically. World Zero is the natural first place to put a live Resident because routing is bounded (safer than open-ended chat).

## Data model — two points of view (Sven's ask)

One source of truth, two lenses:
- **`switchboard_events`** (the *switchboard's* POV) — the append-only event log, source of truth (schema in switchboard-v0.md §5). Every keypress / segment-played / drop-off / transfer, timestamped, with press-latency.
- **The user-journey view** (the *caller's* POV) — a chronological, per-`caller_hash` replay of everything they've ever done, across calls, so we can watch a person's path and draw conclusions without re-deriving each time. Recommend building this as a **view / materialized view over the event log, not a separately-written table** — a dual-write second table drifts out of sync; a projection can't. Same data, two windows: one from the board, one over the caller's shoulder. (Open for your sign-off: view vs. materialized table.)

This is exactly the "record the entire journey, timestamp it, map which links they click at which point" you asked for — the event log captures it; the journey view makes it replayable.

## Decisions to brainstorm (decision-block, propose → you pick)

**A. The menu — set, order, phrasing.** Options:
- **A1 (my lean): 4 doors + hidden.** 1 = the Devil (→ receptionist wall), 2 = what is this, 3 = the link, 4 = leave your number. Devil in the primacy slot (it's what they came for), capture in the recency slot.
- **A2: 3 doors, tighter.** 1 = the Devil, 2 = what is this / notify me (merged), 0 = operator/egg. Fewer choices = less to hold in memory; loses the standalone "text me" ask.
- **A3: "who are you trying to reach?"** Lean all the way into switchboard fiction — she asks who you want, and *any* answer (Devil, God, my mother, "I don't know") routes to a matching deflection + capture. More magical, more production (more branches/clips), riskier to land. 

**B. The Devil-wall copy.** B1: reuse the existing teaser almost verbatim as the option-1 deflection (fastest, it already fits). B2: cut a shorter, punchier "he's out" variant specific to option 1, and keep the full teaser for the "what is this" branch. My lean: **B2** — a tight "he's out" beat for the impatient option-1 presser, full pitch on option 2.

**C. Fall-through default** (repeated no-input). Options:
- **C1 (my lean): recite the URL + a dry goodbye.** "Suit yourself. It's elsewheretel.co if you change your mind. Good day." Turns silence into a captured takeaway, no cost.
- **C2: she connects you anyway** — to the receptionist pitch (treat silence as "surprise me"). More generous, keeps them on the line.
- **C3: pure goodbye** with the Management sign-off. Cleanest, captures nothing.

**D. The hidden easter egg** (unannounced key — the highest-leverage fun/sharing element). Brainstorm seeds:
- **D1:** press `0` → she sighs, drops the script half a beat ("You pressed zero. Everyone presses zero.") — a rare glimpse of the person behind the board.
- **D2:** a secret extension the Devil "mutters" elsewhere → dialing it reaches a disconnected-number lore recording ("…since the incident").
- **D3:** press `6` three times → a bit about the Management ("That's not a number you want to reach. It's already reached you.").
- **D4:** hold music from Hell (press `★` → you're "on hold," and the hold music is unsettling and funny).
- **D5:** a wrong-number bit — you reach a different world's line by "mistake" (a taste of another district, seeding the map).
My lean: **D1 + D5** — one humanizing beat, one map-teasing beat; both are shareable ("listen to what happens when you…").

**E. Operator: nameless or named?** (My lean: nameless.)

## Ratified decisions (from Sven, 2026-07-24, folded in)
- Live-Devil connection is **gated behind the receptionist wall** for now (cost + thin-Devil first impression); the switchboard still *sounds* like it connects. Subscriber-gating deferred (too much friction before people know what they'd pay for).
- Record the **entire journey**, timestamped (event log + journey view).
- The Operator is **pre-produced now, high production value, designed to go live later.**
- **SMS deferred** (10DLC friction); recite-URL for now.
