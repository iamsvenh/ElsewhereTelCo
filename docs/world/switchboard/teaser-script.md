# Teaser line script — (806) 666-1212

Stage T front-of-funnel. Pre-recorded, zero AI cost. The line callers hear when Sven texts them the number with half a sentence ("call this when you have 90 seconds"). Must: establish what Elsewhere is in-fiction, tease the Underworld, drive the press-1 signup.

**Status: DECIDED v2 (Sven, 2026-07-23).** Final script below. VO still placeholder (filtered TTS) pending the ElevenLabs production pass (Voice-Designed operator + living-switchboard ambience + pickup foley).

Delivery notes: 1950s switchboard operator, clipped/deadpan, nothing is unusual to her. Telephone-band EQ on the master. `...` = beat.

Playback structure (infra): ringback (one ring — that was enough) → click + pickup foley → settle → VO over faint living-switchboard ambience. VO plays inside `<Gather>` = **barge-in**: press one at any point jumps to confirmation; non-pressers hear the sign-off as the button.

---

## FINAL SCRIPT (v2)

> _[ringback, one ring] [switchboard click, faint pickup fumble] [under the voice: living-switchboard ambience — faint cross-talk, a woman laughing, a dial tone from nowhere, someone weeping in a language you don't know, a snatch of hold music that isn't quite music]_
>
> Elsewhere Telephone Company, operator speaking. ... Do you hear them? Every line, every world, all at once. It's a busy board. ... Now — don't mistake this for an ordinary number. It's a gateway to elsewhere. Curiosity led you here. Or maybe you just found an abandoned phone in the desert. Either way, much awaits: there's a whole world past this line. This door. The Devil's door. He's off somewhere. Slacking, as usual. ... Where you wander from here is your business. If your urges push you to explore lines unlisted, numbers that ring in places with no names, ... press one, and we'll notify you the moment the old serpent is back at his desk. ... The Management thanks you for your patience. It knows you have a choice in telephone companies. Good day.

## Alternates (archived, not used)

<details><summary>Draft 2 — eerie/awe · Draft 3 — funny/warm · Draft B — original</summary>

**Draft 2 — Eerie/awe-forward:**
> Elsewhere Telephone Company. ... Do you hear them? Every line, every world, all at once. It is a very busy exchange. ... You have reached the gateway to elsewhere. Curiosity led you here — or something did. Beyond this board: lines we do not list, numbers that ring in places with no names. ... The nearest door is the Underworld. It is closed — for your protection, and ours. We must ask that you not attempt to reach it by other means. ... Several have. They are no longer subscribers. ... If you wish to be notified when the line opens to explorers like yourself, press one. ... I have to go now. The Management is listening. It always is. Good day.

**Draft 3 — Funny/warm-forward:**
> Elsewhere Telephone Company, operator speaking — one moment, the board's a nightmare tonight. ... There. ... You've reached the exchange: the only switchboard licensed to connect calls to elsewhere. Since 1666. Our subscribers include the recently deceased, the not-yet-born, the otherworldly, and one grumpy fallen angel who never returns his calls. ... You've caught us during maintenance. This is the first line — the Devil's. Want us to notify you the moment he's back from wherever he's galivanting? ... press one, and we'll ring you when the old slacker Beelzebub deigns to answer. There's a whole world past his door. Where you wander is your business. ... The Management thanks you for your patience. Good day.

**Draft B — original (pre-depth-pass):**
> Elsewhere Telephone Company, operator speaking. You have reached the exchange. ... Since 1666, this company has operated the only switchboard licensed to complete calls beyond. Our subscribers include the recently deceased, the not yet born, the otherworldly, and one grumpy fallen angel. At present, the Underworld trunk is closed for scheduled maintenance. ... If you wish to be notified when service resumes — press one at any time. ... The Management thanks you for your patience. It knows you have a choice in telephone companies. Good day.

</details>

---

## Press-1 confirmation (shared)

> Your number has been entered in the eternal ledger. You will be notified when service resumes. Do not attempt to dial the Underworld directly. ... Good day.

## Non-1 / timeout goodbye (shared)

> The exchange thanks you for calling. ... Good day.

---

## Open questions - Answered

- A vs B vs A+graft? --> B (i modified it)
- Cold open SFX: switchboard click + line hiss worth producing, or too much? --> YES (i added to it)
  Quick feedback on the live number:
  - When I call it, I hear just a single ringtone very fast and then it picks up. But before the connection is properly established, the voice already spoke and it kind of cuts off and jumbles in a bad connection the first part of the introduction of the elsewhere telephone company. So I think we need to address that on the infrastructure layer. Hopefully we can. Ideally, I would want it to ring maybe twice or three times, not too long, so that it actually feels like an operator has to pick up. And then maybe there needs to be some sort of pause or some sort of mechanism to ensure that the connection is fully established before our operator starts talking.
  - **→ Resolved:** implemented as **one ring** + a settle before the VO — one ring turned out to be enough (two-to-three felt too long). This is the standing spec everywhere now; don't reintroduce the higher count.
