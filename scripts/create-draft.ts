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
  if (!res.ok) fail(`Lookup ${collection}.${field} failed: ${res.status} ${await res.text()}`);
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
