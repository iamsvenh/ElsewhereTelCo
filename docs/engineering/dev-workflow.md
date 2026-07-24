# Dev workflow — local dev, branching, CI/CD

**Status: v1, decided 2026-07-24.** How we develop and ship Elsewhere. Established as groundwork *before* the World 0 switchboard build, so that build is the first to run through it.

## Stack decision — stay on Bun/Railway, no Next.js (2026-07-24)

Elsewhere's core is a **long-lived WebSocket voice relay** (Twilio Media Streams ↔ OpenAI Realtime), holding a socket for every call's duration. That is the opposite of what serverless/Next.js/Vercel are for. Bun-on-Railway is the correct architecture for it, not a prototype artifact — the CLAUDE.md rule "always-on Bun on Railway, do NOT move to serverless" stands.

- **No Next.js migration.** It can't host the relay (serverless can't hold the sockets), and the public web surface is deliberately tiny static lore (noindex — SEO is an anti-goal).
- **Monorepo app boundaries are the future-proofing**, not a framework swap:
  - `apps/bridge` — the relay. Untouchable core, Bun/Railway.
  - `apps/web` — public static site (served by the bridge for now).
  - future `apps/studio` — interactive internal tools. The first is the world-graph read-only map (React Flow); build it as **Vite + React** (minimal SPA, no SSR, talks to the bridge API + Supabase). Deploy as its own Railway service.
  - Reserve **Next.js only** for a possible Stage-2+ public subscriber portal (auth + billing), re-evaluated then.

The ESLint config divergence from Borker (we dropped its React/Next rules) is a *feature*: Elsewhere is a different kind of system. We still share the TypeScript-general ruleset.

## Environments — strictly separated

| | Local dev | Production |
| --- | --- | --- |
| config | `.env.local` (gitignored; Bun loads it, wins over `.env`) | Railway service variables (no file) |
| Supabase | local (`supabase start`, 127.0.0.1) | prod project `mtvlkjcdfluocapoyvdc` |
| OpenAI | prod key is fine (never exercised locally — no tunnel) | prod key, hard \$25/mo cap |
| Twilio | not exercised locally | live (505)/(806) |
| host | `localhost:8080` | the Railway domain |

**The separation that matters right now is Supabase** — dev must never write prod data. `bun run dev:all` **refuses to start** unless `SUPABASE_URL` is local. The tunnel + separate dev Twilio/OpenAI accounts are deferred (see "Not doing yet"), so **live phone calls are validated against production after deploy, not locally.**

## Local development

One-time per machine:
1. Docker running.
2. `supabase start` (or `bun run db:start`) — boots local Postgres + Studio. Applies `supabase/migrations/`.
3. `cp .env.example .env.local`, then set the LOCAL Supabase URL + keys (from `supabase status`). OpenAI/Twilio creds can stay the prod values or placeholders — they aren't invoked locally.

Each session:
- `bun run dev:all` — guards the local-DB check, verifies Supabase is up, and boots the bridge with `--watch` on `localhost:8080`.
- Develop + eyeball the web pages (`/`, `/directory`, `/legal`) and HTTP routes locally; `bun run check` for the automated suite. Live-call behavior is validated on prod after deploy (until the tunnel lands).

Handy: `bun run db:status`, `bun run db:reset` (re-applies migrations to local), `bun run db:stop`.

## Branching & PRs

Light flow (the "real hygiene later" is now):
1. Branch off `main` (`git switch -c feat/switchboard`).
2. Work. `bun run check` locally (typecheck + lint + format + test) until green.
3. `bun run dev:all` to eyeball the web/logic locally.
4. Push the branch, open a PR → **CI (`ci.yml`) runs `check`** on the PR.
5. Merge only when CI is green.
6. Merge → **CD (`deploy.yml`)** runs: check → migrate → deploy.

**Docs & tooling are exempt from the PR flow (Sven, 2026-07-24).** PRs + CI exist to gate *shipping*; changes to `docs/**`, any `*.md`, or `.claude/**` (skills/hooks) don't deploy and don't need CI. Just commit them on the current working branch — they ride along with the next code PR. Don't open a dedicated PR for them. `deploy.yml` also `paths-ignore`s those paths, so even a docs-only commit that reaches main won't trigger a pointless prod deploy. (If a docs change happens with no feature branch in flight, put it on a short branch that the next PR absorbs, rather than pushing straight to main.)

**Enforcement — solo-merge discipline (free GitHub, no branch protection).** Branch protection isn't available, so the rule is procedural, same as Borker: **Sven is the only one who merges to `main`, and only when the PR's CI is green.** Two things make this safe without protection: (a) `deploy.yml` re-runs `check` as its first gated stage, so **even a direct/red push to main will not deploy** — a red commit is at worst cosmetic, never shipped; (b) always work on a branch + PR so CI runs before the merge. When the repo goes to a paid plan or gains collaborators, add a branch-protection rule requiring the CI `check`.

