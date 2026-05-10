---
id: upload-001
title: Media collection lacked explicit file size limit
severity: MEDIUM
status: fixed
category: 2.6 File Upload
fixed_in: collections/Media.ts:8,30-34
---

## Evidence (pre-fix)
- `collections/Media.ts` upload config had `mimeTypes` whitelist but no `fileSize` limit.
- SECURITY.md and design promised "5 MB max."

## Reachability
- Admin-only upload (auth-gated). Lower exploitability than open-upload, but a compromised admin token or curious admin could fill disk / OOM via Sharp resize.

## Fix Applied
- Added `MAX_BYTES = 5 * 1024 * 1024`
- `beforeChange` hook now checks `req.file.size > MAX_BYTES` and rejects.
