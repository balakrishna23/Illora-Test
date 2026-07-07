"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon } from "lucide-react";

import { JOB_INDUSTRIES, AU_STATES } from "@/lib/job-constants";

export function JobSearchForm() {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [industry, setIndustry] = useState("");
  const [state, setState] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.set("q", keyword.trim());
    if (industry) params.set("industry", industry);
    if (state) params.set("state", state);
    const qs = params.toString();
    router.push(`/jobs${qs ? `?${qs}` : ""}`);
  }

  const selectClass =
    "h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto_auto]">
        <div className="relative">
          <SearchIcon
            className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder="Job title or keywords…"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="h-11 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Search keywords"
          />
        </div>

        <select
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          className={selectClass}
          aria-label="Filter by industry"
        >
          <option value="">All Industries</option>
          {JOB_INDUSTRIES.map((ind) => (
            <option key={ind} value={ind}>{ind}</option>
          ))}
        </select>

        <select
          value={state}
          onChange={(e) => setState(e.target.value)}
          className={selectClass}
          aria-label="Filter by state"
        >
          <option value="">All States</option>
          {AU_STATES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <button
          type="submit"
          className="h-11 rounded-lg bg-accent px-6 text-sm font-bold uppercase tracking-widest text-accent-foreground transition-colors hover:bg-accent/85"
        >
          Find Jobs
        </button>
      </div>
    </form>
  );
}
