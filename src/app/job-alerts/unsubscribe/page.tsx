import type { Metadata } from "next";
import { CheckCircleIcon, XCircleIcon } from "lucide-react";

import { unsubscribeFromJobAlert } from "@/features/job-alerts/actions";

export const metadata: Metadata = {
  title: "Unsubscribe from job alerts",
  alternates: { canonical: "/job-alerts/unsubscribe" },
  robots: { index: false, follow: false },
};

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const result = token ? await unsubscribeFromJobAlert(token) : { success: false };

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-24 text-center sm:px-6">
      {result.success ? (
        <>
          <CheckCircleIcon className="size-10 text-green-600" aria-hidden="true" />
          <h1 className="text-xl font-semibold">You&apos;ve been unsubscribed</h1>
          <p className="text-sm text-muted-foreground">
            You won&apos;t receive any more job alert emails from Illora.
          </p>
        </>
      ) : (
        <>
          <XCircleIcon className="size-10 text-destructive" aria-hidden="true" />
          <h1 className="text-xl font-semibold">Link not found</h1>
          <p className="text-sm text-muted-foreground">
            This unsubscribe link is invalid or has already been used.
          </p>
        </>
      )}
    </div>
  );
}
