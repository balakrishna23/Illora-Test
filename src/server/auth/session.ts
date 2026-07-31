import { auth, currentUser } from "@clerk/nextjs/server";

export type RequireUserResult =
  | { success: true; userId: string; email: string }
  | { success: false; error: string };

export async function requireUser(): Promise<RequireUserResult> {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "You must be signed in to do that." };
  }

  const user = await currentUser();
  const email =
    user?.primaryEmailAddress?.emailAddress ?? user?.emailAddresses[0]?.emailAddress;
  if (!email) {
    return { success: false, error: "Your account has no email address on file." };
  }

  return { success: true, userId, email };
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
