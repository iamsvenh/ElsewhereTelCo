# Teaser audio production plan

Producing the final V2 teaser (`teaser-script.md`) to broadcast quality. Principle: **maximize what's synthesized/free, minimize paid generation, approve every element locally before any deploy.** No phone calls until the final master is approved locally (calls cost money).

## Element inventory

| # | Element | Source strategy | Cost | Owner |
|---|---|---|---|---|
| 1 | Ringback (1 ring) | ffmpeg synth (440+480 Hz US cadence) | free | Claude |
| 2 | Switchboard click | **Sven records real vintage phone** (best) → fallback ElevenLabs SFX / freesound CC0 | free | Sven or Claude |
| 3 | Handset pickup fumble | **Sven records real vintage phone** (best) → fallback as above | free | Sven or Claude |
| 4 | Operator VO (the hero) | ElevenLabs Voice Design — the one real spend | \$5/mo plan | Claude generates candidates, Sven picks |
| 5 | Ambience: dial tone (distant) | ffmpeg synth (350+440 Hz) | free | Claude |
| 6 | Ambience: "hold music that isn't quite music" | ffmpeg synth (detuned dissonant drones + tremolo + reverb) | free | Claude |
| 7 | Ambience: woman laughing (faint) | ElevenLabs SFX/VO or freesound CC0 | credits/free | Claude |
| 8 | Ambience: weeping in an unknown language (faint) | ElevenLabs VO or freesound CC0 | credits/free | Claude |
| 9 | Telephone-band EQ + mix + stitch + master | ffmpeg (already have the chain) | free | Claude |

## The one gate + the one high-leverage ask

- **Gate: ElevenLabs Starter (\$5/mo)** — needed for the Voice-Designed operator (element 4), the single biggest quality lever. Also unlocks SFX/VO generation for elements 7-8 and the Devil's future voice. Nothing final ships without this.
- **Ask: Sven records real phone foley (elements 2-3).** 30 seconds on a real vintage handset gives authentic, free, on-brand foley we reuse across the WHOLE product forever (Devil line, future IVR). Beats any synthesized or library click. Optional but strongly recommended.

## Workflow (local approvals, deploy once)

1. **Phase 1 — free elements now:** ringback, dial tone, eerie hold-music. Claude produces; Sven approves via a local HTML player (no deploy, no calls).
2. **Phase 2 — foley:** Sven records phone (or Claude sources); approve.
3. **Phase 3 — operator VO:** once \$5 plan is on, Claude generates 4-6 Voice-Design candidates reading the real script; Sven picks one; telephone-EQ master; approve.
4. **Phase 4 — ambience bed:** Claude mixes elements 5-8 into a faint bed; approve the bed alone, then approve VO-over-bed.
5. **Phase 5 — final stitch:** ringback → click → fumble → (VO + bed) → whole-mix EQ master. Approve the final master locally.
6. **Phase 6 — deploy once.** Swap the three clips, push, one confirmation call.

All Phase 1-5 approvals use local files/HTML player. Iterations are free (ffmpeg is local); only the operator VO candidates and any EL SFX touch credits.

## Upgrade path (later, not now)

Operator VO could later be a real human voice actor (Artizen community, or a hired VO) for the hero line — higher ceiling than generative. ElevenLabs Voice Design gets us to launch quality now and stays the tool for rapid iteration.
