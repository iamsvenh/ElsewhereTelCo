# engineering/ — how the system works and how it's built

The infra/ops and MVP-build workstreams. The always-on Bun bridge, the stack, the roadmap of what gets built next.

| Doc | What it is |
| --- | ---------- |
| **[architecture.md](architecture.md)** | How the system works and where it extends: the Twilio ↔ OpenAI Realtime relay, call lifecycle, the runtime persona config (model / voice / personality — the three levers). Living document. |
| **[infra.md](infra.md)** | The infrastructure registry: provisioned identifiers, accounts, domains, keys-by-reference. Fill in as provisioned. |
| **[mvp-2-plan.md](mvp-2-plan.md)** | The staged build plan toward World One (the Underworld). Each stage is call-testable, has a metric and a scope fence. The existing stack carries everything; nothing gets rebuilt. |
| **[switchboard-v0.md](switchboard-v0.md)** | Work package: turn the single-option teaser line into a branching, instrumented, LLM-free **switchboard** (the prototype of the eventual real switchboard). Menu design, SMS/A2P compliance, the KPI/event-log model, production checklist, cost, and open decisions. Synthesized from three research legs. |

See also: `../../CLAUDE.md` (stack decisions), the running code under `apps/` and `packages/`, and the schema under `supabase/`.
