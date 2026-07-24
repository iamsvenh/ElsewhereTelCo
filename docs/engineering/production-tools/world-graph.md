# The World Graph & Production Map — design + recommendation

**Status: design brief for Sven's decision, 2026-07-24.** Answers "should we build a visual production map of Elsewhere?" Synthesized from three research legs (existing tools · OSS graph libraries · data model + build-vs-buy validation). Sources at the bottom. **This is a recommendation with one decision flagged — nothing built.**

## The need (yours, validated)

As worlds/personas/scripts multiply, flat markdown loses the overview: consistency drifts (the `operator`-vs-`secretary` snag in the reused teaser script is the canonical symptom — a script that no longer fits its new context, invisible until someone re-reads every file), and there's no single place to see how it all connects. This is real, and it's how game/narrative studios ended up living in node-graph tools (articy, Arcweave, Twine). **The need is validated.**

## Research verdict, in one paragraph

**Adopt no existing tool as the source of truth.** Every mature narrative tool (Twine, ink, Yarn Spinner, Arcweave, articy) breaks on three of our assumptions at once: our branching is *speech-intent* driven (the model interprets what the caller says, not a fixed click-menu), our nodes carry *production metadata* (VO + bed + SFX + voice config), and we want *our own runtime* to read the source directly. They each have their own runtime, so adopting one re-introduces an export/translate step — exactly the staleness we're trying to kill. (Crib **ink**'s "tags-as-metadata" pattern and keep `inkjs` on the shelf for any future deterministic scripted beats.) **If** we build an editor, the library is **React Flow** (MIT, nodes are our own React components). But the strategic leg pushes back on building the full editor *now* — see the recommendation.

## The core reframe

The map should **not** be a separate artifact from what runs. We already decided the switchboard is a **config-driven tree the bridge walks** (`switchboard-v0.md` §7), and the analytics event log already speaks in node-paths (`root/hell`, `persona/devil`). That's already a graph. So:

> **The source of truth is a structured graph. The runtime executes it. The map is a view over it.** One dataset, three consumers (content, runtime, analytics), joined on one key (`node.path`). No export step exists to go stale.

Defining that schema is **not extra work** — the v0 switchboard is a node-tree either way. Building it *schema-first* IS the single-source-of-truth win; the map is a cheap layer on top.

## The schema (the world graph)

Three concepts kept strictly separate — this separation is the architecture:
- **Content graph (the IP)** — worlds/nodes/edges. Git-sourced, ratified by review, never live-written.
- **Runtime overlay (live tuning)** — `node_config`, the generalization of the existing `persona_config` (nullable overrides, DB-writable, promoted back to git).
- **Telemetry** — `calls`, `switchboard_events` (already exist). Never mixed in.

Written as DDL for concreteness, but in the recommended phase it lives as **typed TS + `zod` in git** (same shape), imported directly by the bridge.

```sql
worlds(id, slug, title, status, register, entry_line,
       canon_ref,           -- POINTER into world/canon.md, not a copy
       establishing jsonb,   -- {bed, narration, narrator_register}  (the §5c layer)
       clock jsonb)

nodes(id, world_id, path,   -- 'root','root/hell','persona/devil' — MUST equal switchboard_events.node
      type,                 -- location | persona | menu | interaction | segment
      title, summary,
      script, vo_asset, vo_status, line_pool jsonb,     -- the VO line + variant pool
      ambient_bed, sfx jsonb,                           -- per-node soundstage
      model, voice, voice_direction, system_prompt, cold_opener,  -- mirrors persona_config
      data jsonb,           -- type-specific (menu: {no_input_ms,retries,fallthrough,hidden}; etc.)
      state, version,       -- draft | review | ratified
      unique(world_id, path))

edges(id, world_id, from_path, to_path,   -- to_path may cross worlds (the down trunk)
      trigger jsonb,        -- {kind:'digit',value:'1'} | timeout | invalid | event | auto
      reaction,             -- in-fiction line on transition ("Connecting you...")
      guard jsonb,          -- future gating: subscriber tier, knowledge-as-save-state
      ord,                  -- primacy/recency ordering
      unique(world_id, from_path, trigger))

node_config(path PRIMARY KEY, model, voice, voice_direction, system_prompt,
            cold_opener, script, vo_asset, notes)   -- the live overlay; nulls = healthy
```

Node types map straight onto `switchboard-v0.md` §7's actions: `dial_persona`/`submenu` become **edges** to a `persona`/`menu` node; `play`/`deliver_link`/`subscribe`/`hangup` become `interaction` nodes; `segment` = the reusable leaf clips (confirm/goodbye/re-prompt). New node types need no migration (they're a `type` string + `data` jsonb) — same discipline as the event-log `node` string.

## Source-of-truth principles (staleness solved by construction)

1. **One artifact, imported by both view and runtime. No translation step exists** — that export is where every pipeline rots.
2. **Schema-first with a hard validation gate.** `zod` parse-on-load; **fail CI** on dangling edges, orphan nodes, a `persona` node with no voice, a hidden-digit that collides with a listed option, a `vo_asset` pointing at a missing file. Our consistency pain is a *validation* problem, not an *editor* problem — a validator solves it; a canvas doesn't.
3. **The bridge is a generic interpreter** ("the tree is data; the bridge walks it").
4. **`node.path` is the frozen join key** across content/runtime/analytics.
5. **Assets are references, never blobs** (paths into `apps/bridge/assets/`, object storage later).
6. **Live edits via the `node_config` overlay, not by moving the source** — deploy-free tuning with git still the truth.
7. **Read models are projections, never dual-writes** (same rule we set for the switchboard summary/journey views).

## Migration from markdown (split by machine-actionability)

