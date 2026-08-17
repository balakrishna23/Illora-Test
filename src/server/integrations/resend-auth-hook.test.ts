import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { sendAuthHookEmail, type SendEmailHookPayload } from "@/server/integrations/resend";

const send = vi.hoisted(() => vi.fn());

vi.mock("resend", () => ({
  Resend: class {
    emails = { send };
  },
}));

function payload(overrides: Partial<SendEmailHookPayload["email_data"]> = {}): SendEmailHookPayload {
  return {
    user: { email: "jane@example.com" },
    email_data: {
      token_hash: "th_abc123",
      redirect_to: "https://illouraservices.com/portal",
      email_action_type: "signup",
      ...overrides,
    },
  };
}

describe("sendAuthHookEmail", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://illouraservices.com");
    send.mockResolvedValue({ data: { id: "email-1" }, error: null });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it("builds a verify link against this app's own /auth/confirm route, not Supabase's project domain", async () => {
    await sendAuthHookEmail(payload());

    const call = send.mock.calls[0][0];
    expect(call.to).toBe("jane@example.com");
    expect(call.html).toContain(
      "https://illouraservices.com/auth/confirm?token_hash=th_abc123&type=signup&next=https%3A%2F%2Fillouraservices.com%2Fportal"
    );
  });

  it("sends a signup-specific subject for the signup action type", async () => {
    await sendAuthHookEmail(payload({ email_action_type: "signup" }));

    expect(send.mock.calls[0][0].subject).toBe("Confirm your account — Illora");
  });

  it("sends an email-change-specific subject for the email_change action type", async () => {
    await sendAuthHookEmail(payload({ email_action_type: "email_change" }));

    expect(send.mock.calls[0][0].subject).toBe("Confirm your new email — Illora");
  });

  it("sends a recovery-specific subject for the recovery action type", async () => {
    await sendAuthHookEmail(payload({ email_action_type: "recovery" }));

    expect(send.mock.calls[0][0].subject).toBe("Reset your password — Illora");
  });

  it("falls back to a generic template for an unhandled action type instead of erroring", async () => {
    await sendAuthHookEmail(payload({ email_action_type: "magiclink" }));

    expect(send).toHaveBeenCalled();
    expect(send.mock.calls[0][0].subject).toBe("Action required — Illora");
  });

  it("throws when Resend rejects the send, so the caller (route handler) can surface a failure", async () => {
    send.mockResolvedValue({ data: null, error: { name: "validation_error", message: "bad address" } });

    await expect(sendAuthHookEmail(payload())).rejects.toThrow(/bad address/);
  });
});
