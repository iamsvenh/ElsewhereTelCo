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
| OpenAI | a **dev** project with its own budget cap | prod key, hard \$25/mo cap |
| Twilio | a **dev** number → your tunnel | live (505)/(806) |
| host | tunnel URL (dev:all writes `PUBLIC_HOST`) | the Railway domain |

`bun run dev:all` **refuses to start** unless `SUPABASE_URL` is local — the seatbelt against running dev against prod data.

## Local development

One-time per machine:
1. Docker running.
2. `supabase start` (or `bun run db:start`) — boots local Postgres + Studio. Applies `supabase/migrations/`.
3. `cp .env.example .env.local`, then fill LOCAL values: the `supabase status` URL + keys, a dev Twilio number, a dev OpenAI project key.
4. `brew install cloudflared` (for inbound call testing).

Each session:
- `bun run dev:all` — guards the local-DB check, verifies Supabase is up, opens a cloudflared tunnel, writes its URL into `.env.local` as `PUBLIC_HOST`, prints the webhook to paste into the dev Twilio number, and boots the bridge with `--watch`.
- Call the **dev** number → real phone → your laptop → OpenAI → back. That's the true end-to-end local test. (It uses real OpenAI/Twilio — cheap per call, and on the dev project/number so it never touches prod's budget or the live lines.)

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

- **No separate always-on staging env.** For telephony it would need its own number + OpenAI project — i.e. the same as the local dev tunnel, which already serves as pre-prod. Add later if the team grows or we want automated E2E against a deployed env.
- **No PR migration-lint** (`supabase db lint --linked`) yet — it needs prod DB creds on PR runs. Add when migrations get complex.
