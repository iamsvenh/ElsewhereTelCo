# Teaser line script — (806) 666-1212

Stage T front-of-funnel. Pre-recorded, zero AI cost. The line callers hear when Sven texts them the number with half a sentence ("call this when you have 90 seconds"). Must: establish what Elsewhere is in-fiction, tease the Underworld, drive the press-1 signup.

**Status: DECIDED — Draft B (Sven, 2026-07-23).** VO still placeholder (filtered TTS) pending the ElevenLabs decision.

Delivery notes: 1950s switchboard operator, clipped/deadpan, nothing is unusual to her. Telephone-band EQ on the master. `...` = beat.

Playback structure (infra): ringback (2-3 rings) → click + operator fumbles the pickup → short settle-pause → VO. The whole VO plays inside a `<Gather>` so "press one at any time" works (barge-in).

---

## Final script (Draft B)

> _[ringback, 2-3 rings] [switchboard click, line hiss, some fumbling is heard from the operator picking up]_
>
> Elsewhere Telephone Company, operator speaking. You have reached the exchange. ... Since 1666, this company has operated the only switchboard licensed to complete calls beyond. Our subscribers include the recently deceased, the not yet born, the other worldly, and one grumpy fallen angel. At present, the Underworld trunk is closed for scheduled maintenance. The Devil's line receives heavy use, and the equipment is old. ... If you wish to be notified when service resumes — press one at any time. ... The Management thanks you for your patience. It knows you have a choice in telephone companies. Good day.

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
