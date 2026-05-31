# Draft-authoring tool for 67projects.app — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** From a Claude Code session, create a draft `projects` entry (from a local dir) or `repos` entry (from a GitHub URL) on the production 67projects.app site, in English, ready for manual publishing.

**Architecture:** Two project-local skills (`/add-project`, `/add-repo`) instruct Claude to gather + map fields. Pure, unit-tested helpers in `lib/draft-authoring.ts` do deterministic mapping/validation/Lexical serialization (under the coverage gate). A thin CLI `scripts/create-draft.ts` logs into the production Payload REST API as an admin (JWT), resolves the category, dedup-checks, and POSTs. No MCP; no DB access.

**Tech Stack:** TypeScript (strict, `noUncheckedIndexedAccess`), Node 22 global `fetch`, `tsx`, vitest, Payload 3 REST API, GitHub REST API.

**Spec:** `docs/superpowers/specs/2026-05-31-67projects-draft-authoring-tool-design.md`

---

## File Structure

| File | Responsibility |
|------|----------------|
| `lib/draft-authoring.ts` | Pure helpers + types: `slugify`, `mapLicense`, `buildLexical`, `buildProjectPayload`, `buildRepoPayload`. No I/O. |
| `tests/unit/draft-authoring.test.ts` | Unit tests for every exported helper (keeps `lib/**` coverage gate green). |
| `scripts/create-draft.ts` | CLI: arg parse, login, GitHub fetch, category lookup, dedup, POST/PATCH, print admin link. I/O only. |
| `.claude/skills/add-project/SKILL.md` | `/add-project <dir>` — gather a local project, prompt for price/day/category/shipped, write JSON, run CLI. |
| `.claude/skills/add-repo/SKILL.md` | `/add-repo <url>` — optionally refine EN description, run CLI (CLI fetches GitHub). |
| `.env.example` (edit) | Document `PROD_API_URL`, `PROD_ADMIN_EMAIL`, `PROD_ADMIN_PASSWORD`. |
| `package.json` (edit) | Add `"create-draft"` script. |

**Field facts (from collections):** `projects` required: `slug` (kebab `^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$`, unique), `name` (≤120), `path` (≤200), `priceCents` (int ≥0), `currency` (USD/EUR/PLN), `category` (relationship → ID), `description` (≤500), `shipped` (date), `day` (1–67), `status`. Optional: `tag` (""/NEW/HOT/BESTSELLER), `features[].text`, `installSteps` (richText Lexical), `tree`, `buyersCount`, `avgRating`. "Draft" = `status:"draft"` — **full validation still applies**. `repos` required: `name` (unique), `owner`, `description` (≤300), `lang`, `license` (enum). "Draft" = `published:false`. `fullPath` auto-set by a `beforeChange` hook.

---

## Task 1: Pure mappers — `slugify` + `mapLicense`

**Files:**
- Create: `lib/draft-authoring.ts`
- Test: `tests/unit/draft-authoring.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `tests/unit/draft-authoring.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { slugify, mapLicense } from "@/lib/draft-authoring";

describe("slugify", () => {
  it("kebab-cases a normal name", () => {
    expect(slugify("Mini SaaS Boilerplate")).toBe("mini-saas-boilerplate");
  });
  it("strips punctuation and trims dashes", () => {
    expect(slugify("  Hello -- World!  ")).toBe("hello-world");
  });
  it("strips diacritics", () => {
    expect(slugify("Café Crème")).toBe("cafe-creme");
  });
  it("collapses runs of separators", () => {
    expect(slugify("a___b   c")).toBe("a-b-c");
  });
});

