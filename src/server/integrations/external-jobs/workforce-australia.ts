import { fetchExternalJson } from "@/server/integrations/external-jobs/http";
import type { ExternalJobSource, RawExternalJob } from "@/server/integrations/external-jobs/types";

// Workforce Australia (federal). IMPORTANT: this site's robots.txt disallows
// all automated access except a named allowlist (Googlebot, Bingbot, the
// Wayback Machine, etc.) — this adapter knowingly goes against that stated
// policy, a decision made explicitly by Illoura leadership despite the
// recommendation against it. It does NOT spoof an allowlisted crawler's
// identity to get around the policy; it identifies honestly via the shared
// USER_AGENT in http.ts. If this ever needs revisiting, the alternative is
// contacting DEWR about an official data-sharing arrangement.
const API_URL = "https://www.workforceaustralia.gov.au/api/v1/global/vacancies/";

type WfaVacancy = {
  vacancyId: number;
  title: string;
  description: string;
  organisation?: { label?: string };
  suburb?: string;
  state?: string;
  latitude?: string;
  longitude?: string;
  tenure?: { label?: string };
  salary?: { label?: string };
  displayFromDate?: string;
  expiryDate?: string;
};

type WfaSearchResponse = {
  totalCount: number;
  results: Array<{ result: WfaVacancy }>;
};

export const workforceAustraliaJobSource: ExternalJobSource = {
  key: "workforce_australia",
  label: "Workforce Australia",
  mode: "full",

  async fetchListings(): Promise<RawExternalJob[]> {
    const res = await fetchExternalJson<WfaSearchResponse>(API_URL);

    return res.results.map(({ result: job }): RawExternalJob => {
      const lat = job.latitude ? Number(job.latitude) : undefined;
      const lng = job.longitude ? Number(job.longitude) : undefined;

      return {
        externalId: String(job.vacancyId),
        title: job.title.trim(),
        employerName: job.organisation?.label,
        location: job.suburb ?? job.state ?? "Australia",
        state: job.state ?? "NSW",
        jobType: job.tenure?.label ?? "",
        postedDate: job.displayFromDate,
        closingDate: job.expiryDate,
        teaser: job.description.slice(0, 240),
        description: job.description,
        externalUrl: `https://www.workforceaustralia.gov.au/individuals/jobs/details/${job.vacancyId}`,
        salaryRange: job.salary?.label,
        latitude: Number.isFinite(lat) ? lat : undefined,
        longitude: Number.isFinite(lng) ? lng : undefined,
      };
    });
  },
};
