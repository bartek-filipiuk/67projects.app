---
id: upload-002
title: Magic-byte validation claimed in SECURITY.md but not implemented
severity: LOW
status: documented
category: 2.10 Documentation vs Reality
---

## Evidence
SECURITY.md claimed magic-byte verification, but `collections/Media.ts` only checked `req.file.mimetype` (client-supplied).

## Decision
Drop the claim from SECURITY.md (admin-only upload + MIME whitelist + size cap is sufficient). Documented as future Phase 3 work if media uploads open to non-admin users.

## Fix Applied
SECURITY.md updated:
- "Magic-byte content check NOT implemented in MVP — admin-trust is the active control."
