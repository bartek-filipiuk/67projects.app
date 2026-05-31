# Draft-authoring tool for 67projects.app (Projects + Repos)

**Date:** 2026-05-31
**Status:** Approved design — ready for implementation plan
**Author:** Bartek + Claude Code

## Problem

Bartek wants to create CMS entries on the **production** site 67projects.app
directly from a Claude Code session:

- **Project** — give a path to a local project directory → gather info → fill a
  `projects` entry → save as **draft** (English), publish manually later.
- **Repo** — give a GitHub URL → gather info → fill a `repos` entry → save as
  **draft** (`published: false`, English), publish manually later.

On another project this is done via a custom MCP server. Here we want it
**without MCP** — repo-local, version-controlled, low-overhead.

## Decisions (locked)

| Decision | Choice |
|----------|--------|
| Write channel | **Production REST API + admin login** (JWT). No DB access, no MCP. |
| Packaging | **Skill (slash command) + thin CLI script**. |
| Unknowable required fields | **Prompt interactively** each run (price, day, category, shipped). |
| Skills | **Two separate skills**: `/add-project`, `/add-repo` (sharing one CLI script). |
| `installSteps` (richText) | Built as valid **Lexical** state inside the script from plain text. |
| Login account | Recommend a dedicated `automation@…` admin account; tool works with any admin. |

## Constraints discovered in the codebase

- `projects` and `repos` do **not** use Payload's `versions/drafts` feature.
  "Draft" = `status: "draft"` (projects) / `published: false` (repos). **Full
  required-field validation still applies on create.**
- `create` access for both collections = `req.user?.role === "admin"` only →
  works over REST once authenticated as admin.
- `Users` has **no** `useAPIKey` → auth = `POST /api/users/login` → JWT, sent as
  `Authorization: JWT <token>`.
- `projects.category` is a **relationship** → must resolve a category **ID** by
  slug via `GET /api/categories?where[slug][equals]=…` before POST.
- `projects.slug` unique + kebab-case (`^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$`).
  `repos.name` unique. `repos.fullPath` auto-set by a `beforeChange` hook.
- Existing optional env `GITHUB_TOKEN` (used by github-stars) — reuse for GitHub
  API rate limits.

## Architecture — three layers

```
/add-project <dir>   /add-repo <url>      Skill: instructs Claude to gather + map
        │                   │
        ▼                   ▼
   Claude (this session): read repo/dir → build field object (EN) → prompt for
        │                 price / day / category / shipped (projects)
        ▼
   scripts/create-draft.ts        thin CLI: login → resolve category → POST → print link
        │  (network, prompts, secrets — NOT under coverage gate)
        ▼
   lib/draft-authoring.ts         pure functions (slugify, mapLicense, buildLexical,
        │  (unit-tested, under coverage gate)   buildProjectPayload, buildRepoPayload, validators)
        ▼
   https://67projects.app/api/...  POST /api/users/login → JWT → POST /api/projects | /api/repos
```

**Rationale:** deterministic, error-prone mapping logic (Lexical serialization,
license mapping, length limits, slug/day/price validation) lives in `lib/` so it
is unit-tested and stays inside the existing coverage gate (`lib/**`). Thin I/O
(fetch, prompts, secrets) lives in `scripts/` (outside the gate). Claude does the
language work (understand project → English copy). We use an **intended door**
(admin REST create is already permitted) — no change to the security posture.

## Files

| File | Role | New/Edit |
|------|------|----------|
| `.claude/skills/add-project/SKILL.md` | Trigger `/add-project`, gathering instructions for a local dir | New |
| `.claude/skills/add-repo/SKILL.md` | Trigger `/add-repo`, gathering instructions for a GitHub URL | New |
| `scripts/create-draft.ts` | CLI `--type project\|repo`: login, category lookup, POST, output edit link, dup-check | New |
| `lib/draft-authoring.ts` | Pure helpers: `slugify`, `mapLicense`, `buildLexical`, `buildProjectPayload`, `buildRepoPayload`, field validators | New |
| `tests/unit/draft-authoring.test.ts` | Unit tests for the helpers (keep coverage gate green) | New |
| `.env.example` | Add `PROD_API_URL`, `PROD_ADMIN_EMAIL`, `PROD_ADMIN_PASSWORD` | Edit |
| `package.json` | Add script `"create-draft": "tsx --env-file=.env scripts/create-draft.ts"` | Edit |

## Data flow — Project

1. `/add-project <dir>` → Claude reads `README*`, `package.json`, source, and a
   `tree -L 2`-style listing.
