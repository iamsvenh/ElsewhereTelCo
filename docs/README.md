# Elsewhere — docs index

Everything decided, specced, or in flight. Organized by the four workstreams from `CLAUDE.md`. If you read one thing first, read the live board: **[tracker.md](tracker.md)**.

## Structure

| Folder | Workstream | What lives here |
| ------ | ---------- | --------------- |
| **[strategy/](strategy/)** | Strategy & concept | what this is, where it goes, how it makes money and gets funded |
| **[engineering/](engineering/)** | Infra/ops + MVP build | how the system works and how it's built |
| **[world/](world/)** | Persona & world writing | the IP: persona craft, canon, per-world folders |
| **[reviews/](reviews/)** | cross-cutting | dated audit passes over the whole repo. Findings only, never fixes |
| _(root)_ | cross-cutting | [tracker.md](tracker.md) — the live board across all four |

## Reading order for a new session

1. **[tracker.md](tracker.md)** — current state, what's open for Sven, what's next.
2. **[strategy/concept.md](strategy/concept.md)** — the operational source of truth (stages, economics, kill criteria).
3. **[strategy/vision-world-company.md](strategy/vision-world-company.md)** — what the thing IS: the world company, locked terminology, the frame everything else fits.
4. **[reviews/2026-07-24-full-repo-review.md](reviews/2026-07-24-full-repo-review.md)** — the open findings list (safety gates, doc contradictions, fiction holes). Read before trusting any single doc, since it records which ones are stale.

## Conventions

- Lowercase-hyphen filenames. Escape `$` as `\$` in markdown (Sven's reader renders `$...$` as math).
- New decisions go in the right domain folder as dated notes; `concept.md` stays the index of record, `tracker.md` stays current in the same change set as the work.
- Brand voice in anything a caller could see; working docs (tracker, notes) stay plain and fast.
