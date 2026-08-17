import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { verifyStandardWebhook, WebhookVerificationError } from "@/server/auth/verify-webhook";

// Fixture independently computed (see scratch calc) for secret
// "v1,whsec_MfKQ9r8GKYqrTwjUPD8ILPZIo2LaLaSw==", id "msg_test123", the given
// body, at timestamp 1786951918 — verifies the implementation against a
// known-correct signature, not just against itself.
const SECRET = "v1,whsec_MfKQ9r8GKYqrTwjUPD8ILPZIo2LaLaSw==";
const ID = "msg_test123";
const TIMESTAMP = "1786951918";
const BODY = JSON.stringify({ hello: "world" });
const VALID_SIGNATURE = "v1,VYvnLw45Z/RP66mR4bEQw8eHRIlo6yIX156azcL2Thk=";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(Number(TIMESTAMP) * 1000));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("verifyStandardWebhook", () => {
  it("accepts a correctly signed payload", () => {
    expect(() =>
      verifyStandardWebhook({ secret: SECRET, id: ID, timestamp: TIMESTAMP, signature: VALID_SIGNATURE, body: BODY })
    ).not.toThrow();
  });

  it("accepts when the header carries multiple space-delimited candidates and one matches", () => {
    const signature = `v1,bm90LXRoZS1yaWdodC1zaWc= ${VALID_SIGNATURE}`;
    expect(() =>
      verifyStandardWebhook({ secret: SECRET, id: ID, timestamp: TIMESTAMP, signature, body: BODY })
    ).not.toThrow();
  });

  it("rejects a tampered body", () => {
    expect(() =>
      verifyStandardWebhook({
        secret: SECRET,
        id: ID,
        timestamp: TIMESTAMP,
        signature: VALID_SIGNATURE,
        body: JSON.stringify({ hello: "world!" }),
      })
    ).toThrow(WebhookVerificationError);
  });

  it("rejects a wrong secret", () => {
    expect(() =>
      verifyStandardWebhook({
        secret: "v1,whsec_totallyDifferentSecretValue123==",
        id: ID,
        timestamp: TIMESTAMP,
        signature: VALID_SIGNATURE,
        body: BODY,
      })
    ).toThrow(WebhookVerificationError);
  });

  it("rejects missing headers", () => {
    expect(() =>
      verifyStandardWebhook({ secret: SECRET, id: null, timestamp: TIMESTAMP, signature: VALID_SIGNATURE, body: BODY })
    ).toThrow("Missing webhook signature headers");
    expect(() =>
      verifyStandardWebhook({ secret: SECRET, id: ID, timestamp: null, signature: VALID_SIGNATURE, body: BODY })
    ).toThrow("Missing webhook signature headers");
    expect(() =>
      verifyStandardWebhook({ secret: SECRET, id: ID, timestamp: TIMESTAMP, signature: null, body: BODY })
    ).toThrow("Missing webhook signature headers");
  });

  it("rejects a non-numeric timestamp", () => {
    expect(() =>
      verifyStandardWebhook({ secret: SECRET, id: ID, timestamp: "not-a-number", signature: VALID_SIGNATURE, body: BODY })
    ).toThrow("Invalid webhook timestamp");
  });

  it("rejects a timestamp outside the allowed tolerance (replay protection)", () => {
    const oldTimestamp = String(Number(TIMESTAMP) - 10 * 60);
    expect(() =>
      verifyStandardWebhook({ secret: SECRET, id: ID, timestamp: oldTimestamp, signature: VALID_SIGNATURE, body: BODY })
    ).toThrow("Webhook timestamp outside allowed tolerance");
  });
});
