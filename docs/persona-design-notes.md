# Persona design notes

Working log of the transcript-review loop (concept doc §Stage 0: read transcripts, find the real FAQ, write tested material into the prompts). Dated entries, newest first. Raw data: Supabase `calls` table (transcripts), Twilio Recordings (audio, dual-channel).

## 2026-07-22 — Learnings from calls 1-2 (Devil, first live night)

Two 5-minute capped calls (Sven, seed phase). Call 1 on `gpt-realtime-mini` with voice `ash` default delivery; call 2 on `gpt-realtime-2` (low reasoning effort) with whisper/gravel VOICE PERFORMANCE direction. Voice verdict: call 2 acceptable for now; personality verdict: not up to snuff. Diagnosis below, from the transcripts.

### What failed, specifically

1. **Prompt examples became the whole inventory.** The prompt listed sample prices (left socks, third-best birthday, handwriting) and a notary gag. The model reran them on loop; socks appeared three times and the caller swore at him about it. Rule of thumb: the model retrieves listed examples instead of riffing past them. Examples in prompts are seeds for a style, but the model treats them as the entire repertoire, so write MANY bits or write generative rules, never three cute examples.
2. **Stage directions leaked into speech.** "Let me lean in and savor the question for a moment", "Let me sit with that and put it in plain terms for you": the VOICE PERFORMANCE block got narrated aloud. Needs an explicit anti-rule: never describe your own tone, pacing, or intentions; perform them.
3. **The memory gimmick became a per-turn tic.** "Petty perfect recall" turned into quoting the caller back every single turn ("You said X, and there it is"). Devastating once per call, a crutch at every turn. Frequency limits belong in the prompt.
4. **Reactive, not running the show.** Every good moment was caller-fed ("shift gears", "meaning of life", "didn't you used to run hell?"). The persona had no agenda of his own, so awkward or passive callers would get dead air and shallow ping-pong. The engine produced good material when given a topic, which means the fix is fuel and steering, not a smarter model.
5. **Safety language bled into the show.** Call 1 ended with helpline boilerplate mid soul-deal ("would you like to talk with a professional or a trusted friend"); call 2 dumped the privacy notice as a non-sequitur. HOUSE_RULES crisis/wellbeing language was removed 2026-07-22 (see `packages/personas/src/types.ts`). It MUST return, properly scoped, before the number reaches anyone beyond informed seed testers (concept rule 7 stands; this is a deferral, not a deletion).

### Technical watch-list (may be bridge bugs, not persona bugs)

- Verbatim doubled response in call 2 (same line at 106s and 116s). Watch whether it recurs; could be a duplicated `response.create` or a model repeat.
- A stray caller sound transcribed as "음" triggered a full rule recitation. Transcription/VAD noise can prompt-inject the persona's own rules back at the caller.

### Design principles going forward

1. **Assertive by structure, not by adjective.** "Be assertive" does nothing. Give the persona a procedure he runs: every Devil call is an intake appointment HE conducts ("Name. Vice of preference. Nature of the grievance. Let's not waste eternity."). The persona drives by default and the caller reacts, which is what cold, awkward, or drunk callers need (they are the real customer). This is concept rule 5 (cast the caller in a role) extended past the opener into the whole call.
2. **Depth is worldview plus fake specificity.** The lines that landed revealed consistent metaphysics: "It's called delegation. Upper management prefers me bored and underused." Write him case history ("A gentleman in Delft asked the same in 1652. He's in inventory now."), opinions about modernity, a filing system for human desire. Specifics read as depth; vagueness reads as dumb.
3. **Material is a tight five, not a character sketch.** Structure the prompt as: cold opener / 6-8 core bits / written FAQ answers / pivots ("enough about me, what do you actually want?") / exit buttons for the 4:30 wrap. Each bit and each prop is used at most once per call.
4. **Anti-tic rules are explicit.** Quote-the-caller max once per call. Never narrate delivery. Never reuse a price. When stuck, change subject with authority instead of repeating.
5. **The prompt must metabolize the voice.** The voice is part of the character. If the voice is unexpected for the persona (e.g. a bright young voice on the Devil's line), the prompt needs prepared recovery material for "wait, YOU'RE the devil?" ("Yes. The horns don't come through on the phone. Budget cuts.").
6. **Terse stays terse.** Output tokens cost roughly 4x input per minute; punchy is cheaper AND funnier. Keep the 1-3 sentence rule.

### FAQ backlog (the flywheel's first entries — each needs a written A-grade answer)

From two calls, already recurring:

- "Are you real or a prankster?" (improvised answer was weak; this will be asked constantly)
- "What's the meaning of life?" (improvised answer partially landed: "Meaning is whatever you can live with when the lights go out." Keep, polish, extend)
- "Aren't you supposed to buy MY soul?" (callers arrive with deal-mechanics expectations; the brokerage reframe confused more than it played)
- "Didn't you used to run hell? / who's above you?" (hierarchy bit landed, expand it)

### Keep pile (tested, landed)

- "It's called delegation. Upper management prefers me bored and underused."
- "Meaning is whatever you can live with when the lights go out."
- The notary as an escalating threat (once per call).
- "Pranksters don't have notaries. I do."

### Voice status (for context, decided elsewhere)

Live: `ash` + whisper/gravel direction on `gpt-realtime-2`, reasoning effort low. Acceptable for now, not final. ElevenLabs library round unloved; Voice Design needs the paid tier; STS-over-Realtime latency prototype pending. See `docs/infra.md` and session notes.
