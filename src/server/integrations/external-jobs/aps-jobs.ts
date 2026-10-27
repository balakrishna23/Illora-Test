import { chromium } from "playwright-core";

import { USER_AGENT } from "@/server/integrations/external-jobs/http";
import type { ExternalJobSource, RawExternalJob } from "@/server/integrations/external-jobs/types";

// APS Jobs (federal). This is a Salesforce Lightning/Experience Cloud site —
// the page itself has no listings in its raw HTML; the frontend calls an
// internal Aura/Apex endpoint (`/s/sfsites/aura?...ApexAction.execute...`)
// that isn't a stable public API and can't be replicated with a plain
// request (it needs a live page's Aura session context/tokens). Launching a
// real headless browser once and reading the response it produces itself is
// far more robust than trying to hand-construct that request. This is the
// only source in the pipeline that needs a browser — see DEPLOYMENT.md for
// the production Chromium requirement this adds.
//
// The first page load only returns 15 of ~568 total listings (Salesforce
// paginates client-side); v1 takes just that first page per run, same
// "catches new postings, dedup handles the rest" trade-off as the other
// capped sources.
const SEARCH_URL = "https://www.apsjobs.gov.au/s/job-search";

type ApsJobListing = {
  jobId: string;
  jobName: string;
  departmentName: string;
  jobLocation?: string;
  futureLocationSuburb?: string;
  jobType?: string;
  jobCategory?: string;
  jobClassification?: string;
  jobPostedDate?: string;
  jobCloseDate?: string;
  jobDescription?: string;
  applicationURL?: string;
  jobSalaryFrom?: string;
  jobSalaryTo?: string;
};

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const AU_STATE_PATTERN = /\b(NSW|VIC|QLD|WA|SA|TAS|ACT|NT)\b\s*$/;

// jobLocation looks like "Parkes ACT" or, for multi-location postings,
// "Adelaide SA, Brisbane QLD, ...". Only the first listed location is used —
// good enough for the map pin; the full list is still visible to the
// applicant on the source agency's own application page.
function parseFirstAuLocation(jobLocation: string | undefined): { suburb: string; state: string } {
  const first = jobLocation?.split(",")[0]?.trim();
  if (!first) return { suburb: "Australia", state: "ACT" };

  const match = first.match(AU_STATE_PATTERN);
  if (!match) return { suburb: first, state: "ACT" };

  return { suburb: first.slice(0, match.index).trim() || first, state: match[1] };
}

export const apsJobsSource: ExternalJobSource = {
  key: "aps_jobs",
  label: "Australian Public Service",
  mode: "full",

  async fetchListings(): Promise<RawExternalJob[]> {
    const browser = await chromium.launch();
    try {
      const page = await browser.newPage({ userAgent: USER_AGENT });

      const listingsPromise = new Promise<ApsJobListing[]>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error("aps-jobs: timed out waiting for job listings response")), 20000);

        page.on("response", async (res) => {
          const url = res.url();
          if (!url.includes("/s/sfsites/aura") || !url.includes("ApexAction.execute")) return;

          try {
            const body = await res.json();
            const jobListings = body?.actions?.[0]?.returnValue?.returnValue?.jobListings;
            if (Array.isArray(jobListings) && jobListings.length > 0) {
              clearTimeout(timeout);
              resolve(jobListings);
            }
          } catch {
            // Not the response we're looking for, or not JSON — ignore.
          }
        });
      });

      await page.goto(SEARCH_URL, { waitUntil: "networkidle", timeout: 30000 });
      const listings = await listingsPromise;

      return listings.map((job): RawExternalJob => {
        const description = job.jobDescription ? stripHtml(job.jobDescription) : job.jobName;
        const { suburb, state } = parseFirstAuLocation(job.jobLocation ?? job.futureLocationSuburb);
        const salaryRange =
          job.jobSalaryFrom && job.jobSalaryTo
            ? `$${job.jobSalaryFrom} - $${job.jobSalaryTo}`
            : undefined;

        return {
          externalId: job.jobId,
          title: job.jobName,
          employerName: job.departmentName,
          location: suburb,
          state,
          jobType: job.jobType ?? job.jobClassification ?? "",
          postedDate: job.jobPostedDate,
          closingDate: job.jobCloseDate,
          teaser: description.slice(0, 240),
          description,
          externalUrl: job.applicationURL || SEARCH_URL,
          salaryRange,
        };
      });
    } finally {
      await browser.close();
    }
  },
};
