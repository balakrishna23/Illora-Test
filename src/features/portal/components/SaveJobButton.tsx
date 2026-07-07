"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { BookmarkIcon, BookmarkCheckIcon } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { toggleSaveJob } from "@/features/portal/actions";

type Props = {
  job: { id: string; slug: string; title: string };
  initialSaved: boolean;
  isSignedIn: boolean;
};

export function SaveJobButton({ job, initialSaved, isSignedIn }: Props) {
  const [saved, setSaved] = useState(initialSaved);
  const [isPending, startTransition] = useTransition();

  if (!isSignedIn) {
    return (
      <Link
        href={`/sign-in?redirect_url=/jobs/${job.slug}`}
        className={buttonVariants({ variant: "outline", size: "sm" })}
      >
        <BookmarkIcon aria-hidden="true" />
        Sign in to save
      </Link>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          const result = await toggleSaveJob(job.id, job.slug, job.title);
          if (result.success) setSaved(result.saved);
        })
      }
    >
      {saved ? (
        <BookmarkCheckIcon aria-hidden="true" />
      ) : (
        <BookmarkIcon aria-hidden="true" />
      )}
      {saved ? "Saved" : "Save job"}
    </Button>
  );
}
