import type { Metadata } from "next";
import { CheckCircleIcon, MailXIcon, XCircleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { confirmCampaignUnsubscribe } from "@/features/admin/campaigns/actions";
import { verifyUnsubscribeToken } from "@/server/lib/unsubscribe-token";

export const metadata: Metadata = {
  title: "Unsubscribe from Illora emails",
  alternates: { canonical: "/email-preferences/unsubscribe" },
  robots: { index: false, follow: false },
};

// The GET render only verifies the link and shows a confirm button; the
// suppression itself happens in the confirm POST so email link scanners that
// prefetch URLs can't unsubscribe people who never clicked.
export default async function CampaignUnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; token?: string; done?: string }>;
}) {
  const { email, token, done } = await searchParams;
  const isValidLink = Boolean(email && token && verifyUnsubscribeToken(email, token));

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-24 text-center sm:px-6">
      {done === "1" ? (
        <>
          <CheckCircleIcon className="size-10 text-green-600" aria-hidden="true" />
          <h1 className="text-xl font-semibold">You&apos;ve been unsubscribed</h1>
          <p className="text-sm text-muted-foreground">
            You won&apos;t receive any more campaign emails from Illora. Job alerts you signed
            up for are managed separately from the link in those emails.
          </p>
        </>
      ) : isValidLink ? (
        <>
          <MailXIcon className="size-10 text-muted-foreground" aria-hidden="true" />
          <h1 className="text-xl font-semibold">Unsubscribe from Illora emails?</h1>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{email}</span> will stop receiving
            campaign emails from Illora.
          </p>
          <form action={confirmCampaignUnsubscribe} className="mt-2">
            <input type="hidden" name="email" value={email} />
            <input type="hidden" name="token" value={token} />
            <Button type="submit" variant="destructive">
              Unsubscribe
            </Button>
          </form>
        </>
      ) : (
        <>
          <XCircleIcon className="size-10 text-destructive" aria-hidden="true" />
          <h1 className="text-xl font-semibold">Link not valid</h1>
          <p className="text-sm text-muted-foreground">
            This unsubscribe link is invalid or incomplete. Please use the link from the most
            recent email we sent you.
          </p>
        </>
      )}
    </div>
  );
}
