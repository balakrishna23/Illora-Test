import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { subscribeToJobAlert, unsubscribeFromJobAlert } from "@/features/job-alerts/actions";
import { createJobAlert, unsubscribeJobAlert } from "@/features/job-alerts/queries";
import { checkRateLimit } from "@/server/lib/rate-limit-guard";

vi.mock("@/server/db/client", () => ({ db: {} }));
vi.mock("@/features/job-alerts/queries", () => ({
  createJobAlert: vi.fn(),
  unsubscribeJobAlert: vi.fn(),
}));
vi.mock("@/server/lib/rate-limit-guard", () => ({
  checkRateLimit: vi.fn(),
  retryAfterMessage: () => "Please try again later.",
}));

function formData(overrides: Record<string, string> = {}): FormData {
  const fd = new FormData();
  const defaults: Record<string, string> = { email: "jane@example.com" };
  for (const [key, value] of Object.entries({ ...defaults, ...overrides })) {
    fd.set(key, value);
  }
  return fd;
}

describe("subscribeToJobAlert", () => {
  beforeEach(() => {
    vi.mocked(checkRateLimit).mockResolvedValue({ ok: true });
    vi.mocked(createJobAlert).mockResolvedValue({} as never);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("silently accepts a bot submission without persisting", async () => {
    const fd = formData({ contactFax: "http://spam.example" });

    const result = await subscribeToJobAlert(null, fd);

    expect(result).toEqual({ success: true });
    expect(checkRateLimit).not.toHaveBeenCalled();
    expect(createJobAlert).not.toHaveBeenCalled();
  });

  it("rejects when rate limited", async () => {
    vi.mocked(checkRateLimit).mockResolvedValue({ ok: false, retryAfterSeconds: 30 });

    const result = await subscribeToJobAlert(null, formData());

    expect(result.success).toBe(false);
    expect(createJobAlert).not.toHaveBeenCalled();
  });

  it("returns a field error for an invalid email", async () => {
    const result = await subscribeToJobAlert(null, formData({ email: "not-an-email" }));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.fieldErrors?.email).toBeDefined();
    }
  });

  it("allows all criteria fields to be omitted (email-only alert)", async () => {
    const result = await subscribeToJobAlert(null, formData());

    expect(result).toEqual({ success: true });
    expect(createJobAlert).toHaveBeenCalledWith(
      expect.objectContaining({ email: "jane@example.com" })
    );
  });

  it("rejects an industry outside the known taxonomy", async () => {
    const result = await subscribeToJobAlert(null, formData({ industry: "Not A Real Industry" }));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.fieldErrors?.industry).toBeDefined();
    }
  });

  it("creates the alert with full criteria when provided", async () => {
    const result = await subscribeToJobAlert(
      null,
      formData({ industry: "ICT", state: "NSW", jobType: "Permanent", keyword: "engineer" })
    );

    expect(result).toEqual({ success: true });
    expect(createJobAlert).toHaveBeenCalledWith({
      email: "jane@example.com",
      industry: "ICT",
      state: "NSW",
      jobType: "Permanent",
      keyword: "engineer",
    });
  });
});

describe("unsubscribeFromJobAlert", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns success true when a matching active alert is found and unsubscribed", async () => {
    vi.mocked(unsubscribeJobAlert).mockResolvedValue(true);

    const result = await unsubscribeFromJobAlert("valid-token");

    expect(result).toEqual({ success: true });
    expect(unsubscribeJobAlert).toHaveBeenCalledWith("valid-token");
  });

  it("returns success false for an unknown or already-unsubscribed token", async () => {
    vi.mocked(unsubscribeJobAlert).mockResolvedValue(false);

    const result = await unsubscribeFromJobAlert("bogus-token");

    expect(result).toEqual({ success: false });
  });
});
