import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { jsonLdString } from "@/lib/utils";

import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { JobsClient } from "@/features/jobs/components/JobsClient";
import { getAllJobs } from "@/server/integrations/jobadder";
import { getCandidateByClerkUserId, getSavedJobs } from "@/features/portal/queries";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "Jobs",
  description:
    "Search live job listings across IT & Telecommunications, Construction, Healthcare, Nursing & Aged Care, Data Science, Cyber Security, and EV Waste & Recycling. Filter by location, type, and industry.",
};

type SearchParams = Promise<{ q?: string; industry?: string; state?: string }>;

export default async function JobsPage({ searchParams }: { searchParams: SearchParams }) {
  const [jobs, params, { userId }] = await Promise.all([getAllJobs(), searchParams, auth()]);

  const candidate = userId ? await getCandidateByClerkUserId(userId) : null;
  const savedJobIds = candidate ? (await getSavedJobs(candidate.id)).map((j) => j.jobId) : [];

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Illora Live Job Listings",
    itemListElement: jobs.map((job, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${SITE_URL}/jobs/${job.slug}`,
      name: job.title,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(itemListJsonLd) }}
      />
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Jobs", href: "/jobs" },
          ]}
        />
        <div className="mt-8">
          <h1 className="text-3xl font-semibold tracking-tight">Find Your Next Role</h1>
          <p className="mt-2 text-muted-foreground">
            {jobs.length} live roles across our seven specialist sectors, Australia-wide.
          </p>
        </div>
        <JobsClient
          jobs={jobs}
          initialQuery={params.q ?? ""}
          initialIndustry={params.industry ?? ""}
          initialState={params.state ?? ""}
          savedJobIds={savedJobIds}
          isSignedIn={Boolean(userId)}
        />
      </div>
    </>
  );
}
