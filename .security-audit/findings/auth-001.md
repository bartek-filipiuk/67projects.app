---
id: auth-001
title: ContactSubmissions REST endpoint allows public create — bypasses Server Action rate limit
severity: HIGH
status: fixed
category: 2.3 Rate Limiting / 2.11 Business Logic
fixed_in: collections/ContactSubmissions.ts:8
---

## Evidence
- File: `collections/ContactSubmissions.ts`
- Line: 8 (before fix) — `create: () => true,`
- File: `app/(payload)/api/[...slug]/route.ts` mounts Payload REST handlers including `POST /api/contactSubmissions`

## Reachability (verified)
- Public REST endpoint at `POST /api/contactSubmissions` was reachable without auth.
- The `submitContact` Server Action enforces `contactLimiter` (5/h/IP) but only in `app/(frontend)/contact/actions.ts`.
- Direct REST POST bypassed the Server Action entirely.

## Exploit (verified pre-fix)
1. `curl -X POST .../api/contactSubmissions -d '{"name":"x","message":"spam"}'`
2. No rate limit applies. DB fills with spam.
3. Attacker can also pass `ipHash` field (no field-level access control), spoofing dedup/correlation.

## Fix Applied
```ts
create: ({ req }) => req.payloadAPI === "local",
```
This allows creates ONLY via Payload's Local API (used by `getPayload()` inside the Server Action). Direct REST/GraphQL POSTs are now denied.
