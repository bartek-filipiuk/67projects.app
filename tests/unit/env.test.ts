import { describe, it, expect, beforeEach, afterAll, vi } from "vitest";

const ORIGINAL = { ...process.env };

describe("env", () => {
  beforeEach(() => { vi.resetModules(); });
  afterAll(() => { Object.assign(process.env, ORIGINAL); });

  it("loads required vars in test", async () => {
    const { env } = await import("@/lib/env");
    expect(env.PAYLOAD_SECRET.length).toBeGreaterThanOrEqual(32);
    expect(env.NEXT_PUBLIC_SERVER_URL).toMatch(/^https?:\/\//);
  });

  it("throws if PAYLOAD_SECRET shorter than 32", async () => {
    process.env.PAYLOAD_SECRET = "too-short";
    vi.resetModules();
    await expect(async () => {
      await import("@/lib/env");
    }).rejects.toThrow(/PAYLOAD_SECRET/);
    process.env.PAYLOAD_SECRET = "test-secret-32-bytes-aaaaaaaaaaaa";
  });
});
