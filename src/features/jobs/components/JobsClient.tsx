"use client";

import { useState, useDeferredValue } from "react";
import Link from "next/link";
import { SearchIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import type { Job } from "@/server/integrations/jobadder";
import { JOB_INDUSTRIES } from "@/lib/job-constants";
import { JobListCard } from "@/features/jobs/components/JobListCard";
import { JobAlertForm } from "@/features/job-alerts/components/JobAlertForm";

type Props = {
  jobs: Job[];
  initialQuery?: string;
  initialIndustry?: string;
  initialState?: string;
  savedJobIds: string[];
  isSignedIn: boolean;
};

function uniqueLocations(jobs: Job[]) {
  return [...new Set(jobs.map((j) => j.location))].sort();
}

function toggle<T>(arr: T[], item: T): T[] {
  return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
}

export function JobsClient({
  jobs,
  initialQuery = "",
  initialIndustry = "",
  initialState = "",
  savedJobIds,
  isSignedIn,
}: Props) {
  const savedJobIdSet = new Set(savedJobIds);
  const [search, setSearch] = useState(initialQuery);
  const [industries, setIndustries] = useState<string[]>(initialIndustry ? [initialIndustry] : []);
  const [locations, setLocations] = useState<string[]>([]);
  const [stateFilter, setStateFilter] = useState(initialState);
  const [sort, setSort] = useState<"latest" | "closing">("latest");

  const deferred = useDeferredValue(search);
  const allLocations = uniqueLocations(jobs);

  const filtered = jobs
    .filter((job) => {
      const q = deferred.toLowerCase();
      const matchSearch =
        !q ||
        job.title.toLowerCase().includes(q) ||
        job.teaser.toLowerCase().includes(q) ||
        job.location.toLowerCase().includes(q) ||
        job.state.toLowerCase().includes(q) ||
        job.industry.toLowerCase().includes(q);
      const matchIndustry = industries.length === 0 || industries.includes(job.industry);
      const matchState = !stateFilter || job.state === stateFilter;
      const matchLocation = locations.length === 0 || locations.includes(job.location);
      return matchSearch && matchIndustry && matchState && matchLocation;
    })
    .sort((a, b) =>
      sort === "latest"
        ? new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
        : new Date(a.closingDate).getTime() - new Date(b.closingDate).getTime()
    );

  const hasFilters = industries.length > 0 || locations.length > 0 || !!stateFilter;

  return (
    <div className="mt-8 gap-8 lg:grid lg:grid-cols-[260px_1fr]">
      {/* Sidebar */}
      <aside>
        <div className="rounded-xl border border-border bg-card p-5 lg:sticky lg:top-24">
          <SidebarSection
            title="Classification"
            items={[...JOB_INDUSTRIES]}
            selected={industries}
            onToggle={(item) => setIndustries(toggle(industries, item))}
          />
          <div className="my-5 border-t border-border" />
          <SidebarSection
            title="Locations"
            items={allLocations}
            selected={locations}
            onToggle={(item) => setLocations(toggle(locations, item))}
          />
          {hasFilters && (
            <button
              onClick={() => { setIndustries([]); setLocations([]); setStateFilter(""); }}
              className="mt-4 text-xs text-primary underline-offset-2 hover:underline"
            >
              Clear all filters
            </button>
          )}
        </div>
        <div className="mt-4 rounded-xl border border-border bg-card p-5">
          <JobAlertForm defaultIndustry={industries[0]} />
        </div>
      </aside>

      {/* Main */}
      <main>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <SearchIcon
              className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              placeholder="Search keywords…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              aria-label="Search jobs"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as "latest" | "closing")}
            className="rounded-md border border-input bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            aria-label="Sort jobs"
          >
            <option value="latest">Latest</option>
            <option value="closing">Closing Soon</option>
          </select>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          {filtered.length} role{filtered.length !== 1 ? "s" : ""} found
        </p>

        {filtered.length > 0 ? (
          <div className="mt-3 space-y-3">
            {filtered.map((job) => (
              <JobListCard
                key={job.id}
                job={job}
                isSaved={savedJobIdSet.has(job.id)}
                isSignedIn={isSignedIn}
              />
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-xl border border-dashed border-border py-16 text-center">
            <p className="font-medium">No roles match your filters right now.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Try adjusting your search, or submit your CV to be considered for upcoming roles.
            </p>
            <Link
              href="/candidates/submit-cv"
              className={buttonVariants({ variant: "accent", className: "mt-5" })}
            >
              Submit your CV
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

function SidebarSection({
  title,
  items,
  selected,
  onToggle,
}: {
  title: string;
  items: string[];
  selected: string[];
  onToggle: (item: string) => void;
}) {
  return (
    <div>
      <h2 className="text-xs font-bold uppercase tracking-widest text-primary">{title}</h2>
      <ul className="mt-3 space-y-0.5">
        {items.map((item) => (
          <li key={item}>
            <button
              onClick={() => onToggle(item)}
              className={`w-full rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
                selected.includes(item)
                  ? "bg-primary/10 font-semibold text-primary"
                  : "text-foreground/70 hover:bg-muted hover:text-foreground"
              }`}
            >
              {item}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
