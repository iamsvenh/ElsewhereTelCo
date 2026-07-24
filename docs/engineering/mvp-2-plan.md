# MVP 2.0 — World One build plan

2026-07-23. Stages toward the Underworld (vision: `docs/strategy/vision-world-company.md`). Each stage is call-testable, has a metric, and a scope fence. Existing stack (bridge, config levers, logging, guardrails) carries everything; nothing gets rebuilt.

## Stage T — The teaser line (days; first, cheapest, Sven wants it soon)

The phone-native mailing list + the pitch test + the first overworld artifact. Zero AI cost.

- **Number:** new 666-themed line (candidates found; purchase needs the Twilio upgrade below).
- **Flow:** call → pre-recorded switchboard operator delivers the pitch in fiction → "press 1 to be notified when service to the Underworld resumes" → number captured to `signups` table → pre-recorded confirmation. Pure TwiML `<Play>` + `<Gather>` — no media stream, no AI, pennies forever.
- **Production:** operator VO pre-recorded (ElevenLabs Starter \$5/mo for Voice Design + commercial license, or TTS + our telephone-filter chain), telephone-EQ mastered.
- **Send protocol:** text the number with half a sentence, nothing else ("call this when you have 90 seconds"). The line does the pitching.
- **Metrics:** press-1 rate (pitch conversion), completion rate (did they listen through), organic callers (numbers not in seed_numbers).
- **Graduation:** when World One ships, this number becomes the real front door — the number people saved becomes the product.
- **Scope fence:** no menus beyond press-1, no AI fallback, no SMS replies.
- **Notification mechanism deliberately deferred:** outbound SMS needs A2P registration (avoided so far by design); outbound calls have TCPA considerations. At friend-scale a single manual notification round is fine; decide properly before any public push.

## Stage 2.0a — The Devil rebuilt (World One foundations)

- Canon v1 (postcard-sized): Exchange cosmology, the Management (pending ratification), the Devil's personnel file, 3-4 fixed facts. New shared layer in `packages/personas`.
- Devil bible: invariant core (can't-lie, the wound) / five registers with shifting rules / dark-bait folded into the Accuser.
- Actor-craft shared layer (listen-and-build, anti-repetition, never-brush-off-lore).
- Mechanics: opener kit (bridge-rotated), silence timer with in-character check-ins, day-mood injection (via persona_config or a moods table).
- **Metrics:** call length, lore-probe rate (unprompted world questions), the tics eliminated (no repeats, no narrated stage directions).
- **Scope fence:** one persona, one world. Mom/Future You stay dormant ("closed for maintenance").

## Stage 2.0b — Subscribers (identity, now load-bearing)

- `subscribers` table; caller-ID recognition (own-phone returners greeted as known); contract numbers issued in fiction = claim codes; per-subscriber memory summary injected on return calls. No voiceprints, ever.
- **Metric:** the return-call recognition moment lands (transcript evidence of callers reacting to being remembered).
- **Scope fence:** summaries only (no raw-transcript reload); no web redemption yet.

## Stage 2.0c — First overworld pieces (the cheap layer proves itself)

- Underworld switchboard framing on the Operator line; ONE haunted IVR moment ("press 6 if you have already been damned"); ONE supporting-cast voicemail box; ONE unlisted extension Easter egg (seeded via a Devil mutter + the teaser line).
- Hold music from Hell (pre-produced).
- **Metrics:** minutes spent in pre-produced layers per call; Easter-egg discovery rate.
- **Scope fence:** exactly one of each. Prove the layer, then expand.

## Stage 2.0d — Launch surfaces (rolls alongside)

- Landing page as tariff card (numbers, deadpan rates, nothing else).
- Yellow Pages v0 (a one-page PDF spread: real numbers + lore listings).
- Artizen art-drop framing for the World One launch.

## Dependencies / Sven actions

1. **Twilio upgrade** (unblocks Stage T): Console → Billing → add card + auto-recharge. Kills the trial preamble on ALL numbers and allows number #2. ~\$1.15/mo per number + \$0.0085/min inbound.
2. ElevenLabs Starter (\$5/mo) decision — needed for Voice Design + commercial license on the teaser VO.
3. Teaser script approval (drafts in review).
4. Vision redlines still open: Management ratification, Mrs. Devil, terminology, in-world name for the Underworld exchange.
