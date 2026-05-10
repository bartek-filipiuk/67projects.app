import { describe, it, expect } from "vitest";
import { contactSchema, slugSchema, githubRepoSchema } from "@/lib/validators";

describe("contactSchema", () => {
  it("accepts valid", () => {
    const r = contactSchema.safeParse({ name: "Ada", message: "hello there friend", honeypot: "" });
    expect(r.success).toBe(true);
  });
  it("rejects empty message", () => {
    expect(contactSchema.safeParse({ name: "A", message: "", honeypot: "" }).success).toBe(false);
  });
  it("rejects too-long message", () => {
    expect(contactSchema.safeParse({ name: "A", message: "x".repeat(2001), honeypot: "" }).success).toBe(false);
  });
  it("rejects honeypot set", () => {
    const r = contactSchema.safeParse({ name: "A", message: "hello there friend", honeypot: "bot" });
    expect(r.success).toBe(false);
  });
  it("rejects too-short message", () => {
    expect(contactSchema.safeParse({ name: "A", message: "short", honeypot: "" }).success).toBe(false);
  });
});

describe("slugSchema", () => {
  it("accepts kebab-case", () => { expect(slugSchema.safeParse("mini-saas").success).toBe(true); });
  it("rejects uppercase", () => { expect(slugSchema.safeParse("MiniSaaS").success).toBe(false); });
  it("rejects path traversal", () => { expect(slugSchema.safeParse("../etc").success).toBe(false); });
  it("rejects trailing dash", () => { expect(slugSchema.safeParse("a-").success).toBe(false); });
});

describe("githubRepoSchema", () => {
  it("accepts owner/repo", () => {
    expect(githubRepoSchema.safeParse({ owner: "bartek-filipiuk", repo: "codehelm" }).success).toBe(true);
  });
  it("rejects invalid chars", () => {
    expect(githubRepoSchema.safeParse({ owner: "../x", repo: "y" }).success).toBe(false);
  });
});
