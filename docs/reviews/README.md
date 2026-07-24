# reviews/ — audits and review passes

Point-in-time reviews of the repo: findings only, no fixes. Each is a dated snapshot of what was true when it ran, so they age by design. Read the newest one, then check `../tracker.md` for what was actually actioned.

Cross-cutting by nature: a review pass looks at code, docs, strategy, and world writing together, which is why these live in their own folder rather than under any one workstream.

| Doc | What it is |
| --- | ---------- |
| **[2026-07-24-full-repo-review.md](2026-07-24-full-repo-review.md)** | Pre-World-0 checkpoint. Seven parallel reviewers over the whole repo (code+schema, docs consistency, strategy/economics, world/canon/personas, compliance vs the 8 rules, World 0 build-readiness, in-world logic). 42 findings in five priority tiers, plus a build-readiness read on the switchboard and a verified-clean list. Nothing actioned; Sven decides. |

## Conventions

- Filename is `YYYY-MM-DD-<scope>-review.md`. Newest at the top of the table.
- **Findings only.** A review never edits the thing it reviews. Anything adopted becomes a tracker item and a separate change set, so the review stays an honest snapshot.
- Mark what was verified directly versus reported, and record reviewer disagreement rather than resolving it silently.
- Cite `file:line` and quote verbatim, so a finding can be re-checked months later.

**Related:** the weekly transcript-review loop (tracker workstream D) is a different thing — that reads *call transcripts* to harvest lore and feed the persona prompts, and its output belongs in `../world/persona-design-notes.md`. If it ever grows dated write-ups of its own, they would fit here.
