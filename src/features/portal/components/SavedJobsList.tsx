import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { SaveJobButton } from "@/features/portal/components/SaveJobButton";

type SavedJob = {
  jobId: string;
  jobSlug: string;
  jobTitle: string;
};

export function SavedJobsList({ savedJobs }: { savedJobs: SavedJob[] }) {
  if (savedJobs.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border py-12 text-center">
        <p className="font-medium">No saved jobs yet</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Browse live roles and save the ones you&apos;re interested in.
        </p>
        <Link href="/jobs" className={buttonVariants({ variant: "accent", className: "mt-5" })}>
          Browse jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {savedJobs.map((job) => (
        <Card key={job.jobId}>
          <CardContent className="flex items-center justify-between gap-4 p-5">
            <Link href={`/jobs/${job.jobSlug}`} className="font-semibold hover:text-primary">
              {job.jobTitle}
            </Link>
            <SaveJobButton
              job={{ id: job.jobId, slug: job.jobSlug, title: job.jobTitle }}
              initialSaved
              isSignedIn
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
