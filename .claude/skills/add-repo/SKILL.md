---
name: add-repo
description: Create a DRAFT Repos entry on production 67projects.app from a GitHub URL. Trigger on `/add-repo <url>`, "dodaj repo", "stwórz draft repo z <url>", "add this github repo as a draft".
---

# add-repo

Goal: from a GitHub URL, save a **draft** `repos` entry (`published: false`) on production. The CLI fetches GitHub itself (name, owner, language, stars, license); your only optional value-add is an English `description`.

## Steps

1. **Take the GitHub URL** from the user's argument.

2. **(Optional) Refine the description.** GitHub's description is used by default. If it is missing, non-English, or weak, write a crisp English one (≤300 chars) and pass it via `--description`.

3. **(Optional) License override.** The CLI maps the GitHub SPDX id to the enum (unknown/none → `PROPRIETARY`). If the user wants `EXPERIMENTAL` (or another value), pass `--license <ENUM>` where ENUM ∈ `MIT LICENSE`, `APACHE 2.0`, `ISC`, `UNLICENSE`, `EXPERIMENTAL`, `PROPRIETARY`.

4. **Run:**
   `pnpm create-draft --type repo --url <github-url> [--description "<EN text>"] [--license "<ENUM>"]`

5. **Report** the admin edit URL the CLI prints. It is a DRAFT (`published: false`) — review and publish in `/admin`. If the name already exists, surface that and ask before re-running with `--force`.

## Notes
- The CLI uses `GITHUB_TOKEN` from `.env` if present (higher rate limit), but works without it for public repos.
- Never run with `--force` without asking.
- Requires `PROD_ADMIN_EMAIL` / `PROD_ADMIN_PASSWORD` in `.env`.
