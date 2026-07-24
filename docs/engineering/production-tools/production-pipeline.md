# The Production Pipeline — content CI/CD for Elsewhere

**Status: SPEC to scope, not build (2026-07-24).** Sven's full-system vision: the world graph is the backbone of both production and runtime, and content flows from design → live through a gated pipeline modelled on feature-branch → staging → production. We spec it now while it's fresh; we build only the cheap early slices (see `world-graph.md` §phases). Most of this is deliberately deferred.

## The core insight: this IS CI/CD, and git gives us most of it

Because the world graph lives in git (Phase 0), the branch→staging→production pipeline isn't an analogy — it's the mechanism:

| Production concept | What it already is on git |
| --- | --- |
| Feature branch — parts of the graph work | a git branch: a world/subsection in progress |
| The gates / "linter" | CI checks on the branch |
| "Send it to me — did I sign off?" | PR review, the human gate |
| Staging — all green, final checks | a merge candidate that passes CI |
| Production — auto-pull, go live | merge to `main`; the runtime reads `main` |

So we don't invent a pipeline. We add **content-specific gates** (checks) and a **status view** on top of git + CI. The only genuinely new build is: the checks, the dashboard, and — much later — the asset-production automation. This is why the graph is the backbone, and why the vision isn't over-engineering: it's a well-understood pattern (CI/CD for content) riding the git-first source of truth.

## Node types × delivery

Two axes. **What a node is:**

| Type | Role |
| ---- | ---- |
| `menu` | a switchboard/IVR choice point (DTMF options; the digit→destination map lives in edges) |
| `persona` | a live-AI Resident you connect to (Devil, Operator-live-later) |
| `segment` | a pre-produced audio clip (opener, confirm, goodbye, re-prompt, a receptionist pitch) |
| `interaction` | a bounded action (subscribe, deliver-link, record-voicemail, hang up, easter egg) |
| `location` | a place / establishing threshold (the Exchange floor, the Left-Bank café) — carries the §5c bed |
| `supporting-cast` | a minor Resident (reachable = persona-lite; referenced = a line inside another node) |

**How it's delivered** (the vision §8 production layers): `live-AI` · `pre-produced` · `print/ref`. The delivery axis decides which gates a node must pass (a live persona has no audio master to render; a pre-produced segment does).

## Per-node artifacts (what each node carries)

- **script / line-pool** — the VO source text (+ variant pool for repeat-caller freshness).
- **voice-persona profile** — voice id, direction, model, system_prompt, cold_opener. Needed for live nodes AND to *render* a pre-produced node's VO. (Mirrors `persona_config`.)
- **production assets** — ambient bed, SFX (with cue + level), foley. References, never blobs.
- **produced master** — the final mixed/telephone-mastered audio artifact (pre-produced nodes only).
- **routing / edges** — triggers, in-fiction reaction lines, guards, ordering.
- **canon citations** — `canon_ref` pointers; the node cites lore, never duplicates it.
- **state / version / sign-off** — where it is in the pipeline.

## The gates (each red/yellow/green)

Per node, a sequence; a node advances only when the prior gate is green:

1. **Design gate (the linter).** Script (or, for a live persona, the persona profile) present, and **logically consistent**: walk the branches — every path reachable, every edge resolves to a real node, no orphans, no dead-ends, no hidden-digit colliding with a listed option, no dangling asset refs. *Machine-checkable* (`zod` schema + a graph walk). This is the "linter" and the reachability test in one.
2. **Assets gate.** All elements this node *type* requires are present: the bed, the SFX, the voice-persona profile. *Machine-checkable* (presence).
3. **Produce gate.** The final audio artifact is rendered. Two sub-stages: **auto** (script → TTS/VO render) and **manual** (human mix: VO + bed + SFX, level, telephone master). Applies to pre-produced nodes.
4. **Sign-off gate.** Sven reviews the produced artifact → approve / push back / iterate. *Human gate* (= PR review).

## Readiness matrix (which gates each type must pass)

| Node type | Design | Assets | Produce | Sign-off |
| --------- | :----: | :----: | :-----: | :------: |
| `persona` (live) | ✅ prompt+voice profile | ✅ voice profile exists | — (live) | ✅ |
| `segment` (pre-produced) | ✅ script | ✅ bed/SFX/voice | ✅ master rendered | ✅ |
| `menu` | ✅ prompt + valid options/edges | ✅ prompt VO produced | (its VO is a segment) | ✅ |
| `interaction` | ✅ action defined | — | — | ✅ |
| `location` | ✅ (establishing intent) | ✅ bed | ✅ establishing beat | ✅ |

This is Sven's "each subsection has its own gate" — the gate is: *which dimensions must be green for this node type.*

## Aggregation: node → subsection → world → production

- **Node** = production-ready when all its required gates are green.
- **Subsection** = ready when all its nodes are ready.
- **World** = staging-ready when all subsections are ready **+** world-level checks (every path reachable, cross-world links like the down trunk resolve, no bugs). This is the "staging linter."
- **Production** = final sign-off → merge to `main` → the runtime pulls all references and serves it.

## The status system (red/yellow/green) — for humans AND agents

- 🔴 missing/blocked · 🟡 in progress/partial · 🟢 gate passed. Per node, per gate, rolling up to subsection/world.
- Rendered on the map (Phase 1 ships a *basic* version from simple presence checks; the full gate rollup is Phase 2).
- **Machine-readable, so the status board is the work queue.** A person or an agent queries "what's red/yellow" and does exactly that: write the missing prompt, produce the missing bed, render the master, send it for sign-off. This is the hook for eventually operating the pipeline agentically.

## What we build now vs. spec-only

- **Build now (Phase 0/1):** the schema; the **Design-gate linter** (`zod` + basic logic/reachability walk) in CI; a **basic red/yellow/green readiness overlay** in the read-only map from presence checks. All cheap, all high-value.
- **Spec-only (Phase 2+, deferred behind triggers):** the asset-production automation (auto script→VO→master), the manual-produce/mix tooling, the sign-off workflow UI, the staging→production promotion surface, cross-world staging checks, and the agent-operated pipeline.

## The guardrail that keeps this from eating the product

**The CHECKS are cheap even when the ACTIONS stay manual for a long time.** We can have a gate that *knows* a node still needs a bed and a signed-off master years before we automate producing either. So: build the checks + the status board early (they're mostly derived data), and defer every piece of *automation* until content volume and a real trigger justify it (same triggers as `world-graph.md`). Never build the factory before there's enough content to run through it.
