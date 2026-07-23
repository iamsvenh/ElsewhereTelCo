# Elsewhere Telephone Company

*Now connecting calls to the Beyond, your mother, and 2036. Rates: \$1 per minute. The Devil is standing by.*

Real vintage phones (payphones, rotary phones) connected to AI voice personas. Pick up, talk to the Devil. Or God. Or your future self. A deadpan fake telco wrapped around the OpenAI Realtime API, deployed at bars, festivals, weddings, and eventually alone in the high desert near Taos with a neon arrow pointing at it.

## Status

**Stage 0: software-only MVP.** Two phone numbers, three personas plus the Operator, analytics baked in. No hardware until the personas prove fun (unprompted-share test). Full staged roadmap with kill criteria in [docs/concept.md](docs/concept.md).

## Architecture (MVP)

```
Caller → Twilio number → Media Streams WebSocket
                            ↓
        Bun/TS bridge server (Railway)
           ├─ OpenAI Realtime API (persona session, gpt-realtime-mini)
           ├─ Supabase (calls, transcripts, seed numbers, consent)
           └─ Landing page (Vercel)
```

## Repo layout (planned)

```
apps/bridge/        Twilio ↔ OpenAI Realtime relay, call lifecycle, logging
apps/web/           Landing page
packages/personas/  One file per persona — the actual IP
supabase/           Migrations
docs/               Concept, decisions, specs
```

## Key documents

- [docs/concept.md](docs/concept.md) — the full concept: personas, legality, unit economics, worst-case cost, brand, tech spec, staged roadmap, open questions.

---

*Please limit calls to the deceased to five minutes. Other customers are waiting.*
