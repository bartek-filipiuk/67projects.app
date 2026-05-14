# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Production marketing/CMS site for Bartek's 67-day shipping challenge. Single Next.js 15 deploy that serves **both** the public site and the embedded Payload 3 admin panel — they share one process, one Postgres, one set of types.

## Commands

Package manager is **pnpm** (Node 22.12.0 — see `.nvmrc`). Never run `npm`/`yarn` here.

```bash
pnpm dev                  # next dev (frontend + /admin)
pnpm build                # next build (also generates Payload import map)
pnpm start                # next start (used by Playwright webServer)

pnpm typecheck            # tsc --noEmit (strict + noUncheckedIndexedAccess)
pnpm lint                 # next lint + eslint-plugin-security
pnpm test                 # vitest run (unit + integration)
pnpm test:watch           # vitest
pnpm test:coverage        # 90% lines/functions/statements, 85% branches on lib/ + app/api/
pnpm test:e2e             # playwright (auto-spawns `pnpm start` on :3000)

# Single test file:
pnpm vitest run tests/unit/rate-limit.test.ts
pnpm playwright test tests/e2e/contact.spec.ts

pnpm seed                 # 14 projects + 5 repos + 10 log entries (destructive in places — see scripts/seed.ts)
pnpm seed:fresh           # idempotent first-run seed (categories + SiteSettings) — also run by Docker entrypoint
pnpm create-admin         # creates admin from ADMIN_EMAIL / ADMIN_PASSWORD env
pnpm payload migrate      # apply Payload migrations
pnpm payload migrate:create <name>   # author a new migration after schema change
```

Local DB: `docker compose up -d db` (Postgres 16 on :5432, db `sixtyseven`).

## Architecture

### One app, two route groups

```
app/
  (frontend)/   → public site (home, projects, log, contact, open-source)
  (payload)/    → /admin + Payload REST/GraphQL
  api/          → custom Next route handlers (health, github-stars, sales-stream SSE)
```

The `(payload)` group is generated/owned by `@payloadcms/next` — treat it as a black box; do not hand-edit files there. `payload.config.ts` is the single source of truth for collections, globals, DB adapter, and Lexical editor. After editing collections/globals, run `pnpm typecheck` — Payload regenerates `payload-types.ts` on build, and TS imports use it heavily.

Path aliases (`tsconfig.json`): `@/*` → repo root, `@payload-config` → `./payload.config.ts`.

### Data layer

- **Collections** in `collections/`: `Users`, `Categories`, `Projects`, `Repos`, `LogEntries`, `ContactSubmissions`, `Media`. Registered in `payload.config.ts`.
- **Globals** in `globals/`: `SiteSettings` (CMS-driven copy for Nav/Footer/Hero/Sections — fetched in layout).
- DB adapter: `@payloadcms/db-postgres`. `push: true` only in non-production (dev schema sync); production requires committed migrations under `migrations/`.
- Migrations are committed and applied at container startup by `scripts/entrypoint.sh`. Never edit a migration after it has been applied in production — add a new one.

### Cache invalidation pattern

CMS edits must reflect on the live site immediately. Every collection (and `SiteSettings`) has `afterChange` / `afterDelete` hooks that call `revalidatePaths(...)` from `lib/revalidate.ts`. When adding a new collection that's rendered on the public site, **wire the same hooks** — otherwise admin edits are invisible until the next route revalidate window.

### Security model (load-bearing)

- **Env validated at startup** in `lib/env.ts` (Zod). Adding a new env var? Add it there or the app refuses to boot.
- **CSP with per-request nonce** in `middleware.ts`. Matcher skips `_next/static`, `_next/image`, `favicon.ico`, `fonts/`, `/api/health`, `/admin` — extending matcher requires re-reading those exclusions; `/admin` is excluded because Payload's UI needs its own CSP shape. Umami tracker origin is derived from `NEXT_PUBLIC_UMAMI_SRC` and conditionally appended to `script-src` + `connect-src` (no env → no allowlist entry).
- **Rate limiters** in `lib/rate-limit.ts` (token bucket, in-memory LRU). Two exports — `contactLimiter` (5/h) and `githubLimiter` (60/min). Reset on container restart; acceptable at single-instance scale.
- **`ContactSubmissions.create` is restricted to `req.payloadAPI === 'local'`** so only the Server Action (`app/(frontend)/contact/actions.ts`) can create records — that's where the rate limit lives. Direct REST POSTs are rejected by design.
- **IP hashing** (`lib/ip.ts`): SHA-256 with daily-rotating `DAILY_SALT_SECRET`. Never store raw IPs.
- **Media uploads**: admin-only, MIME whitelist + 5 MB cap, SVG forbidden. No magic-byte check yet — admin-trust is the active control.
- `style-src 'unsafe-inline'` is an accepted risk (mitigated by React escaping). `script-src` uses `'strict-dynamic'` with the nonce — never add inline `<script>`.

See `SECURITY.md` for full posture.

### SSE: sales-stream

`app/api/sales-stream/route.ts` streams mock sales via Server-Sent Events for the homepage revenue log. Encoder lives in `lib/revenue-stream.ts` (heartbeat with `:heartbeat\n\n` when payload is `null`). Real Stripe wiring is Phase 3 — keep the encoder/format stable so the client doesn't need changes when swapping mock → real.

### React Compiler

`next.config.ts` enables `experimental.reactCompiler: true` + `babel-plugin-react-compiler`. Don't add manual `useMemo`/`useCallback` for purity — the compiler handles it. Don't fight it with patterns that break the rules of React (mutation during render, conditional hooks, etc.).

### Tailwind v4

CSS-first config in `app/globals.css` via `@theme`. There is **no** `tailwind.config.js` — adding theme tokens means editing `globals.css`.

## Conventions

- Strict TS — `noUncheckedIndexedAccess` is on. Indexing arrays/records returns `T | undefined`; assert or guard, don't cast.
- Tests: unit + integration under `tests/{unit,integration}` (vitest, Node env). E2E under `tests/e2e` (Playwright, **excluded from tsconfig** — don't import app types there). a11y via `@axe-core/playwright`.
- Coverage gate applies to `lib/**` and `app/api/**`. New code in those paths needs tests to keep the gate green.
- ESLint includes `plugin:security/recommended-legacy`. `security/detect-object-injection` is intentionally off (too noisy for indexed access patterns).
- After changing collections/globals: regenerate types by running `pnpm build` (or `pnpm payload generate:types`). Don't hand-edit `payload-types.ts`.
- After a schema change that needs to ship: `pnpm payload migrate:create <name>`, commit the migration file.

## Deployment

Coolify on Hetzner. `Dockerfile` is multi-stage with `output: "standalone"`. `scripts/entrypoint.sh` waits for DB → runs `payload migrate` → idempotent `seed-fresh` → ensures admin user → starts `server.js`. The runner stage copies source files (collections, globals, lib, scripts, migrations, tsconfig) so `tsx` can load `payload.config.ts` at runtime — don't remove those COPY lines.

Build-time env in the Dockerfile (`PAYLOAD_SECRET`, `DATABASE_URL`, `DAILY_SALT_SECRET`) are **placeholders only** to satisfy `lib/env.ts` validation during `next build`. Real values come from Coolify at runtime. `NEXT_PUBLIC_SERVER_URL` is the exception — it's baked into the client bundle, so Coolify overrides it via build args.

Health: `GET /api/health` → 200 when ready. Used by Docker `HEALTHCHECK` and Coolify.