describe("mapLicense", () => {
  it("maps known SPDX ids", () => {
    expect(mapLicense("MIT")).toBe("MIT LICENSE");
    expect(mapLicense("Apache-2.0")).toBe("APACHE 2.0");
    expect(mapLicense("ISC")).toBe("ISC");
    expect(mapLicense("Unlicense")).toBe("UNLICENSE");
  });
  it("falls back to PROPRIETARY for unknown/none", () => {
    expect(mapLicense("NOASSERTION")).toBe("PROPRIETARY");
    expect(mapLicense(null)).toBe("PROPRIETARY");
    expect(mapLicense(undefined)).toBe("PROPRIETARY");
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm vitest run tests/unit/draft-authoring.test.ts`
Expected: FAIL — cannot find module `@/lib/draft-authoring`.

- [ ] **Step 3: Write the minimal implementation**

Create `lib/draft-authoring.ts`:

```ts
export const LICENSES = [
  "MIT LICENSE",
  "APACHE 2.0",
  "ISC",
  "UNLICENSE",
  "EXPERIMENTAL",
  "PROPRIETARY",
] as const;
export type License = (typeof LICENSES)[number];

/** Lower-cases, strips diacritics + punctuation, collapses to kebab-case. */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Maps a GitHub SPDX id to the Repos.license enum; unknown/none → PROPRIETARY. */
export function mapLicense(spdx: string | null | undefined): License {
  switch ((spdx ?? "").toUpperCase()) {
    case "MIT":
      return "MIT LICENSE";
    case "APACHE-2.0":
      return "APACHE 2.0";
    case "ISC":
      return "ISC";
    case "UNLICENSE":
      return "UNLICENSE";
    default:
      return "PROPRIETARY";
  }
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm vitest run tests/unit/draft-authoring.test.ts`
Expected: PASS (10 assertions).

- [ ] **Step 5: Commit**

```bash
git add lib/draft-authoring.ts tests/unit/draft-authoring.test.ts
git commit -m "feat(draft-authoring): slugify + mapLicense pure mappers"
```

---

## Task 2: `buildLexical` — plain text → valid Lexical state

**Files:**
- Modify: `lib/draft-authoring.ts`
- Test: `tests/unit/draft-authoring.test.ts`

- [ ] **Step 1: Add the failing tests**

Append to `tests/unit/draft-authoring.test.ts`:

```ts
import { buildLexical } from "@/lib/draft-authoring";

describe("buildLexical", () => {
  it("turns each non-empty line into a paragraph", () => {
    const state = buildLexical(["npm install", "npm run dev"]);
    expect(state.root.type).toBe("root");
    expect(state.root.children).toHaveLength(2);
    const first = state.root.children[0];
    expect(first?.type).toBe("paragraph");
    expect(first?.children[0]?.text).toBe("npm install");
  });
  it("drops blank lines", () => {
    const state = buildLexical(["only", "   ", ""]);
    expect(state.root.children).toHaveLength(1);
  });
  it("yields one empty paragraph for empty input", () => {
    const state = buildLexical([]);
    expect(state.root.children).toHaveLength(1);
    expect(state.root.children[0]?.children).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `pnpm vitest run tests/unit/draft-authoring.test.ts`
Expected: FAIL — `buildLexical` is not exported.

- [ ] **Step 3: Implement `buildLexical`**

Append to `lib/draft-authoring.ts`:

```ts
export type LexicalTextNode = {
  type: "text";
  text: string;
  format: number;
  style: string;
  mode: "normal";
  detail: number;
  version: number;
};

export type LexicalParagraphNode = {
  type: "paragraph";
  format: "";
  indent: number;
  version: number;
  direction: "ltr";
  textFormat: number;
  children: LexicalTextNode[];
};

export type LexicalState = {
  root: {
    type: "root";
    format: "";
    indent: number;
    version: number;
    direction: "ltr";
    children: LexicalParagraphNode[];
  };
};

function paragraph(text: string): LexicalParagraphNode {
  const children: LexicalTextNode[] =
    text.length === 0
      ? []
      : [{ type: "text", text, format: 0, style: "", mode: "normal", detail: 0, version: 1 }];
  return { type: "paragraph", format: "", indent: 0, version: 1, direction: "ltr", textFormat: 0, children };
}

/** Serializes plain-text lines into a minimal valid Lexical editor state. */
export function buildLexical(lines: string[]): LexicalState {
  const paras = lines.filter((l) => l.trim().length > 0).map(paragraph);
  const children = paras.length > 0 ? paras : [paragraph("")];
  return { root: { type: "root", format: "", indent: 0, version: 1, direction: "ltr", children } };
}
```

- [ ] **Step 4: Run to verify pass**

Run: `pnpm vitest run tests/unit/draft-authoring.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/draft-authoring.ts tests/unit/draft-authoring.test.ts
git commit -m "feat(draft-authoring): buildLexical plain-text → Lexical state"
```

---

## Task 3: `buildProjectPayload` — validated Projects payload

**Files:**
- Modify: `lib/draft-authoring.ts`
- Test: `tests/unit/draft-authoring.test.ts`

- [ ] **Step 1: Add the failing tests**

Append to `tests/unit/draft-authoring.test.ts`:

```ts
import { buildProjectPayload, type ProjectInput } from "@/lib/draft-authoring";

const baseProject: ProjectInput = {
  name: "Mini SaaS Boilerplate",
  description: "Next.js + Supabase + Stripe starter.",
  priceCents: 9999,
  categorySlug: "boilerplates",
  day: 3,
  shipped: "2026-04-22",
};

describe("buildProjectPayload", () => {
  it("derives slug + path, defaults currency/tag/status", () => {
    const p = buildProjectPayload(baseProject, 7);
    expect(p.slug).toBe("mini-saas-boilerplate");
    expect(p.path).toBe("/opt/67/mini-saas-boilerplate.yaml");
    expect(p.currency).toBe("USD");
    expect(p.tag).toBe("");
    expect(p.status).toBe("draft");
    expect(p.category).toBe(7);
  });
  it("maps features and installSteps", () => {
    const p = buildProjectPayload(
      { ...baseProject, features: ["Auth", "Billing"], installSteps: ["pnpm i"] },
      7,
    );
    expect(p.features).toEqual([{ text: "Auth" }, { text: "Billing" }]);
    expect(p.installSteps?.root.children[0]?.children[0]?.text).toBe("pnpm i");
  });
  it("rejects description over 500 chars", () => {
    expect(() => buildProjectPayload({ ...baseProject, description: "x".repeat(501) }, 7)).toThrow(/description/);
  });
  it("rejects day outside 1..67", () => {
    expect(() => buildProjectPayload({ ...baseProject, day: 0 }, 7)).toThrow(/day/);
    expect(() => buildProjectPayload({ ...baseProject, day: 68 }, 7)).toThrow(/day/);
  });
  it("rejects negative or non-integer price", () => {
    expect(() => buildProjectPayload({ ...baseProject, priceCents: -1 }, 7)).toThrow(/priceCents/);
    expect(() => buildProjectPayload({ ...baseProject, priceCents: 1.5 }, 7)).toThrow(/priceCents/);
  });
  it("rejects an invalid shipped date", () => {
    expect(() => buildProjectPayload({ ...baseProject, shipped: "not-a-date" }, 7)).toThrow(/shipped/);
  });
  it("rejects a slug that is not kebab-case", () => {
    expect(() => buildProjectPayload({ ...baseProject, slug: "Bad Slug" }, 7)).toThrow(/slug/);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `pnpm vitest run tests/unit/draft-authoring.test.ts`
Expected: FAIL — `buildProjectPayload` / `ProjectInput` not exported.

- [ ] **Step 3: Implement `buildProjectPayload`**

Append to `lib/draft-authoring.ts`:

```ts
const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

export type ProjectTag = "" | "NEW" | "HOT" | "BESTSELLER";
export type Currency = "USD" | "EUR" | "PLN";

export type ProjectInput = {
  name: string;
  slug?: string;
  path?: string;
  description: string;
  features?: string[];
  installSteps?: string[];
  tree?: string;
  priceCents: number;
  currency?: Currency;
  categorySlug: string;
  day: number;
  shipped: string;
  tag?: ProjectTag;
};

export type ProjectPayload = {
  slug: string;
  name: string;
  path: string;
  priceCents: number;
  currency: Currency;
  tag: ProjectTag;
  category: number | string;
  description: string;
  shipped: string;
  day: number;
  status: "draft";
  features?: { text: string }[];
  installSteps?: LexicalState;
  tree?: string;
};

/** Validates a ProjectInput and produces a draft Projects payload (status:"draft"). */
export function buildProjectPayload(input: ProjectInput, categoryId: number | string): ProjectPayload {
  const name = input.name.trim();
  if (!name) throw new Error("name is required");
  if (name.length > 120) throw new Error("name exceeds 120 chars");

  const slug = input.slug?.trim() || slugify(name);
  if (!SLUG_RE.test(slug)) throw new Error(`Invalid slug: "${slug}" (kebab-case only)`);

  const description = input.description.trim();
  if (!description) throw new Error("description is required");
  if (description.length > 500) throw new Error("description exceeds 500 chars");

  if (!Number.isInteger(input.priceCents) || input.priceCents < 0)
    throw new Error("priceCents must be a non-negative integer");
  if (!Number.isInteger(input.day) || input.day < 1 || input.day > 67)
    throw new Error("day must be an integer in 1..67");
  if (!input.shipped || Number.isNaN(Date.parse(input.shipped)))
    throw new Error("shipped must be a valid date string");

  const path = input.path?.trim() || `/opt/67/${slug}.yaml`;
  if (path.length > 200) throw new Error("path exceeds 200 chars");

  const payload: ProjectPayload = {
    slug,
    name,
    path,
    priceCents: input.priceCents,
    currency: input.currency ?? "USD",
    tag: input.tag ?? "",
    category: categoryId,
    description,
    shipped: input.shipped,
    day: input.day,
    status: "draft",
  };

  const features = (input.features ?? []).map((t) => t.trim()).filter((t) => t.length > 0);
  if (features.length > 0) payload.features = features.map((text) => ({ text }));
  if (input.installSteps && input.installSteps.length > 0) payload.installSteps = buildLexical(input.installSteps);
  if (input.tree?.trim()) payload.tree = input.tree;

  return payload;
}
```

- [ ] **Step 4: Run to verify pass**

Run: `pnpm vitest run tests/unit/draft-authoring.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/draft-authoring.ts tests/unit/draft-authoring.test.ts
git commit -m "feat(draft-authoring): buildProjectPayload with validation"
```

---

## Task 4: `buildRepoPayload` — validated Repos payload

**Files:**
- Modify: `lib/draft-authoring.ts`
- Test: `tests/unit/draft-authoring.test.ts`

- [ ] **Step 1: Add the failing tests**

Append to `tests/unit/draft-authoring.test.ts`:

```ts
import { buildRepoPayload, type RepoInput } from "@/lib/draft-authoring";

const baseRepo: RepoInput = {
  name: "codehelm",
  owner: "bartek-filipiuk",
  description: "Local web UI for Claude Code CLI sessions.",
  lang: "TypeScript",
  license: "MIT LICENSE",
  starsCached: 42,
  starsCachedAt: "2026-05-31T00:00:00.000Z",
};

describe("buildRepoPayload", () => {
  it("forces published:false and passes fields through", () => {
    const r = buildRepoPayload(baseRepo);
    expect(r.published).toBe(false);
    expect(r.name).toBe("codehelm");
    expect(r.license).toBe("MIT LICENSE");
  });
  it("rejects description over 300 chars", () => {
    expect(() => buildRepoPayload({ ...baseRepo, description: "x".repeat(301) })).toThrow(/description/);
  });
  it("rejects a negative star count", () => {
    expect(() => buildRepoPayload({ ...baseRepo, starsCached: -3 })).toThrow(/starsCached/);
  });
  it("requires name, owner and lang", () => {
    expect(() => buildRepoPayload({ ...baseRepo, name: " " })).toThrow(/name/);
    expect(() => buildRepoPayload({ ...baseRepo, owner: "" })).toThrow(/owner/);
    expect(() => buildRepoPayload({ ...baseRepo, lang: "" })).toThrow(/lang/);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `pnpm vitest run tests/unit/draft-authoring.test.ts`
Expected: FAIL — `buildRepoPayload` / `RepoInput` not exported.

- [ ] **Step 3: Implement `buildRepoPayload`**

Append to `lib/draft-authoring.ts`:

```ts
export type RepoInput = {
  name: string;
  owner: string;
  description: string;
  lang: string;
  license: License;
  starsCached: number;
  starsCachedAt: string;
};

export type RepoPayload = RepoInput & { published: false };

/** Validates a RepoInput and produces a draft Repos payload (published:false). */
export function buildRepoPayload(input: RepoInput): RepoPayload {
  const name = input.name.trim();
  const owner = input.owner.trim();
  const description = input.description.trim();
  const lang = input.lang.trim();
  if (!name) throw new Error("repo name is required");
  if (!owner) throw new Error("repo owner is required");
  if (!description) throw new Error("repo description is required");
  if (description.length > 300) throw new Error("repo description exceeds 300 chars");
  if (!lang) throw new Error("repo lang is required");
  if (!Number.isInteger(input.starsCached) || input.starsCached < 0)
    throw new Error("starsCached must be a non-negative integer");
  return { name, owner, description, lang, license: input.license, starsCached: input.starsCached, starsCachedAt: input.starsCachedAt, published: false };
}
```

- [ ] **Step 4: Run to verify pass + full coverage**

Run: `pnpm vitest run tests/unit/draft-authoring.test.ts`
Expected: PASS.
Run: `pnpm test:coverage`
Expected: PASS — thresholds met; `lib/draft-authoring.ts` fully covered.

- [ ] **Step 5: Commit**

```bash
git add lib/draft-authoring.ts tests/unit/draft-authoring.test.ts
git commit -m "feat(draft-authoring): buildRepoPayload with validation"
```

---

## Task 5: `scripts/create-draft.ts` — the CLI

**Files:**
- Create: `scripts/create-draft.ts`
- Modify: `package.json:10-24` (scripts block)
- Modify: `.env.example`

This task has no unit test (I/O against a live API; `scripts/**` is outside the coverage gate). It is verified by `pnpm typecheck` and a manual smoke run.

- [ ] **Step 1: Write the CLI**

Create `scripts/create-draft.ts`:

```ts
import { readFileSync } from "node:fs";
import {
  buildProjectPayload,
  buildRepoPayload,
  mapLicense,
  LICENSES,
  type ProjectInput,
  type RepoInput,
  type License,
} from "../lib/draft-authoring";

type Args = { type?: string; file?: string; url?: string; description?: string; license?: string; force: boolean };

const API = (process.env.PROD_API_URL ?? "https://67projects.app").replace(/\/+$/, "");

function fail(msg: string): never {
  console.error(msg);
  process.exit(1);
}

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) fail(`Missing env ${name}. Add it to .env (see .env.example).`);
  return v;
}

function parseArgs(argv: string[]): Args {
  const a: Args = { force: false };
  for (let i = 0; i < argv.length; i++) {
    const t = argv[i];
    if (t === undefined) continue;
    if (t === "--type") a.type = argv[++i];
    else if (t === "--url") a.url = argv[++i];
    else if (t === "--description") a.description = argv[++i];
    else if (t === "--license") a.license = argv[++i];
    else if (t === "--force") a.force = true;
    else if (!t.startsWith("--")) a.file = t;
  }
  return a;
}

function authHeaders(token: string): Record<string, string> {
  return { "Content-Type": "application/json", Authorization: `JWT ${token}` };
}

async function login(): Promise<string> {
  const email = requireEnv("PROD_ADMIN_EMAIL");
  const password = requireEnv("PROD_ADMIN_PASSWORD");
  const res = await fetch(`${API}/api/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) fail(`Login failed: ${res.status} ${await res.text()}`);
  const json = (await res.json()) as { token?: string };
  if (!json.token) fail("Login succeeded but returned no token.");
  return json.token;
}

async function findExisting(token: string, collection: string, field: string, value: string): Promise<string | number | null> {
  const url = `${API}/api/${collection}?where[${field}][equals]=${encodeURIComponent(value)}&limit=1&depth=0`;
  const res = await fetch(url, { headers: authHeaders(token) });
  if (!res.ok) return null;
  const json = (await res.json()) as { docs?: { id: string | number }[] };
  return json.docs && json.docs.length > 0 ? json.docs[0]!.id : null;
}

async function resolveCategoryId(token: string, slug: string): Promise<string | number> {
  const id = await findExisting(token, "categories", "slug", slug);
  if (id === null) fail(`No category with slug "${slug}". Known: boilerplates, dev-tools, creator-economy.`);
  return id;
}

async function writeDoc(
  token: string,
  collection: string,
  data: unknown,
  existingId: string | number | null,
  force: boolean,
): Promise<{ id: string | number }> {
  const method = existingId && force ? "PATCH" : "POST";
  const url = existingId && force ? `${API}/api/${collection}/${existingId}` : `${API}/api/${collection}`;
  const res = await fetch(url, { method, headers: authHeaders(token), body: JSON.stringify(data) });
  const json = (await res.json()) as { doc?: { id: string | number } };
  if (!res.ok || !json.doc) fail(`${method} ${collection} failed: ${res.status}\n${JSON.stringify(json, null, 2)}`);
  return json.doc;
}

async function fetchRepo(url: string): Promise<RepoInput> {
  const m = url.replace(/\.git$/, "").match(/github\.com[/:]([^/]+)\/([^/#?]+)/);
  if (!m || !m[1] || !m[2]) fail(`Cannot parse a GitHub owner/repo from: ${url}`);
  const owner = m[1];
  const name = m[2];
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "67projects-create-draft",
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const res = await fetch(`https://api.github.com/repos/${owner}/${name}`, { headers });
  if (!res.ok) fail(`GitHub API ${res.status}: ${await res.text()}`);
  const r = (await res.json()) as {
    name: string;
    owner: { login: string };
    description: string | null;
    language: string | null;
    stargazers_count: number;
    license: { spdx_id: string | null } | null;
  };
  return {
    name: r.name,
    owner: r.owner.login,
    description: (r.description ?? "").slice(0, 300) || `${r.name} — open-source project by ${r.owner.login}.`,
    lang: r.language ?? "Unknown",
    license: mapLicense(r.license?.spdx_id),
    starsCached: r.stargazers_count,
    starsCachedAt: new Date().toISOString(),
  };
}

async function runProject(token: string, args: Args): Promise<void> {
  if (!args.file) fail("project mode needs a JSON file path: --type project <file.json>");
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const input = JSON.parse(readFileSync(args.file, "utf8")) as ProjectInput & { categorySlug: string };
  const categoryId = await resolveCategoryId(token, input.categorySlug);
  const payload = buildProjectPayload(input, categoryId);
  const existing = await findExisting(token, "projects", "slug", payload.slug);
  if (existing && !args.force) fail(`projects/${payload.slug} already exists (id ${existing}). Re-run with --force to update.`);
  const doc = await writeDoc(token, "projects", payload, existing, args.force);
  console.log(`✓ draft project saved (status:draft): ${API}/admin/collections/projects/${doc.id}`);
}

async function runRepo(token: string, args: Args): Promise<void> {
  if (!args.url) fail("repo mode needs a url: --type repo --url <github-url>");
  const input = await fetchRepo(args.url);
  if (args.description) input.description = args.description.slice(0, 300);
  if (args.license) {
    const up = args.license.toUpperCase();
    if (!LICENSES.includes(up as License)) fail(`Unknown license "${args.license}". One of: ${LICENSES.join(", ")}.`);
    input.license = up as License;
  }
  const payload = buildRepoPayload(input);
  const existing = await findExisting(token, "repos", "name", payload.name);
  if (existing && !args.force) fail(`repos/${payload.name} already exists (id ${existing}). Re-run with --force to update.`);
  const doc = await writeDoc(token, "repos", payload, existing, args.force);
  console.log(`✓ draft repo saved (published:false): ${API}/admin/collections/repos/${doc.id}`);
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const token = await login();
  if (args.type === "project") await runProject(token, args);
  else if (args.type === "repo") await runRepo(token, args);
  else fail("Usage: create-draft --type project <file.json> | --type repo --url <github-url> [--force] [--description <text>] [--license <enum>]");
}

main().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
```

- [ ] **Step 2: Add the package.json script**

In `package.json`, inside `"scripts"` (after the `create-admin` line), add:

```json
    "create-draft": "tsx --env-file=.env scripts/create-draft.ts",
```

- [ ] **Step 3: Document the new env vars**

Append to `.env.example`:

```bash

# CLI-only — used by scripts/create-draft.ts (the /add-project, /add-repo skills).
# NOT validated in lib/env.ts and never required to boot the app.
# Recommended: a dedicated automation@ admin account.
PROD_API_URL=https://67projects.app
PROD_ADMIN_EMAIL=automation@67projects.app
PROD_ADMIN_PASSWORD=
```

- [ ] **Step 4: Typecheck + lint**

Run: `pnpm typecheck`
Expected: PASS (no errors).
Run: `pnpm lint`
Expected: PASS (no errors).

- [ ] **Step 5: Commit**

```bash
git add scripts/create-draft.ts package.json .env.example
git commit -m "feat(scripts): create-draft CLI — prod REST draft writer for projects/repos"
```

---

## Task 6: `/add-project` skill

**Files:**
- Create: `.claude/skills/add-project/SKILL.md`

- [ ] **Step 1: Write the skill**

Create `.claude/skills/add-project/SKILL.md`:

```markdown
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
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/add-project/SKILL.md
git commit -m "feat(skill): /add-project — draft a Projects entry from a local dir"
```

---

## Task 7: `/add-repo` skill + final verification

**Files:**
- Create: `.claude/skills/add-repo/SKILL.md`

- [ ] **Step 1: Write the skill**

Create `.claude/skills/add-repo/SKILL.md`:

```markdown
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
```

- [ ] **Step 2: Full verification suite**

Run: `pnpm typecheck`
Expected: PASS.
Run: `pnpm lint`
Expected: PASS.
Run: `pnpm test`
Expected: PASS (all unit + integration).
Run: `pnpm test:coverage`
Expected: PASS — `lib/draft-authoring.ts` meets the 90/90/85/90 thresholds.

- [ ] **Step 3: Manual smoke test (requires `.env` with `PROD_ADMIN_*`)**

Add real `PROD_ADMIN_EMAIL` / `PROD_ADMIN_PASSWORD` to `.env` first, then:

```bash
# Repo path — least destructive, public data:
pnpm create-draft --type repo --url https://github.com/bartek-filipiuk/codehelm
```
Expected: prints `✓ draft repo saved (published:false): https://67projects.app/admin/collections/repos/<id>`.
Open the link, confirm fields, delete the test draft from `/admin` if undesired.

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/add-repo/SKILL.md
git commit -m "feat(skill): /add-repo — draft a Repos entry from a GitHub URL"
```

---

## Self-Review (completed during planning)

- **Spec coverage:** REST+login → Tasks 5; skill+CLI packaging → Tasks 5–7; interactive prompts for price/day/category/shipped → Task 6 step 4; two skills → Tasks 6–7; Lexical for installSteps → Task 2; secrets outside `lib/env.ts` → Task 5 steps 1+3; dedup with `--force` → Task 5 (`findExisting`/`writeDoc`); GitHub mapping + license fallback → Tasks 1 & 5; tests under coverage gate → Tasks 1–4. All spec sections map to a task.
- **Placeholder scan:** none — every code/test/command step is concrete.
- **Type consistency:** `ProjectInput`/`ProjectPayload`/`RepoInput`/`RepoPayload`/`License`/`LexicalState` defined in Tasks 1–4 and consumed unchanged by the CLI in Task 5. `findExisting`/`writeDoc`/`fetchRepo` signatures are used consistently. JSON keys in the `/add-project` skill match `ProjectInput` (+ `categorySlug`).
```
