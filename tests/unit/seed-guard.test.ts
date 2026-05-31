import { describe, it, expect } from "vitest";
import { shouldInitializeSiteSettings } from "@/lib/seed-guard";

describe("shouldInitializeSiteSettings", () => {
  it("initializes when the global was never persisted (Payload returns {})", () => {
    expect(shouldInitializeSiteSettings({})).toBe(true);
  });

  it("initializes when the global is null/undefined", () => {
    expect(shouldInitializeSiteSettings(null)).toBe(true);
    expect(shouldInitializeSiteSettings(undefined)).toBe(true);
  });

  it("does NOT initialize once the global has an updatedAt (saved by seed or admin)", () => {
    expect(shouldInitializeSiteSettings({ updatedAt: "2026-05-31T10:00:00.000Z" })).toBe(false);
  });

  // Regression for the deploy-overwrite bug: a populated global with revenue 0
  // (the steady state until Stripe is wired) must NOT be re-seeded.
  it("does NOT initialize a persisted global just because revenue is 0", () => {
    const persistedZeroRevenue = { updatedAt: "2026-05-31T10:00:00.000Z", totalRevenueCents: 0 };
    expect(shouldInitializeSiteSettings(persistedZeroRevenue)).toBe(false);
  });

  it("treats a falsy updatedAt as not-yet-persisted", () => {
    expect(shouldInitializeSiteSettings({ updatedAt: null })).toBe(true);
    expect(shouldInitializeSiteSettings({ updatedAt: "" })).toBe(true);
  });
});
