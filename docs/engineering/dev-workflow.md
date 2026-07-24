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
3. `bun run dev:all` + a dev call to eyeball it end-to-end.
4. Push the branch, open a PR → **CI (`ci.yml`) runs `check`** on the PR.
5. Merge only when CI is green (branch protection enforces this — see setup).
6. Merge → **CD (`deploy.yml`)** runs: check → migrate → deploy.

`main` is always deployable, because nothing lands on it except through a green PR.

## CI/CD

- **`ci.yml`** — on every PR to `main`: `bun run check`. The merge gate.
- **`deploy.yml`** — on push to `main` (i.e. a merge): three gated stages —
  1. `check` — re-verify on main.
  2. `migrate` — `supabase db push` to the prod project (schema first).
  3. `deploy` — `railway up --service bridge` (RAILPACK build on Railway).

  Each stage `needs` the previous, so a red check blocks migrate, a failed migrate blocks deploy.

Migrations run **before** the code deploy on purpose, and our migrations are additive/idempotent (`if not exists`), so the ordering is safe.

### First-time setup (one-time, in GitHub repo settings)

Secrets (Settings → Secrets and variables → Actions):
- `RAILWAY_TOKEN` — a Railway **project** token for the `elsewhere` project.
- `SUPABASE_ACCESS_TOKEN` — a Supabase account access token.
- `SUPABASE_PROJECT_ID` — `mtvlkjcdfluocapoyvdc`.
- `SUPABASE_DB_PASSWORD` — the prod DB password.

Branch protection (Settings → Branches → add rule for `main`):
- Require a pull request before merging.
- Require status checks to pass → select the CI `check` job.

Until these exist, CI runs on PRs but `deploy.yml` will fail at the stage whose secret is missing — safe (nothing deploys), just red.

## Not doing yet (deliberately)

- **No local-call tunnel + no separate dev Twilio/OpenAI accounts** (Sven, 2026-07-24 — skip for now). What they'd unlock: calling a **dev** number that rings your laptop (`cloudflared` tunnel → `PUBLIC_HOST`), so you could E2E a real call locally against a dev OpenAI project with its own budget cap. Until then, local dev = Supabase + web + logic + tests, and live-call validation is a call to the prod number after deploy. Re-add when local call-testing is worth it: install `cloudflared`, provision a dev number + dev OpenAI project, and restore the tunnel step in `scripts/dev-all.ts` (it's in git history).
- **No separate always-on staging env.** For telephony it would need its own number + OpenAI project. Add later if the team grows or we want automated E2E against a deployed env.
- **No PR migration-lint** (`supabase db lint --linked`) yet — it needs prod DB creds on PR runs. Add when migrations get complex.
