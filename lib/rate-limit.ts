import { LRUCache } from "lru-cache";

interface Bucket { tokens: number; lastRefillMs: number; }
interface TakeResult { ok: boolean; remaining: number; retryAfterMs?: number; }
interface Options { capacity: number; refillPerSec: number; maxKeys?: number; ttlMs?: number; }

export function createRateLimiter({ capacity, refillPerSec, maxKeys = 10_000, ttlMs = 3_600_000 }: Options) {
  const cache = new LRUCache<string, Bucket>({ max: maxKeys, ttl: ttlMs });

  const refill = (b: Bucket): Bucket => {
    if (refillPerSec <= 0) return b;
    const now = Date.now();
    const elapsed = (now - b.lastRefillMs) / 1000;
    const added = elapsed * refillPerSec;
    return { tokens: Math.min(capacity, b.tokens + added), lastRefillMs: now };
  };

  return {
    take(key: string): TakeResult {
      const existing = cache.get(key) ?? { tokens: capacity, lastRefillMs: Date.now() };
      const refreshed = refill(existing);
      if (refreshed.tokens >= 1) {
        const next = { ...refreshed, tokens: refreshed.tokens - 1 };
        cache.set(key, next);
        return { ok: true, remaining: Math.floor(next.tokens) };
      }
      cache.set(key, refreshed);
      const deficit = 1 - refreshed.tokens;
      const retryAfterMs = refillPerSec > 0 ? Math.ceil((deficit / refillPerSec) * 1000) : 60_000;
      return { ok: false, remaining: 0, retryAfterMs };
    },
  };
}

export const contactLimiter = createRateLimiter({ capacity: 5, refillPerSec: 5 / 3600 });
export const githubLimiter = createRateLimiter({ capacity: 60, refillPerSec: 60 / 60 });
