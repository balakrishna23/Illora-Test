import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createUnsubscribeToken,
  verifyUnsubscribeToken,
} from "@/server/lib/unsubscribe-token";

describe("unsubscribe tokens", () => {
  beforeEach(() => {
    vi.stubEnv("CAMPAIGN_UNSUBSCRIBE_SECRET", "test-secret");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("round-trips a valid token", () => {
    const token = createUnsubscribeToken("sam@example.com");
    expect(verifyUnsubscribeToken("sam@example.com", token)).toBe(true);
  });

  it("is case- and whitespace-insensitive on the email", () => {
    const token = createUnsubscribeToken("Sam@Example.com ");
    expect(verifyUnsubscribeToken("sam@example.com", token)).toBe(true);
  });

  it("rejects a token issued for a different email", () => {
    const token = createUnsubscribeToken("sam@example.com");
    expect(verifyUnsubscribeToken("other@example.com", token)).toBe(false);
  });

  it("rejects malformed or truncated tokens", () => {
    expect(verifyUnsubscribeToken("sam@example.com", "not-hex")).toBe(false);
    expect(verifyUnsubscribeToken("sam@example.com", "abc123")).toBe(false);
    expect(verifyUnsubscribeToken("sam@example.com", "")).toBe(false);
  });

  it("refuses to verify when the secret is not configured", () => {
    const token = createUnsubscribeToken("sam@example.com");
    vi.stubEnv("CAMPAIGN_UNSUBSCRIBE_SECRET", "");
    expect(verifyUnsubscribeToken("sam@example.com", token)).toBe(false);
  });

  it("throws when creating a token without a secret", () => {
    vi.stubEnv("CAMPAIGN_UNSUBSCRIBE_SECRET", "");
    expect(() => createUnsubscribeToken("sam@example.com")).toThrow();
  });
});
