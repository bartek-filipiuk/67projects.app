import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createRateLimiter } from "@/lib/rate-limit";

describe("createRateLimiter", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("allows up to capacity, then denies", () => {
    const rl = createRateLimiter({ capacity: 3, refillPerSec: 0 });
    expect(rl.take("k1").ok).toBe(true);
    expect(rl.take("k1").ok).toBe(true);
    expect(rl.take("k1").ok).toBe(true);
    const denied = rl.take("k1");
    expect(denied.ok).toBe(false);
    expect(denied.retryAfterMs).toBeGreaterThanOrEqual(0);
  });

  it("refills over time", () => {
    const rl = createRateLimiter({ capacity: 2, refillPerSec: 1 });
    rl.take("k"); rl.take("k");
    expect(rl.take("k").ok).toBe(false);
    vi.advanceTimersByTime(1100);
    expect(rl.take("k").ok).toBe(true);
  });

  it("isolates keys", () => {
    const rl = createRateLimiter({ capacity: 1, refillPerSec: 0 });
    expect(rl.take("a").ok).toBe(true);
    expect(rl.take("b").ok).toBe(true);
    expect(rl.take("a").ok).toBe(false);
  });
});
