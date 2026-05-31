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
