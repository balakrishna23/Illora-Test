import Link from "next/link";
import { MapPinIcon, BriefcaseIcon, CalendarIcon, ArrowRightIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Reveal } from "@/components/shared/Reveal";
import { JobSearchForm } from "@/features/jobs/components/JobSearchForm";
import type { Job } from "@/server/integrations/jobadder";

function JobCard({ job }: { job: Job }) {
  return (
    <Card className="group flex h-full flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
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
        <p className="line-clamp-2 flex-1 text-sm text-muted-foreground">{job.teaser}</p>
        <Link
          href={`/jobs/${job.slug}`}
          className={buttonVariants({ size: "sm", variant: "outline", className: "mt-auto self-start" })}
        >
          View &amp; Apply
          <ArrowRightIcon className="ml-1 size-3.5" aria-hidden="true" />
        </Link>
      </CardContent>
    </Card>
  );
}

export function JobTicker({ jobs }: { jobs: Job[] }) {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

        {/* Search widget */}
        <Reveal>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-primary">
              Search Jobs
            </p>
            <JobSearchForm />
          </div>
        </Reveal>

        {/* Trending jobs */}
        <Reveal className="mt-12 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary">
              Trending Jobs
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              Live Opportunities
            </h2>
          </div>
          <Link href="/jobs" className={buttonVariants({ variant: "outline" })}>
            View all jobs
          </Link>
        </Reveal>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {jobs.map((job, i) => (
            <Reveal key={job.id} delay={i * 75} animation="fade-in-up">
              <JobCard job={job} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