- **Moves into the graph (git TS/JSON):** the *executable* content — menu trees + digit routing, per-node scripts/VO lines, asset refs (beds/SFX/clips), voice/persona levers (already structured in `persona_config`).
- **Stays markdown (authored prose):** canon/lore, the worlds register, character bibles, design rationale, decision notes. Vision §14 already ratified "canon stays markdown until ~50 entries." The bible *feeds* a node's `system_prompt`; it isn't itself executed.
- **The bridge:** graph nodes **cite canon by id** (`canon_ref`), never duplicate prose. When a canon entry changes, the citing node is flagged for a prompt refresh — not silently stale.

## The recommendation: phased, git-first, read-only-first

**Validate the need. Invalidate the near-term full build.** A custom React-Flow-on-Supabase editor with in-canvas editing and the DB as source of truth is a whole application (auth, CRUD, autosave, optimistic concurrency, publish/version workflow) — the canonical "tool eats the product" trap for a 2-person, pre-signal team, and it contradicts decisions we already made (the `persona_config` promotion rule; canon-in-markdown-until-50; "don't build the machine before the sharing signal," vision §11). So:

- **Phase 0 — now, ≈ free (it IS the switchboard build).** Define the graph schema (`packages/world/`, TS + `zod`). Build the **v0 switchboard as the first graph**, done schema-first instead of ad-hoc TwiML. Bridge imports it. Add the `zod` validation gate to CI. *This is the source-of-truth win, delivered by work already greenlit.*
- **Phase 1 — the overview: interactive but read-only** (Sven, 2026-07-24: skip static Mermaid — "won't look good and hard to navigate"). An **interactive read-only** map in **React Flow read-only mode** — pan/zoom, click a node to open its script + metadata in a side panel — reading straight from the git graph (no DB writes; git stays the source of truth). Plus a **basic red/yellow/green status overlay** per node from simple presence checks (has script? required assets? master?) — readiness at a glance, none of the production automation. Plus the `node_config` overlay for deploy-free live tuning. ~3–5 days, and it reuses the exact React Flow setup the eventual editor needs. **This is where you get the visual overview you're losing.**
- **Phase 2 — the full production pipeline** (spec'd now, built behind triggers). The gated content CI/CD in **[production-pipeline.md](production-pipeline.md)**: the four gates (design/linter → assets → produce → sign-off), the readiness rollup node→subsection→world→production, in-canvas editing (edit → DB draft → "promote" opens a PR so git stays the ratification gate), and eventually the asset-production automation. Specced while fresh; built slice-by-slice only when triggers fire.
- **Phase 3 — writers'-room scale (Stage 3-4).** Full DB source-of-truth + a `node_versions` history table, when non-git collaborators and volume justify it. Because the schema was DB-shaped from day one, this is mechanical, not a rewrite.

**Triggers to graduate to a real editor (write them down; don't graduate on vibes):** (1) a non-technical collaborator needs to author; (2) content volume where files genuinely hurt (set an explicit line, as with canon); (3) live non-engineer edits at volume beyond what the overlay covers; (4) the map becomes a *product* surface (the visual atlas, vision §13). Until one fires, the full editor is premature.

## What we'd give up moving source-of-truth git → DB (the honest tradeoff)

Not a wash — these are things we deliberately protected already:
- **Code review as the ratification gate** — vision §10 states it outright ("git review is the ratification gate"); our whole IP philosophy is "prompts are the IP, reviewed like code." A DB has no PR.
- **Diffs, blame, free history**; atomic change sets tying content to the bridge code that runs it (and to the tracker); the IP staying in the repo; and **no new auth/attack surface**.

The editor UX we'd buy in return only matters once a *non-git collaborator* authors — a Stage-3+ condition. The **read-only map delivers every overview/consistency benefit you actually named** (cross-world map, dead-end/orphan/dangling-edge detection, onboarding, and the map literally *being* the fiction) without giving any of that up. The only thing exclusive to the full editor is editing-in-canvas + live DB writes — and `node_config` already covers the live-tuning subset.

## Cost

- Phase 0: **≈ 0 extra** (it's the switchboard build, done schema-first) + ~0.5 day for the `zod` CI gate.
- Phase 1: **~1-2 days** for a Mermaid/Graphviz read-only render + gated route; `node_config` overlay ~0.5 day.
- Phase 2 (deferred): the React Flow editor is ~**6-8.5 person-days** (~1.5-2 weeks) per the library leg — spend it only when a trigger fires.

## Decision (Sven, 2026-07-24)

**Adopted: the phased path, with the graph confirmed as the backbone of both production and runtime.** Phase 0 + Phase 1 now — Phase 1 refined to an **interactive read-only** React Flow map + a **basic status overlay** (Sven's call; static Mermaid rejected as ugly/hard-to-navigate). Phase 2 — the full production pipeline (`production-pipeline.md`) — is spec'd now while fresh but **built later, slice-by-slice, behind triggers**. Read-only + git-versioned source of truth stands; in-canvas editing waits.

---

### Sources
Existing tools: [Twine](https://twinery.org/) · [ink/inkjs (MIT)](https://github.com/y-lohse/inkjs) · [Yarn Spinner](https://yarnspinner.dev/) · [Arcweave (cloud, ~\$1.8k/yr API)](https://arcweave.com/pricing) · [articy:draft X](https://www.articy.com/en/articydraft/free/). Graph libs: [React Flow (MIT)](https://reactflow.dev/) · [Rete.js](https://retejs.org/) · [tldraw (proprietary)](https://tldraw.dev/legal/tldraw-license). Read-only render: Mermaid / Graphviz. Validation: `zod`. Internal precedents: `switchboard-v0.md` §5/§7/§9 · `architecture.md` §4 (persona_config + promotion rule) · `vision-world-company.md` §10/§11/§14.
