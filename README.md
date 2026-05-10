# 67projects.app

Production-grade Next.js 15 + Payload 3 + Postgres app for Bartek's 67-day shipping challenge.

## Stack

- **Framework:** Next.js 15 (App Router, React 19, Server Components)
- **CMS:** Payload CMS 3 (embedded — admin, REST/GraphQL, and frontend share one deploy)
- **DB:** PostgreSQL 16 (Docker, Drizzle adapter)
- **Styling:** Tailwind CSS v4 (CSS-first `@theme`)
- **Tests:** Vitest (unit + integration) + Playwright (E2E + axe-core a11y)
- **Fonts:** self-hosted JetBrains Mono / IBM Plex Mono (GDPR-compliant)

## Quick Start (local)

```bash
cp .env.example .env
# edit .env — replace PAYLOAD_SECRET, DAILY_SALT_SECRET, ADMIN_PASSWORD, etc.

docker compose up -d db    # Postgres 16
pnpm install
pnpm create-admin           # creates first admin user from env
pnpm seed                   # 14 projects, 5 repos, 10 log entries
pnpm dev
```

- Site: http://localhost:3000
- Payload admin: http://localhost:3000/admin

## Production Build

```bash
docker compose build app
docker compose up -d
```

Service `/api/health` returns 200 when ready.

## Coolify Deployment (Hetzner CPX21)

1. **Pin Coolify ≥ v4.0.0-beta.451** — fixes the January 2026 critical CVEs
2. **Bind dashboard to localhost** (Settings → Advanced); access via `ssh -L 8000:localhost:8000 user@host`; enable 2FA
3. Provision Postgres 16 inside Coolify (Resources → Database)
4. Add Application → Public Repository → Build pack: Dockerfile
5. Set `NODE_OPTIONS=--max-old-space-size=3072` (Payload+Next build memory)
6. Mount `/app/media` to a named volume
7. Add domain; let Traefik auto-issue Let's Encrypt
8. Schedule daily `pg_dump` → Hetzner Object Storage

DNS prerequisite: A records for apex + `www` must point to the IP **before** adding domain in Coolify (Let's Encrypt HTTP-01 challenge needs them).

## Environment Variables

All env vars validated at startup by `lib/env.ts`. See `.env.example`.

| Var | Required | Notes |
|---|---|---|
| `PAYLOAD_SECRET` | yes | ≥ 32 random bytes — `openssl rand -base64 48` |
| `DATABASE_URL` | yes (prod) | Postgres connection string |
| `NEXT_PUBLIC_SERVER_URL` | yes | https://67projects.app in prod |
| `GITHUB_TOKEN` | optional | PAT, `read:public_repo` scope, 5K req/h authed limit |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | yes (first run) | Used by `pnpm create-admin` |
| `DAILY_SALT_SECRET` | yes | ≥ 16 bytes; rotates IP hashing daily |
| `TRUST_PROXY` | yes (prod) | `1` when behind Coolify Traefik / reverse proxy |

## Testing

```bash
pnpm typecheck             # tsc strict
pnpm lint                  # eslint + plugin-security
pnpm test                  # vitest unit + integration
pnpm test:coverage         # 90%+ on lib/, app/api/
pnpm test:e2e              # playwright (auto-spawns prod server)
pnpm audit --prod          # 0 high/critical gate
```

## Security

See `SECURITY.md`. Highlights:

- Strict CSP with per-request nonce (`middleware.ts`)
- HSTS preload, X-Frame-Options DENY, Referrer-Policy strict
- Zod input validation everywhere
- Rate limiting on contact + GitHub stars routes
- IP hashing with daily-rotating salt (GDPR data minimization)
- No third-party fonts/analytics/cookies
- SQL injection N/A (Drizzle parameterized via Payload)

After major changes: run `Skill(security-audit)` and address all high/critical findings.

## Performance Targets

- Lighthouse 100/100/100/100 on Home (production build)
- Core Web Vitals on Home: LCP ≤ 1.5s, INP ≤ 200ms, CLS ≤ 0.05
- First Load JS on Home: ≤ 90 kB

## Phase 3 Roadmap

When the first paying customer is real:

- Stripe via `@payloadcms/plugin-stripe` + Stripto.pl/KSeF for Polish e-invoicing
- Polar.sh as Merchant of Record alternative (lower fee, EU VAT handled)
- Customer accounts UI (Payload auth ready, only login/signup pages needed)
- Resend email notifications (contact submit + new sale)
- Self-hosted Umami analytics (Coolify one-click)
- Real revenue feed via Stripe webhooks → Payload `Sales` collection → SSE source

See `docs/superpowers/specs/2026-05-10-67projects-app-design.md` for full design and `docs/superpowers/plans/2026-05-10-67projects-app-implementation.md` for the implementation history.
