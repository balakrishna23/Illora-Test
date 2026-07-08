import { createHmac, timingSafeEqual } from "node:crypto";

// Stateless unsubscribe tokens: HMAC of the lowercased email, so links keep
// working without storing a token per recipient. Rotating the secret
// invalidates all previously sent links.
function getSecret(): string {
  const secret = process.env.CAMPAIGN_UNSUBSCRIBE_SECRET;
  if (!secret) {
    throw new Error("CAMPAIGN_UNSUBSCRIBE_SECRET is not set");
  }
  return secret;
}

export function createUnsubscribeToken(email: string): string {
  return createHmac("sha256", getSecret()).update(email.trim().toLowerCase()).digest("hex");
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
  if (!process.env.CAMPAIGN_UNSUBSCRIBE_SECRET) return false;

  const expected = Buffer.from(createUnsubscribeToken(email), "hex");
  let given: Buffer;
  try {
    given = Buffer.from(token, "hex");
  } catch {
    return false;
  }
  if (given.length !== expected.length) return false;

  return timingSafeEqual(expected, given);
}
