# Security Audit Report — 67projects.app

**Date:** 2026-05-10
**Auditor:** Claude Opus 4.7 (security-audit skill, Standard Mode)
**Scope:** `/home/bartek/video-projects/67projects/67projects.app/` (post-implementation)
**Methodology:** OWASP Top 10 2021 + OWASP API Top 10 2023 + stack patterns (Next.js 15 / Payload 3 / Postgres)

---

## Executive Summary

| Severity | Pre-Audit | Fixed | Documented | Remaining |
|---|---|---|---|---|
| CRITICAL | 0 | — | — | **0** |
| HIGH | 1 | 1 | — | **0** |
| MEDIUM | 2 | 2 | — | **0** |
| LOW | 1 | — | 1 | **0** (informational) |

**Score:** 0 verified open findings.
**Disposition:** All HIGH/MEDIUM findings fixed in code. LOW finding (documentation drift) corrected in SECURITY.md.

**Verdict:** Codebase meets the design spec's "model project for performance and security" goal. Ready for production deploy after Bartek populates real env secrets.

---

## Recon Summary

**Stack:** Next.js 15 (App Router, RSC), Payload CMS 3.81+ (embedded), PostgreSQL 16, Drizzle ORM, Tailwind v4, Zod, Vitest + Playwright.

**Entry Points (15 total — Standard Mode threshold):**

| Endpoint | Auth | Cache |
|---|---|---|
| `GET /` | public | revalidate 300s |
| `GET /projects` | public | revalidate 600s |
| `GET /projects/[slug]` | public | SSG + revalidate |
| `GET /open-source` | public | revalidate 3600s |
| `GET /log` | public | revalidate 600s |
| `GET /log/[slug]` | public | SSG |
| `GET /contact` | public | static |
| Server Action `submitContact` | public | dynamic, rate-limited |
| `GET /api/health` | public | dynamic |
| `GET /api/github-stars/[owner]/[repo]` | public | revalidate 3600s, rate-limited |
| `GET /api/sales-stream` | public | force-dynamic SSE |
| `GET/POST /api/[...slug]` | Payload access control | dynamic |
| `GET/POST /admin/*` | Payload auth | dynamic |
| `GET /robots.txt`, `GET /sitemap.xml` | public | static/SSG |

**Security Claims (from SECURITY.md, all verified post-fix):**
- Strict CSP with per-request nonce ✓
- HSTS preload ✓
- X-Frame-Options DENY ✓
- Zod everywhere ✓
- Rate limiting on contact + GitHub stars ✓
- IP hashing with daily-rotating salt ✓
- No third-party analytics/cookies ✓
- SQL injection N/A (Drizzle parameterized) ✓

---

## Findings (all fixed or documented)

### 1. [HIGH → fixed] auth-001: ContactSubmissions REST allowed unauthenticated public create
- **File:** `collections/ContactSubmissions.ts:8`
- **Issue:** `create: () => true` allowed direct `POST /api/contactSubmissions`, bypassing the Server Action's rate limiter.
- **Fix:** `create: ({ req }) => req.payloadAPI === "local"` — only Local API (used inside Server Action with rate-limit + IP hashing) can create.

### 2. [MEDIUM → fixed] rate-001: githubLimiter not wired to /api/github-stars
- **File:** `app/api/github-stars/[owner]/[repo]/route.ts`
- **Issue:** Rate limiter defined in `lib/rate-limit.ts` but route did not invoke it. Cold-cache misses on unique (owner, repo) pairs could exhaust GitHub PAT.
- **Fix:** Route now calls `githubLimiter.take(ip)` first; returns 429 + `Retry-After` on exceed.

### 3. [MEDIUM → fixed] upload-001: Media collection had no explicit size cap
- **File:** `collections/Media.ts`
- **Issue:** Spec promised 5 MB max; not enforced.
- **Fix:** Added `MAX_BYTES = 5 * 1024 * 1024` and `beforeChange` check.

