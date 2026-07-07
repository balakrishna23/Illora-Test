"use client";

import Link from "next/link";
import { MapPinIcon, CalendarIcon, ZapIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Job } from "@/server/integrations/jobadder";
import { SaveJobButton } from "@/features/portal/components/SaveJobButton";

type Props = {
  job: Job;
  isSaved: boolean;
  isSignedIn: boolean;
};

export function JobListCard({ job, isSaved, isSignedIn }: Props) {
  const postedDate = new Date(job.postedDate).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="rounded-xl border border-border bg-card p-5 transition-all duration-150 hover:shadow-md hover:-translate-y-px">
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <Link
              href={`/jobs/${job.slug}`}
              className="font-semibold text-primary hover:underline leading-snug"
            >
              {job.title}
            </Link>
            <Badge variant="secondary" className="text-xs shrink-0">{job.type}</Badge>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPinIcon className="size-3.5" aria-hidden="true" />
              {job.location}, {job.state}
            </span>
            <span aria-hidden="true" className="text-border">|</span>
            <span className="flex items-center gap-1">
              <CalendarIcon className="size-3.5" aria-hidden="true" />
              {postedDate}
            </span>
            {job.salaryRange && (
              <>
                <span aria-hidden="true" className="text-border">|</span>
                <span className="font-medium text-accent">{job.salaryRange}</span>
              </>
            )}
          </div>

          <p className="mt-2.5 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {job.teaser}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-center gap-3">
          <Link
            href={`/jobs/${job.slug}`}
            className="flex flex-col items-center gap-1.5 pt-0.5 text-accent hover:opacity-75 transition-opacity"
            aria-label={`Quick apply for ${job.title}`}
          >
            <ZapIcon className="size-5" fill="currentColor" strokeWidth={0} aria-hidden="true" />
            <span className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">
              Quick Apply
            </span>
          </Link>
          <SaveJobButton
            job={{ id: job.id, slug: job.slug, title: job.title }}
            initialSaved={isSaved}
            isSignedIn={isSignedIn}
          />
        </div>
      </div>
    </div>
  );
}