2. Claude composes (English):
   - `name` (Title Case), `slug` = `slugify(name)`, `path` = `/opt/67/<slug>.yaml`
   - `description` (≤500), `features[]` (bullets), `installSteps` (plain text /
     lines → script serializes to Lexical), `tree` (textarea listing)
   - `currency` = `USD`, `tag` (optional), `status` = `draft`
3. Claude **prompts** the user for: `priceCents`, `day` (default =
   `SiteSettings.currentDay` fetched from prod), `category` slug, `shipped`
   (default = today), optional `tag`.
4. Claude writes the field object to a temp JSON and runs
   `pnpm create-draft --type project <file>`.
5. Script: login → `GET /api/categories?where[slug][equals]=<cat>` → resolve ID →
   `buildProjectPayload` → dup-check on `slug` → `POST /api/projects` →
   print `…/admin/collections/projects/<id>`.

## Data flow — Repo

1. `/add-repo <url>` → the **script** calls GitHub API
   `GET /repos/{owner}/{name}` (with `GITHUB_TOKEN` if present). The GitHub
   fetch + field mapping is deterministic, so it lives in the CLI, not the prompt.
2. Map: `name`, `owner` = `owner.login`, `lang` = `language`,
   `starsCached` = `stargazers_count`, `starsCachedAt` = now,
   `license` = `mapLicense(license.spdx_id)`, `published` = `false`.
   `description` (≤300, English): the script uses the GitHub `description` as the
   default; Claude may refine/translate it and pass `--description "<EN text>"`,
   which overrides.
   - `mapLicense`: `MIT`→`MIT LICENSE`, `Apache-2.0`→`APACHE 2.0`, `ISC`→`ISC`,
     `Unlicense`→`UNLICENSE`, none/unknown → **prompt** with fallback
     `PROPRIETARY` / `EXPERIMENTAL`.
3. Dup-check on `name` → `POST /api/repos` → print
   `…/admin/collections/repos/<id>`. Repos usually need no prompt except an
   unusual/missing license.

## `installSteps` — Lexical handling

Claude provides plain text (lines, optional fenced code). The script's
`buildLexical(blocks)` converts an array of `{type: 'paragraph' | 'code', text}`
into a minimal **valid Lexical root** editor state accepted by Payload's REST for
the richText field. Encapsulating serialization in code (not in the prompt) makes
the output deterministic and avoids malformed editor state. If conversion is
ambiguous, leave `installSteps` empty (user fills in `/admin`).

## Auth, secrets, duplicates, errors

- **Login:** `POST /api/users/login {email,password}` → `{token}` → header
  `Authorization: JWT <token>`. Password never logged; token kept in memory only.
- **Secrets:** `PROD_API_URL` (default `https://67projects.app`),
  `PROD_ADMIN_EMAIL`, `PROD_ADMIN_PASSWORD` read from `.env` (gitignored). **Not**
  added to `lib/env.ts` (that validates app runtime; these are CLI-only and must
  not block app boot). Documented in `.env.example`. Recommended: dedicated
  `automation@…` admin account.
- **Duplicates:** pre-POST `GET ?where[slug|name][equals]=…`. If it exists, the
  script **refuses and reports** (so an edited draft is never clobbered). Optional
  `--force` flag performs an update instead.
- **Errors (clear messages):** 401 bad login; 400 validation (print which field);
  missing category slug; GitHub 404/rate-limit.
- **Output:** the admin edit URL → user reviews and publishes manually.

## Testing

- `lib/draft-authoring.ts` is fully unit-tested (`tests/unit/draft-authoring.test.ts`):
  `slugify` edge cases, `mapLicense` all branches + fallback, `buildLexical`
  produces valid structure, `buildProjectPayload`/`buildRepoPayload` enforce
  length limits / required fields / day range (1–67) / kebab slug.
- Network/CLI in `scripts/create-draft.ts` is not under the coverage gate;
  smoke-tested manually against a non-prod target first if available.

## Out of scope (YAGNI)

No MCP. No publishing (always draft). No overwrite without `--force`. No changes
to CSP / rate-limit / `lib/env.ts` / `app/(payload)/`. No magic-byte/media work.

## Open operational notes

- Use a dedicated `automation@…` admin account for cleaner audit and to avoid
  lockout interactions with your interactive session (5 attempts / 10-min lock on
  `Users`).
- `day` default is fetched live from `GET /api/globals/siteSettings` so the prompt
  pre-fills the current challenge day.
