"use client";

import { useState, useDeferredValue } from "react";
import Link from "next/link";
import { MapPinIcon, BriefcaseIcon, CalendarIcon, SearchIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { JOB_INDUSTRIES, AU_STATES, type Job } from "@/server/integrations/jobadder";

function JobCard({ job }: { job: Job }) {
  return (
    <Card className="group">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold leading-snug group-hover:text-primary">
              {job.title}
            </h2>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
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
                Closes{" "}
                {new Date(job.closingDate).toLocaleDateString("en-AU", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
            <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
              {job.teaser}
            </p>
          </div>
          <Badge variant="secondary" className="shrink-0 text-xs mt-0.5">
            {job.type}
          </Badge>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          {job.salaryRange && (
            <span className="text-sm font-medium text-primary">{job.salaryRange}</span>
          )}
          <Link
            href={`/jobs/${job.slug}`}
            className={buttonVariants({ size: "sm", className: "ml-auto" })}
          >
            View &amp; Apply
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export function JobsClient({ jobs }: { jobs: Job[] }) {
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("");
  const [type, setType] = useState("");
  const [state, setState] = useState("");

  const deferred = useDeferredValue(search);

  const filtered = jobs.filter((job) => {
    const matchesSearch =
      !deferred ||
      job.title.toLowerCase().includes(deferred.toLowerCase()) ||
      job.location.toLowerCase().includes(deferred.toLowerCase()) ||
      job.teaser.toLowerCase().includes(deferred.toLowerCase());
    const matchesIndustry = !industry || job.industry === industry;
    const matchesType = !type || job.type === type;
    const matchesState = !state || job.state === state;
    return matchesSearch && matchesIndustry && matchesType && matchesState;
  });

  return (
    <div>
      {/* Filters */}
      <div className="mt-8 rounded-xl border border-border bg-card p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" aria-hidden="true" />
            <Input
              placeholder="Search jobs…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              aria-label="Search jobs"
            />
          </div>
          <NativeSelect
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            aria-label="Filter by industry"
          >
            <option value="">All industries</option>
            {JOB_INDUSTRIES.map((ind) => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </NativeSelect>
          <NativeSelect
            value={type}
            onChange={(e) => setType(e.target.value)}
            aria-label="Filter by employment type"
          >
            <option value="">All types</option>
            <option value="Permanent">Permanent</option>
            <option value="Contract">Contract</option>
            <option value="Casual">Casual</option>
          </NativeSelect>
          <NativeSelect
            value={state}
            onChange={(e) => setState(e.target.value)}
            aria-label="Filter by state"
          >
            <option value="">All states</option>
            {AU_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </NativeSelect>
        </div>
        {(search || industry || type || state) && (
          <button
            onClick={() => { setSearch(""); setIndustry(""); setType(""); setState(""); }}
            className="mt-3 text-xs text-primary hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Results count */}
      <p className="mt-5 text-sm text-muted-foreground">
        {filtered.length} role{filtered.length !== 1 ? "s" : ""} found
      </p>

      {/* Job list */}
      {filtered.length > 0 ? (
        <div className="mt-4 grid gap-4">
          {filtered.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-xl border border-dashed border-border py-16 text-center">
          <p className="font-medium">No roles match your filters right now.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Try adjusting your search, or submit your CV to be considered for
            upcoming roles.
          </p>
          <Link
            href="/candidates/submit-cv"
            className={buttonVariants({ className: "mt-5" })}
          >
            Submit your CV
          </Link>
        </div>
      )}
    </div>
  );
}
