# engineering/production-tools/ — the internal production systems

Design for the tooling that lets us (the production team of two) author, map, and stay-consistent across Elsewhere's growing content: worlds, personas, scripts, and production assets. As this grows it will likely hold several docs (the graph/source-of-truth model, the map/editor, the asset pipeline).

| Doc | What it is |
| --- | ---------- |
| **[world-graph.md](world-graph.md)** | The content **source-of-truth** model (worlds / nodes / edges + the `node_config` runtime overlay) and the **production map** over it. Git-first structured graph + an interactive read-only map now; full editor deferred behind triggers. Schema + phased plan + the decision. |
| **[production-pipeline.md](production-pipeline.md)** | The full-system **spec** (not-build-yet): content flows design → live through gated CI/CD (design/linter → assets → produce → sign-off), red/yellow/green readiness rolling up node→subsection→world→production. The graph as the backbone of production + runtime; agent-operable by design. |

**Scope note (Sven's open question):** this folder is the *tooling/systems* design. The per-asset **production records** (how a specific piece of audio got made) currently live with their world — e.g. `world/switchboard/teaser-audio-production.md`. If the audio-production *pipeline itself* grows its own methodology docs, we'll decide then whether "production" (the making) wants a home separate from "production-tools" (the systems). Not split yet.
