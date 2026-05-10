# Security Posture

## Threat Model
- **Attackers:** opportunistic scanners, scrapers, low-skill spam bots, dependency-chain attackers
- **Assets:** ContactSubmissions PII, admin credentials, Postgres DB, GitHub PAT
- **Trust boundary:** anything inside the Coolify-managed VPS is trusted; anything from the public internet is untrusted

## Controls (in production)

### Transport
- HSTS preload (`max-age=63072000; includeSubDomains; preload`) — set in `next.config.ts`
- TLS terminated by Coolify Traefik with Let's Encrypt
- HTTP → HTTPS redirect at Traefik
- `upgrade-insecure-requests` in CSP

### Headers (next.config.ts + middleware.ts)
- `Content-Security-Policy` — strict, per-request nonce, no `unsafe-inline` for scripts (`'strict-dynamic'`)
- `X-Frame-Options: DENY` + CSP `frame-ancestors 'none'`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy`: deny camera, microphone, geolocation, payment, USB
- `X-Powered-By` removed via `poweredByHeader: false`

### Auth & secrets
- Payload built-in auth: bcrypt password hashing, HttpOnly+Secure+SameSite=Lax cookies
- 5-attempt lockout, 10-min lockTime
- `PAYLOAD_SECRET` ≥ 32 bytes, env-only
- `DAILY_SALT_SECRET` rotates IP hash daily
- All env vars validated at startup by `lib/env.ts` (Zod)

### Input validation
- Every API route validates with Zod (`lib/validators.ts`)
- Path params (`[slug]`, `[owner]`, `[repo]`) regex-validated before any DB/HTTP call
- Contact form: 10–2000 char message, 1–80 char name, honeypot field, rate-limited
- Drizzle (Payload internal) uses parameterized queries → SQL injection N/A

### Rate limiting (`lib/rate-limit.ts`)
- Contact form (Server Action `submitContact`): 5 requests / hour / IP, token bucket
- `/api/github-stars/*`: 60 requests / minute / IP, token bucket
- ContactSubmissions REST create: forbidden — `create: req.payloadAPI === 'local'` ensures only the Server Action (which enforces the rate limit) can create records
- 429 with `Retry-After` header
- In-memory LRU; ready to swap for Upstash Redis at scale

### GDPR
- Self-hosted fonts (no Google Fonts CDN)
- No third-party analytics in MVP
- IP hashing (SHA-256 with daily-rotating salt) — irreversible
- All data EU-resident (Hetzner Falkenstein when deployed)
- Right-to-delete: admin can purge ContactSubmissions

### Media uploads
- Admin-only (auth gated)
- MIME whitelist (`Media.ts` `upload.mimeTypes` + `beforeChange` re-check)
- 5 MB hard size cap (`MAX_BYTES`)
- SVG explicitly forbidden (XSS vector)
- Magic-byte content check NOT implemented in MVP — admin-trust is the active control. Add `file-type` check in Phase 3 if media uploads open up to non-admin users.

### Dependency hygiene
- `pnpm audit --prod` gate
- Renovate / Dependabot config (in CI when added)
- ESLint with `eslint-plugin-security`

## Known Acceptable Risks (low/medium, post-audit)
- `style-src 'unsafe-inline'`: required for inline styles in components. Mitigated by escaping all user content via React; no untrusted user-supplied HTML rendered.
- In-memory rate limiter resets on container restart: acceptable at single-instance scale; swap to Redis when horizontally scaling.
- No CAPTCHA on contact form: rate limit + honeypot are first-line. Add Cloudflare Turnstile if abuse appears.

## Reporting
Vulnerabilities: bartek@67projects.app — PGP key TODO.
