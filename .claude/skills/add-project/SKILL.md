---
name: add-project
description: Create a DRAFT Projects entry on production 67projects.app from a local project directory. Trigger on `/add-project <dir>`, "dodaj projekt z katalogu", "stwórz draft projektu z <ścieżka>", "add this project as a draft".
---

# add-project

Goal: read a local project directory, compose all `projects` fields in **English**, and save a **draft** (`status: "draft"`) on production via `scripts/create-draft.ts`. The user publishes manually later.

## Steps

1. **Resolve the directory** from the user's argument (default: current working dir). Confirm it exists.

2. **Gather** (read-only): `README*`, `package.json` (name, description, scripts), and the layout. Produce a 2-level tree, e.g. run: `cd <dir> && (git ls-files 2>/dev/null | head -40 || find . -maxdepth 2 -not -path '*/node_modules/*' -not -path '*/.git/*' | head -40)`.

3. **Compose fields (English):**
   - `name` (Title Case, ≤120), `slug` (omit — the CLI derives kebab-case from name), `path` (omit — CLI defaults to `/opt/67/<slug>.yaml`).
   - `description` (≤500, a crisp marketing sentence), `features` (string[] of short bullets), `installSteps` (string[] — the install/run commands, one per line), `tree` (the listing from step 2 as one string).

4. **Prompt the user (one message)** for the fields the tool cannot infer:
   - `priceCents` (integer cents), `day` (1–67), `categorySlug` (one of `boilerplates`, `dev-tools`, `creator-economy`), `shipped` (ISO date, default today), optional `tag` (`""`, `NEW`, `HOT`, `BESTSELLER`).
   - Best-effort default for `day`: `curl -s https://67projects.app/api/globals/siteSettings | <read .currentDay>` and offer it as the default. If it fails, just ask.

5. **Write the JSON** to `/tmp/draft-project-<slug>.json` with exactly these keys (omit empty optionals): `name`, `description`, `priceCents`, `currency` (default `USD`), `categorySlug`, `day`, `shipped`, `tag`, `features`, `installSteps`, `tree`.

   Example:
   ```json
   {
     "name": "Mini SaaS Boilerplate",
     "description": "Next.js + Supabase + Stripe. Launch your SaaS this weekend.",
     "priceCents": 9999,
     "currency": "USD",
     "categorySlug": "boilerplates",
     "day": 3,
     "shipped": "2026-04-22",
     "tag": "BESTSELLER",
     "features": ["Email + OAuth auth", "Stripe billing", "Admin dashboard"],
     "installSteps": ["pnpm install", "cp .env.example .env", "pnpm dev"],
     "tree": "src/\n  app/\n  lib/\npackage.json"
   }
   ```

6. **Run:** `pnpm create-draft --type project /tmp/draft-project-<slug>.json`

7. **Report** the admin edit URL the CLI prints. Remind the user it is a DRAFT — review and publish in `/admin`. If the CLI says the slug already exists, surface that and ask before re-running with `--force`.

## Notes
- Never run with `--force` without asking — it overwrites an existing (possibly hand-edited) draft.
- Requires `PROD_ADMIN_EMAIL` / `PROD_ADMIN_PASSWORD` in `.env`. If login fails, tell the user to set them.
