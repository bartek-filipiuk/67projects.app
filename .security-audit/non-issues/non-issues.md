# Non-Issues — Areas Examined and Found Secure

## 2.1 Authentication & Authorization
- **Payload auth**: bcrypt hashing, HttpOnly+Secure+SameSite=Lax cookies, 5-attempt lockout / 10-min lockTime via `Users.ts` config.
- **Access control on every collection** verified: Users (admin-only / self-update), Categories/Repos/Media (read-public, write-admin), Projects/LogEntries (published-only for non-admin; full for admin), ContactSubmissions (create-local-only after fix, read-admin-only), SiteSettings (read-public, update-admin).
- **No JWT confusion / alg:none** — Payload signs internally with PAYLOAD_SECRET (≥ 32 bytes enforced).

## 2.2 Input Validation & Injection
- **No `dangerouslySetInnerHTML`, `eval`, `new Function`, or `innerHTML`** anywhere in custom code (verified by repo grep).
- **All API inputs Zod-validated** (`lib/validators.ts`): contact form, slug, github-repo paths.
- **Path params validated** before any DB or HTTP call (slug regex, github owner/repo regex).
- **Drizzle ORM (via Payload)** uses parameterized queries — SQL injection N/A.
- **Lexical RTE** stored as JSON, rendered server-side; MVP renders only `excerpt` text fields, not JSON-as-HTML.
- **React JSX** auto-escapes all interpolations.

## 2.3 Rate Limiting
- Contact: 5/h/IP at Server Action layer; REST create disabled (after auth-001 fix).
- GitHub stars: 60/min/IP after rate-001 fix.
- SSE `/api/sales-stream`: no per-IP cap but mock data only, no DB access. Acceptable.
- Health: returns minimal data; no abuse vector.

## 2.4 Data Exposure
- **Error pages** return generic messages (`error.tsx` = "> segfault"); no stack traces leaked.
- **API errors** return `{ error: "internal" }` for 500s; specific upstream codes (404/422) for github.
- **ContactSubmissions** stores `ipHash` (SHA-256 + daily salt), never raw IP.
- **Health endpoint** returns version + timestamp only — no DB info, no env, no filesystem paths.
- **No sensitive fields exposed** by Payload Projects/Repos read access (no `password`, no `email` in non-Users collections).

## 2.5 Security Headers & Transport
- HSTS `max-age=63072000; includeSubDomains; preload` ✓ (`next.config.ts`)
- X-Frame-Options DENY ✓ (next.config.ts + CSP `frame-ancestors 'none'`)
- X-Content-Type-Options nosniff ✓
- Referrer-Policy strict-origin-when-cross-origin ✓
- Permissions-Policy locks camera/mic/geo/payment/usb ✓
- CSP with per-request nonce ✓ (`middleware.ts`)
- `script-src 'strict-dynamic' 'self' 'nonce-...'` — no `unsafe-inline` for scripts ✓
- CORS limited to `NEXT_PUBLIC_SERVER_URL` in `payload.config.ts` ✓
- CSRF protection: SameSite=Lax cookies + Server Actions' built-in protection ✓
- Self-hosted fonts only (no Google Fonts CDN) ✓

## 2.6 File Upload
- MIME whitelist: png/jpeg/webp/avif (Media.ts).
- 5 MB cap (after upload-001 fix).
- SVG forbidden (XSS vector).
- Filename sanitization: Payload's default behaviour normalizes filenames.

## 2.7 Dependency Security
- `pnpm audit --audit-level=high --prod` exit 0 — zero high/critical.
- 11 moderate findings in `@monaco-editor/react > monaco-editor > dompurify` (transitively via `@payloadcms/ui`).
  - Reachable only inside Payload admin panel (auth-gated).
  - Per SECURITY.md, admin in production is bound to localhost via SSH tunnel — not internet-reachable.
  - Documented as known-acceptable risk; will be auto-remediated when upstream Payload updates `@monaco-editor/react`.

## 2.8 Cryptography
- Password hashing: bcrypt via Payload built-in (cost factor at Payload defaults).
- IP hashing: Node `crypto.createHash("sha256")` + daily-rotating salt — irreversible.
- CSP nonce: `crypto.randomUUID()` (cryptographically secure).
- No custom crypto, no Math.random for security-sensitive values.

## 2.9 Concurrency & Race Conditions
- Rate limiter: in-memory token bucket; single-process consistent. Multi-instance would need Redis (documented).
- ContactSubmissions inserts are append-only (no update/race window).
- No payment / financial state — N/A.

## 2.10 Documentation vs Reality
- SECURITY.md fully aligned with code post-audit (magic-byte claim removed; rate-limit story corrected).

## 2.11 Business Logic
- **Mass assignment**: Payload validates fields per collection schema. ContactSubmissions exposes only `name`, `message`, `ipHash`, `userAgent`. After auth-001 fix, only Local API can create — Server Action constructs the object explicitly so no client-controlled mass assignment.
- **No negative values, no payment** — N/A in MVP.
- **IDOR**: No user-owned resources yet. ContactSubmissions read is admin-only.
- **Soft-delete**: Not used.

## 2.12 Logging & Monitoring
- Payload has structured logging (Pino).
- No PII logged in custom code.
- Errors logged server-side only; client gets generic messages.
- Request ID propagation: deferred to Phase 3 if observability becomes a need.

## Architectural Wins
- **Single deploy** (Payload + Next): no inter-service auth surface.
- **All data EU-resident** when deployed to Hetzner FSN1 (GDPR-clean).
- **Self-hosted fonts** + no third-party analytics → no consent banner needed.
- **Local API in RSC**: pages access DB through Payload's typed in-process API, not HTTP — no auth-token sprawl.
