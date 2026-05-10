import { describe, it, expect } from "vitest";
import { hashIp, getClientIp } from "@/lib/ip";

describe("hashIp", () => {
  it("produces 64-hex digest", () => {
    expect(hashIp("1.2.3.4")).toMatch(/^[0-9a-f]{64}$/);
  });
  it("is deterministic for same day", () => {
    const day = new Date("2026-05-10T12:00:00Z");
    expect(hashIp("1.2.3.4", day)).toBe(hashIp("1.2.3.4", day));
  });
  it("differs across IPs", () => {
    expect(hashIp("1.2.3.4")).not.toBe(hashIp("5.6.7.8"));
  });
  it("differs across days", () => {
    const d1 = new Date("2026-05-10T12:00:00Z");
    const d2 = new Date("2026-05-11T12:00:00Z");
    expect(hashIp("1.2.3.4", d1)).not.toBe(hashIp("1.2.3.4", d2));
  });
});

describe("getClientIp", () => {
  it("uses X-Forwarded-For when trustProxy", () => {
    const headers = new Headers({ "x-forwarded-for": "10.0.0.1, 10.0.0.2" });
    expect(getClientIp(headers, true)).toBe("10.0.0.1");
  });
  it("ignores X-Forwarded-For when not trustProxy", () => {
    const headers = new Headers({ "x-forwarded-for": "10.0.0.1" });
    expect(getClientIp(headers, false)).toBe("0.0.0.0");
  });
  it("falls back to 0.0.0.0", () => {
    expect(getClientIp(new Headers(), true)).toBe("0.0.0.0");
  });
  it("uses x-real-ip as fallback", () => {
    const headers = new Headers({ "x-real-ip": "10.0.0.5" });
    expect(getClientIp(headers, true)).toBe("10.0.0.5");
  });
});
