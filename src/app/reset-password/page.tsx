import type { Metadata } from "next";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { requireUser } from "@/server/auth/session";
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Set a new password",
  alternates: { canonical: "/reset-password" },
  robots: { index: false, follow: false },
};

// Only reachable with a valid (recovery-scoped) session — established by
// /auth/confirm verifying the emailed reset link. Checked here at the page
// level too, not just inside the resetPassword Server Action, so someone
// arriving with an expired/already-used link sees that immediately instead
// of filling out the form first.
export default async function ResetPasswordPage() {
  const session = await requireUser();

  if (!session.success) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Link invalid or expired</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              This password reset link is invalid or has expired. Request a new one to continue.
            </p>
            <Link href="/forgot-password" className={buttonVariants({ variant: "accent" })}>
              Request a new link
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-center px-4 py-16">
      <ResetPasswordForm />
    </div>
  );
}
