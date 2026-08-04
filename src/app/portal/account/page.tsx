import type { Metadata } from "next";

import { requireUser } from "@/server/auth/session";
import { ChangePasswordForm } from "@/features/portal/components/ChangePasswordForm";
import { ChangeEmailForm } from "@/features/portal/components/ChangeEmailForm";

export const metadata: Metadata = {
  title: "Account settings",
};

export default async function AccountPage() {
  const session = await requireUser();
  if (!session.success) {
    // Unreachable in practice — the portal layout and proxy.ts both gate
    // this route already.
    throw new Error("AccountPage rendered without an authenticated session");
  }

  return (
    <div className="grid max-w-md gap-10">
      <ChangeEmailForm currentEmail={session.email} />
      <ChangePasswordForm />
    </div>
  );
}
