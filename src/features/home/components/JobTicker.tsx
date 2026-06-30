import Link from "next/link";
import { MapPinIcon, BriefcaseIcon, CalendarIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import type { Job } from "@/server/integrations/jobadder";

function JobCard({ job }: { job: Job }) {
  return (
    <Card className="group flex flex-col">
      <CardContent className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-snug group-hover:text-primary">
            {job.title}
          </h3>
          <Badge variant="secondary" className="shrink-0 text-xs">
            {job.type}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPinIcon className="size-3.5" aria-hidden="true" />
            {job.location}, {job.state}
          </span>
          <span className="flex items-center gap-1">
            <BriefcaseIcon className="size-3.5" aria-hidden="true" />
            {job.industry}
          </span>
          <span className="flex items-center gap-1">
            <CalendarIcon className="size-3.5" aria-hidden="true" />
            Closes {new Date(job.closingDate).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
          </span>
        </div>
        <p className="line-clamp-2 flex-1 text-sm text-muted-foreground">
          {job.teaser}
        </p>
        <Link
          href={`/jobs/${job.slug}`}
          className={buttonVariants({ size: "sm", variant: "outline", className: "mt-auto self-start" })}
        >
          View &amp; Apply
        </Link>
      </CardContent>
    </Card>
  );
}

export function JobTicker({ jobs }: { jobs: Job[] }) {
  return (
    <section className="bg-muted/40 py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Live Opportunities
            </h2>
            <p className="mt-1 text-muted-foreground">
              Updated in real time from our ATS.
            </p>
          </div>
          <Link
            href="/jobs"
            className={buttonVariants({ variant: "outline" })}
          >
            View all jobs
          </Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </div>
    </section>
  );
}
