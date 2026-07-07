import { headers } from "next/headers";

import { rateLimiter } from "@/server/lib/rate-limit";

const TEN_MINUTES_MS = 10 * 60 * 1000;

// Behind Coolify/Traefik the real client IP arrives in x-forwarded-for.
// Falls back to a shared "unknown" bucket if absent (fails toward limiting).
async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return h.get("x-real-ip") ?? "unknown";
}

export type RateLimitCheck = { ok: true } | { ok: false; retryAfterSeconds: number };

// Per-IP, per-action throttle for public (unauthenticated) endpoints.
export async function checkRateLimit(
  action: string,
  { limit = 5, windowMs = TEN_MINUTES_MS }: { limit?: number; windowMs?: number } = {}
): Promise<RateLimitCheck> {
  const ip = await getClientIp();
  const result = rateLimiter(`${action}:${ip}`, limit, windowMs);
  if (result.ok) return { ok: true };
  return { ok: false, retryAfterSeconds: Math.ceil(result.retryAfterMs / 1000) };
}

// Human-friendly "try again in N minutes/seconds" phrasing for error messages.
export function retryAfterMessage(retryAfterSeconds: number): string {
  if (retryAfterSeconds >= 60) {
    const minutes = Math.ceil(retryAfterSeconds / 60);
    return `Please try again in about ${minutes} minute${minutes === 1 ? "" : "s"}.`;
  }
  return `Please try again in a few seconds.`;
}
