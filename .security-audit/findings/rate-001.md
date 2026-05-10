---
id: rate-001
title: githubLimiter defined but not wired to /api/github-stars route
severity: MEDIUM
status: fixed
category: 2.3 Rate Limiting
fixed_in: app/api/github-stars/[owner]/[repo]/route.ts:17-27
---

## Evidence (pre-fix)
- File: `lib/rate-limit.ts:32` — `githubLimiter` defined.
- File: `app/api/github-stars/[owner]/[repo]/route.ts` — did NOT call `githubLimiter.take()`.

## Exploit (pre-fix)
- Spam unique `(owner, repo)` pairs to bypass ISR cache, exhaust GitHub PAT (5K/h authed, 60/h unauthed).

## Fix Applied
The route now calls `githubLimiter.take(getClientIp(...))` before any work. 429 with `Retry-After` on exceed.
