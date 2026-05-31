import { describe, it, expect } from "vitest";
import {
  slugify,
  mapLicense,
  buildLexical,
  buildProjectPayload,
  type ProjectInput,
} from "@/lib/draft-authoring";

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
