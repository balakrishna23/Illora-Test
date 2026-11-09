import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "@/app/api/auth/send-email/route";
import { verifyStandardWebhook, WebhookVerificationError } from "@/server/auth/verify-webhook";
import { sendAuthHookEmail } from "@/server/integrations/resend";

vi.mock("@/server/auth/verify-webhook", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/server/auth/verify-webhook")>();
  return { ...actual, verifyStandardWebhook: vi.fn() };
});
vi.mock("@/server/integrations/resend", () => ({ sendAuthHookEmail: vi.fn() }));

function request(body: string, headers: Record<string, string> = {}): Request {
  return new Request("https://illouraservices.com/api/auth/send-email", {
    method: "POST",
    headers: { "webhook-id": "id1", "webhook-timestamp": "123", "webhook-signature": "v1,sig", ...headers },
    body,
  });
}

const VALID_PAYLOAD = JSON.stringify({
  user: { email: "jane@example.com" },
  email_data: { token_hash: "th_abc", redirect_to: "https://illouraservices.com/portal", email_action_type: "signup" },
});

describe("POST /api/auth/send-email", () => {
  beforeEach(() => {
    vi.stubEnv("SEND_EMAIL_HOOK_SECRET", "v1,whsec_test");
    vi.mocked(verifyStandardWebhook).mockReturnValue(undefined);
    vi.mocked(sendAuthHookEmail).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it("fails closed with 500 when the hook secret is unset", async () => {
    vi.stubEnv("SEND_EMAIL_HOOK_SECRET", "");

    const res = await POST(request(VALID_PAYLOAD));

    expect(res.status).toBe(500);
    expect(verifyStandardWebhook).not.toHaveBeenCalled();
    expect(sendAuthHookEmail).not.toHaveBeenCalled();
  });

  it("returns 401 when signature verification fails, without attempting to send", async () => {
    vi.mocked(verifyStandardWebhook).mockImplementation(() => {
      throw new WebhookVerificationError("Signature mismatch");
    });

    const res = await POST(request(VALID_PAYLOAD));
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error.message).toBe("Signature mismatch");
    expect(sendAuthHookEmail).not.toHaveBeenCalled();
  });

  it("passes the exact headers and raw body to the verifier", async () => {
    await POST(request(VALID_PAYLOAD, { "webhook-id": "custom-id", "webhook-timestamp": "999", "webhook-signature": "v1,xyz" }));

    expect(verifyStandardWebhook).toHaveBeenCalledWith({
      secret: "v1,whsec_test",
      id: "custom-id",
      timestamp: "999",
      signature: "v1,xyz",
      body: VALID_PAYLOAD,
    });
  });

  it("returns 400 for a body that isn't valid JSON", async () => {
    const res = await POST(request("not json"));

    expect(res.status).toBe(400);
    expect(sendAuthHookEmail).not.toHaveBeenCalled();
  });

  it("sends the email and returns 200 with an empty body on success", async () => {
    const res = await POST(request(VALID_PAYLOAD));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({});
    expect(sendAuthHookEmail).toHaveBeenCalledWith(JSON.parse(VALID_PAYLOAD));
  });

  it("returns 500 when the underlying send fails", async () => {
    vi.mocked(sendAuthHookEmail).mockRejectedValue(new Error("Resend rejected the send"));

    const res = await POST(request(VALID_PAYLOAD));

    expect(res.status).toBe(500);
  });
});
