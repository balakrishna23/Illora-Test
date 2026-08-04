import { afterEach, describe, expect, it, vi } from "vitest";

import { requireUser, getSessionUser, isAdminEmail, requireAdmin } from "@/server/auth/session";
import { createSupabaseServerClient } from "@/server/auth/supabase-server";

vi.mock("@/server/auth/supabase-server", () => ({
  createSupabaseServerClient: vi.fn(),
}));

function mockSupabaseClient(overrides: {
  getUser?: unknown;
  getSession?: unknown;
}) {
  vi.mocked(createSupabaseServerClient).mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue(overrides.getUser ?? { data: { user: null }, error: null }),
      getSession: vi
        .fn()
        .mockResolvedValue(overrides.getSession ?? { data: { session: null } }),
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);
}

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

describe("requireUser", () => {
  it("fails when there's no authenticated user", async () => {
    mockSupabaseClient({ getUser: { data: { user: null }, error: null } });

    const result = await requireUser();

    expect(result).toEqual({ success: false, error: "You must be signed in to do that." });
  });

  it("fails when getUser() returns an error", async () => {
    mockSupabaseClient({ getUser: { data: { user: null }, error: { message: "expired" } } });

    const result = await requireUser();

    expect(result.success).toBe(false);
  });

  it("fails when the authenticated user has no email", async () => {
    mockSupabaseClient({
      getUser: { data: { user: { id: "u1", email: undefined } }, error: null },
    });

    const result = await requireUser();

    expect(result).toEqual({
      success: false,
      error: "Your account has no email address on file.",
    });
  });

  it("succeeds with the user's id and email", async () => {
    mockSupabaseClient({
      getUser: { data: { user: { id: "u1", email: "sam@example.com" } }, error: null },
    });

    const result = await requireUser();

    expect(result).toEqual({ success: true, userId: "u1", email: "sam@example.com" });
  });
});

describe("getSessionUser", () => {
  it("returns null when there's no session", async () => {
    mockSupabaseClient({ getSession: { data: { session: null } } });

    expect(await getSessionUser()).toBeNull();
  });

  it("returns the userId/email from the cookie session without an error check", async () => {
    mockSupabaseClient({
      getSession: { data: { session: { user: { id: "u1", email: "sam@example.com" } } } },
    });

    expect(await getSessionUser()).toEqual({ userId: "u1", email: "sam@example.com" });
  });
});

describe("isAdminEmail", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("matches the default illouraservices.com domain when ADMIN_DOMAINS is unset", () => {
    vi.stubEnv("ADMIN_DOMAINS", "");
    vi.stubEnv("ADMIN_EMAILS", "");

    expect(isAdminEmail("someone@illouraservices.com")).toBe(true);
    expect(isAdminEmail("someone@gmail.com")).toBe(false);
  });

  it("is case-insensitive", () => {
    vi.stubEnv("ADMIN_DOMAINS", "");
    vi.stubEnv("ADMIN_EMAILS", "");

    expect(isAdminEmail("Someone@ILLOURASERVICES.COM")).toBe(true);
  });

  it("matches an exact email in ADMIN_EMAILS even off-domain", () => {
    vi.stubEnv("ADMIN_DOMAINS", "illouraservices.com");
    vi.stubEnv("ADMIN_EMAILS", "external-admin@gmail.com");

    expect(isAdminEmail("external-admin@gmail.com")).toBe(true);
    expect(isAdminEmail("other@gmail.com")).toBe(false);
  });

  it("does not match a subdomain of an admin domain", () => {
    vi.stubEnv("ADMIN_DOMAINS", "illouraservices.com");
    vi.stubEnv("ADMIN_EMAILS", "");

    expect(isAdminEmail("someone@sub.illouraservices.com")).toBe(false);
  });
});

describe("requireAdmin", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("fails when not signed in", async () => {
    mockSupabaseClient({ getUser: { data: { user: null }, error: null } });

    const result = await requireAdmin();

    expect(result).toEqual({ success: false, error: "You must be signed in to do that." });
  });

  it("fails when signed in but not an admin email", async () => {
    vi.stubEnv("ADMIN_DOMAINS", "illouraservices.com");
    vi.stubEnv("ADMIN_EMAILS", "");
    mockSupabaseClient({
      getUser: { data: { user: { id: "u1", email: "candidate@gmail.com" } }, error: null },
    });

    const result = await requireAdmin();

    expect(result).toEqual({
      success: false,
      error: "You do not have access to the admin panel.",
    });
  });

  it("succeeds for a signed-in admin email", async () => {
    vi.stubEnv("ADMIN_DOMAINS", "illouraservices.com");
    vi.stubEnv("ADMIN_EMAILS", "");
    mockSupabaseClient({
      getUser: { data: { user: { id: "u1", email: "admin@illouraservices.com" } }, error: null },
    });

    const result = await requireAdmin();

    expect(result).toEqual({ success: true, userId: "u1", email: "admin@illouraservices.com" });
  });
});
