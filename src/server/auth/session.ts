import { createSupabaseServerClient } from "@/server/auth/supabase-server";

export type RequireUserResult =
  | { success: true; userId: string; email: string }
  | { success: false; error: string };

// Authorization boundary — used by every layout gate and Server Action.
// Calls getUser(), not getSession(): getUser() revalidates the token against
// the Auth server, while getSession() trusts the cookie's decoded JWT as-is.
// Since this backs every admin/candidate authorization check in the app,
// that distinction matters.
export async function requireUser(): Promise<RequireUserResult> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return { success: false, error: "You must be signed in to do that." };
  }

  const email = data.user.email;
  if (!email) {
    return { success: false, error: "Your account has no email address on file." };
  }

  return { success: true, userId: data.user.id, email };
}

// Nav-state / saved-job-lookup use only — NEVER use for authorization. Reads
// the session cookie without revalidating it against the Auth server (no
// network round trip beyond what src/proxy.ts already does earlier in the
// same request). Safe here specifically because "is this visitor signed in,
// and what have they saved" isn't a security boundary — worst case is a
// stale UI, not unauthorized data access (the real admin gate is
// requireAdmin(), checked server-side on every /admin action and layout).
export async function getSessionUser(): Promise<{ userId: string; email: string } | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user?.email) return null;
  return { userId: session.user.id, email: session.user.email };
}

const DEFAULT_ADMIN_DOMAINS = ["illouraservices.com"];

function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function getAdminDomains(): string[] {
  const configuredDomains = (process.env.ADMIN_DOMAINS ?? "")
    .split(",")
    .map((domain) => domain.trim().toLowerCase())
    .filter(Boolean);

  return configuredDomains.length > 0 ? configuredDomains : DEFAULT_ADMIN_DOMAINS;
}

export function isAdminEmail(email: string): boolean {
  const normalized = email.toLowerCase();
  return (
    getAdminDomains().some((domain) => normalized.endsWith(`@${domain}`)) ||
    getAdminEmails().includes(normalized)
  );
}

export async function requireAdmin(): Promise<RequireUserResult> {
  const session = await requireUser();
  if (!session.success) return session;

  if (!isAdminEmail(session.email)) {
    return { success: false, error: "You do not have access to the admin panel." };
  }

  return session;
}
