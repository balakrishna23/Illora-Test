import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { requestCapabilityStatement } from "@/features/about/actions";
import { checkRateLimit } from "@/server/lib/rate-limit-guard";
import { sendCapabilityStatementEmail } from "@/server/integrations/resend";

vi.mock("@/server/lib/rate-limit-guard", () => ({
  checkRateLimit: vi.fn(),
  retryAfterMessage: () => "Please try again later.",
}));
vi.mock("@/server/integrations/resend", () => ({
  sendCapabilityStatementEmail: vi.fn(),
}));

function formData(overrides: Record<string, string> = {}): FormData {
  const fd = new FormData();
  const defaults: Record<string, string> = { name: "Jane Curious", email: "jane@example.com" };
  for (const [key, value] of Object.entries({ ...defaults, ...overrides })) {
    fd.set(key, value);
  }
  return fd;
}

describe("requestCapabilityStatement", () => {
  beforeEach(() => {
    vi.mocked(checkRateLimit).mockResolvedValue({ ok: true });
    vi.mocked(sendCapabilityStatementEmail).mockResolvedValue({ success: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("silently accepts a bot submission without sending an email", async () => {
    const fd = formData({ contactFax: "http://spam.example" });

    const result = await requestCapabilityStatement(null, fd);

    expect(result).toEqual({ success: true });
    expect(checkRateLimit).not.toHaveBeenCalled();
    expect(sendCapabilityStatementEmail).not.toHaveBeenCalled();
  });

  it("rejects when rate limited", async () => {
    vi.mocked(checkRateLimit).mockResolvedValue({ ok: false, retryAfterSeconds: 30 });

    const result = await requestCapabilityStatement(null, formData());

    expect(result.success).toBe(false);
    expect(sendCapabilityStatementEmail).not.toHaveBeenCalled();
  });

  it("rejects invalid input without sending", async () => {
    const result = await requestCapabilityStatement(null, formData({ email: "not-an-email" }));

    expect(result).toEqual({ success: false, error: "Please provide a valid name and email." });
    expect(sendCapabilityStatementEmail).not.toHaveBeenCalled();
  });

  it("sends the capability statement email on success", async () => {
    const result = await requestCapabilityStatement(null, formData());

    expect(result).toEqual({ success: true });
    expect(sendCapabilityStatementEmail).toHaveBeenCalledWith({
      to: "jane@example.com",
      name: "Jane Curious",
    });
  });

  it("returns a typed error when the email send fails (unlike other forms, this one IS the deliverable)", async () => {
    vi.mocked(sendCapabilityStatementEmail).mockResolvedValue({ success: false });

    const result = await requestCapabilityStatement(null, formData());

    expect(result).toEqual({
      success: false,
      error: "Could not send the email. Please try again shortly.",
    });
  });
});
