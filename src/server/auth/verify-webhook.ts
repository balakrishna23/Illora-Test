import { createHmac, timingSafeEqual } from "node:crypto";

// Verifies Supabase Auth Hook webhooks, which use the Standard Webhooks spec
// (the same scheme Svix designed): HMAC-SHA256 over "{id}.{timestamp}.{body}",
// keyed by the base64 portion of a "v1,whsec_<base64>" secret. Implemented
// directly rather than pulling in the `standardwebhooks` package — it's one
// HMAC computation, not worth a new dependency.
export class WebhookVerificationError extends Error {}

const MAX_TIMESTAMP_SKEW_SECONDS = 5 * 60;

export function verifyStandardWebhook(input: {
  secret: string;
  id: string | null;
  timestamp: string | null;
  signature: string | null;
  body: string;
}): void {
  const { secret, id, timestamp, signature, body } = input;

  if (!id || !timestamp || !signature) {
    throw new WebhookVerificationError("Missing webhook signature headers");
  }

  const timestampSeconds = Number(timestamp);
  if (!Number.isFinite(timestampSeconds)) {
    throw new WebhookVerificationError("Invalid webhook timestamp");
  }
  const skew = Math.abs(Date.now() / 1000 - timestampSeconds);
  if (skew > MAX_TIMESTAMP_SKEW_SECONDS) {
    throw new WebhookVerificationError("Webhook timestamp outside allowed tolerance");
  }

  const secretBytes = Buffer.from(secret.replace(/^v1,whsec_/, ""), "base64");
  const signedContent = `${id}.${timestamp}.${body}`;
  const expected = createHmac("sha256", secretBytes).update(signedContent).digest("base64");
  const expectedBytes = Buffer.from(expected);

  // The header can carry multiple space-delimited "v1,<sig>" candidates
  // (e.g. during secret rotation) — a match against any one is valid.
  // Compared as raw base64 strings (not decoded) on both sides — `expected`
  // is already base64-encoded, so this is a like-for-like comparison.
  const candidates = signature.split(" ").map((s) => s.replace(/^v1,/, ""));
  const matched = candidates.some((candidate) => {
    const candidateBytes = Buffer.from(candidate);
    return (
      candidateBytes.length === expectedBytes.length &&
      timingSafeEqual(candidateBytes, expectedBytes)
    );
  });

  if (!matched) {
    throw new WebhookVerificationError("Signature mismatch");
  }
}
