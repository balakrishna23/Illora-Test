import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "@/app/auth/confirm/route";
import { createSupabaseServerClient } from "@/server/auth/supabase-server";

const verifyOtp = vi.hoisted(() => vi.fn());

vi.mock("@/server/auth/supabase-server", () => ({
  createSupabaseServerClient: vi.fn(),
}));

function request(query: string): Request {
  return new Request(`https://illouraservices.com/auth/confirm${query}`);
}

describe("GET /auth/confirm", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://illouraservices.com");
    vi.mocked(createSupabaseServerClient).mockResolvedValue({
      auth: { verifyOtp },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    verifyOtp.mockResolvedValue({ error: null });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it("redirects to sign-in with an error when token_hash is missing", async () => {
    const res = await GET(request("?type=signup&next=https://illouraservices.com/portal"));

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("https://illouraservices.com/sign-in?error=invalid_link");
    expect(verifyOtp).not.toHaveBeenCalled();
  });

  it("redirects to sign-in with an error when type is missing", async () => {
    const res = await GET(request("?token_hash=abc&next=https://illouraservices.com/portal"));

    expect(res.headers.get("location")).toBe("https://illouraservices.com/sign-in?error=invalid_link");
    expect(verifyOtp).not.toHaveBeenCalled();
  });

  it("redirects to sign-in with an error when type isn't a recognized EmailOtpType", async () => {
    const res = await GET(request("?token_hash=abc&type=not-a-real-type&next=https://illouraservices.com/portal"));

    expect(res.headers.get("location")).toBe("https://illouraservices.com/sign-in?error=invalid_link");
    expect(verifyOtp).not.toHaveBeenCalled();
  });

  it("calls verifyOtp with token_hash and type, then redirects to next on success", async () => {
    const res = await GET(request("?token_hash=th_123&type=recovery&next=https://illouraservices.com/reset-password"));

    expect(verifyOtp).toHaveBeenCalledWith({ token_hash: "th_123", type: "recovery" });
    expect(res.headers.get("location")).toBe("https://illouraservices.com/reset-password");
  });

  it("redirects to sign-in with an error when verifyOtp fails (expired/used token)", async () => {
    verifyOtp.mockResolvedValue({ error: { name: "AuthApiError", status: 403, message: "Token has expired" } });

    const res = await GET(request("?token_hash=th_123&type=recovery&next=https://illouraservices.com/reset-password"));

    expect(res.headers.get("location")).toBe("https://illouraservices.com/sign-in?error=confirmation_failed");
  });

  it("falls back to /portal when next is missing", async () => {
    const res = await GET(request("?token_hash=th_123&type=signup"));

    expect(res.headers.get("location")).toBe("https://illouraservices.com/portal");
  });

  it("falls back to /portal when next points off-site (open-redirect guard)", async () => {
    const res = await GET(request("?token_hash=th_123&type=signup&next=https://evil.example.com/phish"));

    expect(res.headers.get("location")).toBe("https://illouraservices.com/portal");
  });
});
