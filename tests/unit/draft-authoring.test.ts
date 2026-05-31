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