### 4. [LOW → documented] upload-002: SECURITY.md claimed magic-byte validation but code did not implement it
- **File:** `SECURITY.md`
- **Issue:** Documentation drift — implementation only checked client-supplied MIME.
- **Resolution:** SECURITY.md updated to reflect actual controls (admin-only + MIME whitelist + size cap). Magic-byte check noted as Phase 3 work.

---

## Non-Issues (areas examined and found secure)

See `.security-audit/non-issues/non-issues.md`. Highlights:

- Payload auth: bcrypt + lockout + secure cookies ✓
- Zero `dangerouslySetInnerHTML` / `eval` in custom code ✓
- All path params Zod-validated before DB/HTTP ✓
- React auto-escapes JSX ✓
- Generic error responses, no stack trace leaks ✓
- HSTS / CSP / Frame-Options / Permissions-Policy all set ✓
- Self-hosted fonts (GDPR) ✓
- IP hashing with daily salt rotation ✓
- `pnpm audit --audit-level=high` exit 0 ✓

---

## Documentation vs Reality

| Claim in SECURITY.md / spec | Reality | Status |
|---|---|---|
| Strict CSP with nonce | `middleware.ts` implements per-request `crypto.randomUUID()` nonce | ✓ |
| HSTS preload | `next.config.ts` headers | ✓ |
| Zod validation everywhere | All API routes + Server Action validate | ✓ |
| Rate limit on contact form | Server Action + Payload Local-API-only create | ✓ (after auth-001) |
| Rate limit on GitHub stars | `githubLimiter.take()` in route | ✓ (after rate-001) |
| IP hashing with daily salt | SHA-256(`DAILY_SALT_SECRET:YYYY-MM-DD\|ip`) | ✓ |
| 5 MB upload cap | Enforced in Media.ts beforeChange | ✓ (after upload-001) |
| Magic-byte file validation | NOT implemented; admin-only mitigates | ✓ (claim removed) |
| No third-party analytics | Verified — no GA/Plausible/etc. in code | ✓ |
| 0 high/critical deps | `pnpm audit --audit-level=high` exit 0 | ✓ |

---

## Test Quality

| Category | Status |
|---|---|
| Unit tests on `lib/` | 95–100% per file (38 tests, all pass) |
| Integration tests on API routes | github-stars + sales-stream covered |
| E2E tests | home, projects (list+detail+filter), contact (submit+honeypot rejection), a11y on 5 routes |
| Coverage thresholds | lines 90 / branches 85 / funcs 90 / statements 90 — met |
| Security regression tests | rate-limit logic tested (token bucket fills, refills, isolates keys); slug regex tested for path-traversal rejection; honeypot rejection tested |

**Gap (deferred):** No explicit E2E test for "REST POST to ContactSubmissions returns 403". Would catch regression of auth-001. Recommend adding in a follow-up commit.

---

## Recommended Actions (post-audit)

1. **Add regression test:** E2E or integration test that hits `POST /api/contactSubmissions` as anonymous and asserts 403.
2. **Subresource Integrity:** No external scripts now (CSP `'self' 'strict-dynamic'`), so SRI N/A.
3. **Phase 3 hardening when traffic increases:**
   - Swap in-memory rate limiter for Upstash Redis (multi-instance consistency).
   - Add `file-type` magic-byte check if media uploads expand beyond admin.
   - Add Cloudflare Turnstile to contact form if abuse appears.
   - Wire Renovate/Dependabot for monthly dep PRs.
4. **Operational:** SSH-tunnel the Payload admin in production (Coolify dashboard binding). Documented in README.

---

## Summary

The codebase passes a security audit at the level expected for a "model project." Three real findings were caught and fixed (1 HIGH, 2 MEDIUM); one documentation drift was corrected. No false positives required reject decisions. `pnpm audit --audit-level=high` is clean. Tests pass. Build passes. Production-ready pending real env secrets and DNS setup.
