import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { sendContactMessage } from "@/features/contact/actions";
import { checkRateLimit } from "@/server/lib/rate-limit-guard";
import { sendContactConfirmationEmail } from "@/server/integrations/resend";

const insertValues = vi.fn();
vi.mock("@/server/db/client", () => ({
  db: { insert: vi.fn(() => ({ values: insertValues })) },
}));
vi.mock("@/server/lib/rate-limit-guard", () => ({
  checkRateLimit: vi.fn(),
  retryAfterMessage: () => "Please try again later.",
}));
vi.mock("@/server/integrations/resend", () => ({
  sendContactConfirmationEmail: vi.fn(),
}));

function contactFormData(overrides: Record<string, string> = {}): FormData {
  const fd = new FormData();
  const defaults: Record<string, string> = {
    name: "Jane Enquirer",
    email: "jane@example.com",
    phone: "0400000000",
    subject: "General Enquiry",
    message: "I'd like to know more about your services.",
    marketingConsent: "on",
  };
  for (const [key, value] of Object.entries({ ...defaults, ...overrides })) {
    fd.set(key, value);
  }
  return fd;
}

describe("sendContactMessage", () => {
  beforeEach(() => {
    vi.mocked(checkRateLimit).mockResolvedValue({ ok: true });
    vi.mocked(sendContactConfirmationEmail).mockResolvedValue({ success: true });
    insertValues.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("silently accepts a bot submission without touching rate limiting or the db", async () => {
    const fd = contactFormData({ contactFax: "http://spam.example" });

    const result = await sendContactMessage(null, fd);

    expect(result).toEqual({ success: true });
    expect(checkRateLimit).not.toHaveBeenCalled();
    expect(insertValues).not.toHaveBeenCalled();
  });

  it("rejects when rate limited", async () => {
    vi.mocked(checkRateLimit).mockResolvedValue({ ok: false, retryAfterSeconds: 30 });

    const result = await sendContactMessage(null, contactFormData());

    expect(result.success).toBe(false);
    expect(insertValues).not.toHaveBeenCalled();
  });

  it("returns field errors for invalid input", async () => {
    const result = await sendContactMessage(null, contactFormData({ email: "not-an-email" }));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.fieldErrors?.email).toBeDefined();
    }
  });

  it("rejects a subject outside the known enum", async () => {
    const result = await sendContactMessage(null, contactFormData({ subject: "Not A Real Subject" }));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.fieldErrors?.subject).toBeDefined();
    }
  });

  it("saves the message and sends a confirmation email", async () => {
    const result = await sendContactMessage(null, contactFormData());

    expect(result).toEqual({ success: true });
    expect(insertValues).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Jane Enquirer", email: "jane@example.com" })
    );
    expect(sendContactConfirmationEmail).toHaveBeenCalledWith({
      to: "jane@example.com",
      name: "Jane Enquirer",
      subject: "General Enquiry",
    });
  });

  it("still succeeds when the confirmation email fails to send (non-fatal)", async () => {
    vi.mocked(sendContactConfirmationEmail).mockRejectedValue(new Error("resend down"));

    const result = await sendContactMessage(null, contactFormData());

    expect(result).toEqual({ success: true });
  });
});
