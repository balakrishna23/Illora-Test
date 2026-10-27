import { fetchExternalJson } from "@/server/integrations/external-jobs/http";
import type { ExternalJobSource, RawExternalJob } from "@/server/integrations/external-jobs/types";

// Northern Territory Government jobs. jobs.nt.gov.au's own frontend (a
// Knockout.js app) posts to this same URL and renders the JSON client-side —
// calling it directly is stateless, no cookies/tokens required. robots.txt
// only disallows /services/ and /Home/DownloadAttachment, neither of which
// this touches.
const SEARCH_URL = "https://jobs.nt.gov.au/Home/Search";

type NtSearchResponse = {
  success: boolean;
  data: Array<{
    rtfId: number;
    jobTitle: string;
    vacancyType: string;
    agency: string;
    section?: string;
    primaryObjective?: string;
    closingDate: string | null;
    locations: string;
  }>;
};

function firstLocation(locations: string): string {
  const first = locations.split(",")[0]?.trim();
  return first || "Northern Territory";
}

export const ntJobSource: ExternalJobSource = {
  key: "nt",
  label: "Northern Territory Government",
  mode: "full",

  async fetchListings(): Promise<RawExternalJob[]> {
    const res = await fetchExternalJson<NtSearchResponse>(SEARCH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });

    if (!res.success) return [];

    return res.data.map((job) => {
      const description = job.primaryObjective?.trim() || job.jobTitle;
      return {
        externalId: String(job.rtfId),
        title: job.jobTitle.trim(),
        employerName: job.agency,
        location: firstLocation(job.locations),
        state: "NT",
        jobType: job.vacancyType,
        closingDate: job.closingDate ?? undefined,
        teaser: description.slice(0, 240),
        description,
        externalUrl: `https://jobs.nt.gov.au/Home/JobDetails?rtfId=${job.rtfId}`,
      };
    });
  },
};
