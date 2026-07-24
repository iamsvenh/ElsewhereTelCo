# Infrastructure — Stage 0 (2026-07-22)

Runbook + registry of what exists where. Secrets live in `.env` (gitignored) and in Railway service variables — never in this file. Non-secret identifiers get recorded here as they're created.

## Registry (fill in as provisioned)

| What | Value | Notes |
|---|---|---|
| OpenAI project | key in `.env` + Railway vars | Hard \$25/mo budget cap set: **yes** (confirmed 2026-07-22) |
| Supabase project ref | `mtvlkjcdfluocapoyvdc` (project "Elsewhere", org Incented, Canada Central) | Linked + v0 migration pushed 2026-07-22. Studio = transcript review UI |
| Supabase keys | Publishable: `sb_publishable_2JyrIOv1Z1zoXnH6VOWPBg_8ptdI7in` | **New key system only** (decision 2026-07-22): legacy anon/service_role JWTs are never used; Supabase disables them ~Nov 2026. Secret key (`sb_secret_…`) in `.env` + Railway vars only |
| Railway project | `elsewhere` (`bcb23487-19ef-45c7-8330-ec7e209e036b`), service `bridge` | Builder: **RAILPACK** (Nixpacks breaks: tries EOL Node 18 — this is what killed the UI repo-connect deploy) |
| Bridge public URL | `https://bridge-production-50a8.up.railway.app` | `/health` healthcheck; `PUBLIC_HOST` var pinned |
| Twilio Number A (Devil direct) | **(505) 551-3551** (`PN966b6ba1571765ae766f51320fcec799`) | Palindrome pick 2026-07-22. Voice webhook → `POST /incoming-call` ✓ |
| Twilio Number B (Operator) | _pending_ | Needs account upgrade off trial. Number-shopping notes: 505-505-xxxx pool exists (doubled area code); (575) 570-8267 = 570-TAOS; (575) 570-3573 = ELSE |

## Setup order (dependency chain)

1. **OpenAI** (dashboard, manual): create project `elsewhere`, set **hard \$25/mo budget cap** (Settings → Limits) BEFORE creating the key, create a project-scoped API key → `.env` `OPENAI_API_KEY`.
2. **Supabase**: `supabase login` (browser) → create project → `supabase link --project-ref <ref>` → `supabase db push` (applies `supabase/migrations/`). Project URL + service role key → `.env` and Railway variables.
3. **Railway**: CLI, not the GitHub UI integration (UI repo-connect failed 2026-07-22; `railway up` deploys from the local directory and sidesteps it). `railway login` → `railway init` → set variables → `railway up` → `railway domain`. `railway.json` at repo root sets start command + healthcheck.
4. **Twilio**: account → Account SID + auth token → `.env`. Buy Number A → set voice webhook to `https://<railway-domain>/incoming-call` (POST). Map numbers in `PERSONA_NUMBER_MAP` (Railway variable): `+1…=devil,+1…=operator`.

Twilio must come last: the webhook needs the Railway URL.

## Environment variables

Single source of truth: `.env.example` at repo root. Local dev reads `.env` (run from repo root); production reads Railway service variables. Keep them in sync manually when a var is added.

## Asset storage (decided 2026-07-24)

Audio triples once the switchboard starts. Where each kind of asset lives:

- **Shipped masters** (the clips the bridge/Twilio play) → **Supabase Storage**, a public `audio` bucket, path-structured by world/node (`world-zero/operator/menu-01.mp3`). Twilio `<Play>`s the public URL directly (removes audio-serving from the bridge); the path is the world-graph join key. **Set up as the first switchboard step** (bucket + a small `publish-audio` script); until then the 3 teaser masters stay in git.
- **Raw sources** (WAV/Audacity working files — ~88 MB and growing) → **Google Drive**, NOT git and NOT Supabase. The storage *rate* is cheap, but Supabase's free-tier **1 GB cap** would force a \$25/mo Pro upgrade just to hold cold files nobody serves; Drive has no such cap and is where they're edited/backed up anyway. Stay gitignored.
- **Text** (the graph/config that references asset paths, production records like `../world/switchboard/teaser-audio-production.md`) → git.

Why not git for masters: binaries never delta and every re-master is a permanent blob in history; growth is unbounded per world. Why not Git LFS: adds Railway/CI `git lfs pull` friction + quota cost for no gain over the Supabase bucket already in the stack. Cross-ref: `production-tools/production-pipeline.md` (produce → sign-off → **publish to the bucket**).

## Day-2 operations

> **Deploy is now CD (2026-07-24).** Merges to `main` auto-deploy via GitHub Actions (`deploy.yml`: check → migrate → `railway up`). Local dev runs against **local** Supabase + a tunnel + a dev number — see [dev-workflow.md](dev-workflow.md). Manual `railway up` below is the break-glass fallback.

- **Deploy (fallback):** `railway up` from repo root.
- **Logs:** `railway logs`, or the Railway dashboard. Watch for `[usage] CACHE FAILURE?` warnings (rule 8).
- **Transcripts:** Supabase Studio → `calls` table.
- **New migration:** add `supabase/migrations/<timestamp>_<name>.sql` → `supabase db push`.
- **Seed list:** insert texted numbers into `seed_numbers` (Studio or SQL) — share detection depends on it being complete.
