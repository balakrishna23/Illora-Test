// In-memory fixed-window rate limiter. Suitable for a single long-lived
// server process (our Coolify VPS deploy) — NOT for multi-instance/serverless,
// where a shared store (Redis/Upstash) would be needed instead. State is
// process-local and resets on restart, which is acceptable for abuse throttling.

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfterMs: number;
};

export function createRateLimiter() {
  const hits = new Map<string, { count: number; resetAt: number }>();

  return function check(
    key: string,
    limit: number,
    windowMs: number,
    now: number = Date.now()
  ): RateLimitResult {
    // Opportunistic cleanup so distinct-key growth stays bounded.
    if (hits.size > 5000) {
      for (const [k, v] of hits) {
        if (now >= v.resetAt) hits.delete(k);
      }
    }

    const entry = hits.get(key);
    if (!entry || now >= entry.resetAt) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return { ok: true, remaining: limit - 1, retryAfterMs: 0 };
    }

    if (entry.count >= limit) {
      return { ok: false, remaining: 0, retryAfterMs: entry.resetAt - now };
    }

    entry.count += 1;
    return { ok: true, remaining: limit - entry.count, retryAfterMs: 0 };
  };
}

// Shared singleton, cached on globalThis so dev HMR reloads don't spawn a new
// limiter (and lose the counts) on every file save.
const globalForRateLimit = globalThis as unknown as {
  rateLimiter?: ReturnType<typeof createRateLimiter>;
};

export const rateLimiter = globalForRateLimit.rateLimiter ?? createRateLimiter();

if (process.env.NODE_ENV !== "production") {
  globalForRateLimit.rateLimiter = rateLimiter;
}
