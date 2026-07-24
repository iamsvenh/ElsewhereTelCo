# Persona design process

v1, 2026-07-23. The repeatable method for designing an Elsewhere persona. Refined every time we run it; the lab journal of what each run taught us is `persona-design-notes.md`. We are designing an *experience*, not writing a chatbot prompt: natural, interactive, fun or contemplative as the caller steers it.

## The premise (cornerstone, 2026-07-23)

Elsewhere is **a world explored by telephone** — an interactive fiction, not a chatbot with a funny voice. Personas are inhabitants of one coherent universe; callers are adventurers poking at it. Every named thing in that universe is deliberate and rich enough to be drawn from: a lore question is a door, and doors always open. The world grows from the calls themselves (see canon ratification below). The measure of a great call is that the caller went somewhere.

## The layer model

Every persona's instructions are assembled from these layers (see `packages/personas`, `docs/engineering/architecture.md` §4):

1. **World canon** (shared): the Elsewhere universe — cosmology, the Management, fixed facts, cross-persona references. One source; every persona draws from it, so the world stays coherent across numbers and calls.
2. **Character** (per persona): three-layer anatomy — **invariant core** (facts always true + the wound that gives depth), **registers** (the repertoire of faces, chosen live by what the caller brings; end each call one register deeper than it started), **day-mood** (bridge-injected line for per-day/per-call freshness).
3. **Actor craft** (shared): how all Elsewhere "actors" perform — listen-and-build, anti-repetition, silence handling, caller-steering. Written once, inherited by every persona.
4. **Voice performance** (per persona, independent lever): delivery, pacing, texture. Never narrated aloud.
5. **House rules** (shared): brand voice, safety floor, terseness, the five-minute wrap.

## Canon ratification (the world grows from callers)

Personas may improvise SMALL lore in-call, under two rules: stay consistent with canon, and keep inventions minor (a detail, an anecdote — never new cosmology). The weekly transcript review harvests improvised lore worth keeping; approved entries are committed to the canon file, and every persona knows them forever. Checks and balances = git review; Sven is editor-in-chief. Canon starts postcard-sized and accretes — never written big up front.

## Principles (learned, not assumed — sources in persona-design-notes.md)

- **Guide, don't script — but script the high-stakes beats.** Hardcoded lines become robotic on the second call; pure improv produces weak material at the moments that matter most. Resolution: *kits* — several written, tested variants (openers, closers, FAQ answers) that the persona riffs on, never recites. The bridge injects variety mechanically (random pick per call) instead of trusting the model to vary itself.
- **The cold-opener law stands** (concept §Stage 0): establish who you are, cast the caller in a role, ask an easy question — within the first ten seconds. The kit varies the wording, never the three jobs.
- **Examples are inventory.** Whatever you list, the model WILL use, repeatedly, and little else. Write many bits or write generative rules; three cute examples become the whole act.
- **Never repeat** — a bit, a prop, a price, a quote-back: once per call. When stuck, change subject with authority rather than re-run material.
- **Assertive by structure.** "Be assertive" does nothing. Give the persona a procedure it runs (intake, switchboard protocol, a form to fill). Drive comes from having somewhere to take the scene.
- **The caller steers.** Talk tracks are fallback fuel, not an agenda. Anything the caller offers beats any track. Follow first; drive when the caller gives nothing.
- **Depth = worldview + fake specificity.** Consistent metaphysics, invented case history, opinions. Vague = dumb; specific = deep.
- **Never brush off a lore question.** "What do you mean, upper management?" is a caller knocking on the world. Every named thing either has canon behind it or the persona improvises something small and consistent (which may then be ratified). A deflection with no door is a failed moment (learned: call 2).
- **The prompt metabolizes the voice.** Unexpected voice? Write the recovery bit. Dark bait? Write the deflection (in character, never hotline-speak, humane fallback only for the genuinely serious).
- **Silence is designed.** The bridge detects dead air and cues a check-in; the persona defines its style. Impatience is characterization.
- **Terse is funnier and cheaper.** Output audio ≈ 4x input cost. One to three sentences.

## The process (per persona)

1. **Experience definition.** What axis does this persona serve (comedy / warmth / depth)? Who calls it and what are they hoping happens?
2. **Character core.** One paragraph: want, worldview, status, relationship to the caller. Decided BEFORE any lines are written — every later choice tests against it.
3. **Opener kit.** 4-6 tested openers obeying the three-job law. Bridge rotates.
4. **Talk tracks.** 3-5 places the persona can take a stalled scene, each with enough written material to sustain ~60s.
5. **FAQ answers.** A-grade written answers to what callers actually ask (source: transcripts). This list only grows.
6. **Behavior rules.** Anti-repetition, dark-bait deflection, silence check-in style, ending buttons for the 4:30 wrap.
7. **Voice profile.** Voice id + performance direction, cast against the character (or deliberately against type, with recovery material).
8. **Field test.** Live calls via the seed list. Review transcripts + recordings. Log learnings in persona-design-notes.md. Promote what lands into the persona file (runtime overrides are scratch space, code is the record).
9. **Weekly loop.** Transcripts → FAQ additions → material tightening. Forever. This is the moat.

## Design-session format

Design collaboratively, decision-block by decision-block: propose options per element with expected impact and example lines; Sven picks; implement; test on a real call before the next block. Never redesign everything at once — one lever at a time, so call-over-call diffs stay attributable.