## CI/CD

- **`ci.yml`** — on every PR to `main`: `bun run check`. The merge gate.
- **`deploy.yml`** — on push to `main` (i.e. a merge): three gated stages —
  1. `check` — re-verify on main.
  2. `migrate` — `supabase db push` to the prod project (schema first).
  3. `deploy` — `railway up --service bridge` (RAILPACK build on Railway).

  Each stage `needs` the previous, so a red check blocks migrate, a failed migrate blocks deploy.

Migrations run **before** the code deploy on purpose, and our migrations are additive/idempotent (`if not exists`), so the ordering is safe.

### First-time setup — three GitHub secrets (one-time)

Add each at **repo → Settings → Secrets and variables → Actions → New repository secret** (or via `gh secret set <NAME>`, which prompts for the value):

| Secret | Where to get it |
| --- | --- |
| `RAILWAY_TOKEN` | Railway → the **elsewhere** project → **Settings → Tokens** → create a token scoped to the **production** environment. (Project token, not an account token — least privilege; the CLI reads it as `RAILWAY_TOKEN`.) |
| `SUPABASE_ACCESS_TOKEN` | Supabase → **Account → Access Tokens** (supabase.com/dashboard/account/tokens) → Generate. Authenticates the CLI for `db push`. |
| `SUPABASE_DB_PASSWORD` | Supabase → the project → **Settings → Database → Database password**. If unknown, Reset it there (updates prod's password — set it in Railway vars too if the bridge uses it directly; today it doesn't, only the migration job does). |

The project ref is hardcoded in `deploy.yml` (not secret — it's in this repo already), so there's no fourth secret.

Until these exist, CI still runs on PRs; `deploy.yml` will just fail at the stage whose secret is missing — safe (nothing deploys), only red.

## Work tracking — Linear (decided 2026-07-24)

Moving the live board from `tracker.md` to Linear. **One team** (`elsewhere`, already created) to keep overhead low; the discipline-vs-deliverable cross-cut is modeled with labels + projects + views instead of multiple teams:

- **Workflow states** (one generic set): Backlog → Todo → In Progress → In Review → Done (+ Canceled). Creative's "redline → ratified" and production's "master → sign-off → published" map onto In Review → Done.
- **Labels** (grouped): `area:` (engineering / production / creative / strategy / infra) = the discipline lens; `world:` (switchboard / underworld / kitchen / 2036 / philosophical); `type:` (bug / feature / chore / spike / decision); `needs:sven` = the decision queue.
- **Projects = deliverables** (cross-discipline): *World Zero — Switchboard*, *The Underworld — Devil*, *Stage 0 — Prove & Launch*.
- **Views** (the lenses, so no single cluttered board): *Open for Sven* (`needs:sven`), *Engineering* / *Creative* / *Production* (by `area:`), each Project board, *By world* (group by `world:`), *Current cycle*.
- **The split — Linear tracks WORK; git keeps CANON/SPECS/DECISIONS.** `concept.md`, `canon.md`, and dated notes stay the source of record; a ticket references a doc, it never replaces it.
- **Ticket hygiene** is enforced by the `ticket-spec` + `ticket-verification` skills (spec-first, tests-first; a manual dev/prod call check for live-voice tickets).
- **Access:** the `linear-server` MCP (Linear's hosted server) added per-project — `claude mcp add linear-server https://mcp.linear.app/mcp --transport http`, then restart.

**Status:** structure + migration pending the MCP being wired. Until then `tracker.md` stays the live board; on migration its **open** items move to Linear and its **done** items stay as history in git.

## Not doing yet (deliberately)

- **No local-call tunnel + no separate dev Twilio/OpenAI accounts** (Sven, 2026-07-24 — skip for now). What they'd unlock: calling a **dev** number that rings your laptop (`cloudflared` tunnel → `PUBLIC_HOST`), so you could E2E a real call locally against a dev OpenAI project with its own budget cap. Until then, local dev = Supabase + web + logic + tests, and live-call validation is a call to the prod number after deploy. Re-add when local call-testing is worth it: install `cloudflared`, provision a dev number + dev OpenAI project, and restore the tunnel step in `scripts/dev-all.ts` (it's in git history).
- **No separate always-on staging env.** For telephony it would need its own number + OpenAI project. Add later if the team grows or we want automated E2E against a deployed env.
- **No PR migration-lint** (`supabase db lint --linked`) yet — it needs prod DB creds on PR runs. Add when migrations get complex.
