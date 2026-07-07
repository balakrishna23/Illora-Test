import { describe, expect, it } from "vitest";

import { createRateLimiter } from "@/server/lib/rate-limit";

describe("createRateLimiter", () => {
  it("allows requests up to the limit, then blocks", () => {
    const check = createRateLimiter();
    const now = 1_000_000;

    expect(check("a", 3, 10_000, now).ok).toBe(true);
    expect(check("a", 3, 10_000, now).ok).toBe(true);
    expect(check("a", 3, 10_000, now).ok).toBe(true);

    const blocked = check("a", 3, 10_000, now);
    expect(blocked.ok).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterMs).toBe(10_000);
  });

  it("resets after the window elapses", () => {
    const check = createRateLimiter();
    const start = 1_000_000;

    check("b", 1, 10_000, start);
    expect(check("b", 1, 10_000, start).ok).toBe(false);

    // Just before the window closes: still blocked.
    expect(check("b", 1, 10_000, start + 9_999).ok).toBe(false);
    // At/after reset: allowed again.
    expect(check("b", 1, 10_000, start + 10_000).ok).toBe(true);
  });

  it("tracks keys independently", () => {
    const check = createRateLimiter();
    const now = 1_000_000;

    check("user-1", 1, 10_000, now);
    expect(check("user-1", 1, 10_000, now).ok).toBe(false);
    // A different key is unaffected.
    expect(check("user-2", 1, 10_000, now).ok).toBe(true);
  });

  it("reports remaining count", () => {
    const check = createRateLimiter();
    const now = 1_000_000;

    expect(check("c", 3, 10_000, now).remaining).toBe(2);
    expect(check("c", 3, 10_000, now).remaining).toBe(1);
    expect(check("c", 3, 10_000, now).remaining).toBe(0);
  });
});
