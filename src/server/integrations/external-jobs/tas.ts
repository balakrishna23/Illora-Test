import { fetchExternalText, sleep } from "@/server/integrations/external-jobs/http";
import { parsePageupCards } from "@/server/integrations/external-jobs/pageup-style";
import type { ExternalJobSource, RawExternalJob } from "@/server/integrations/external-jobs/types";

// Tasmanian Government Jobs. Same underlying platform as WA (identical
// job-search-results-card markup) — see pageup-style.ts. Fully
// server-rendered; the robots.txt fetch that returned 403 earlier turned out
// not to reflect the actual site (confirmed by directly fetching the real
// listing page successfully).
const BASE_URL = "https://careers.jobs.tas.gov.au";
const MAX_PAGES = 5;
const REQUEST_DELAY_MS = 3000;

export const tasJobSource: ExternalJobSource = {
  key: "tas",
  label: "Tasmanian Government",
  mode: "full",

  async fetchListings(): Promise<RawExternalJob[]> {
    const jobs: RawExternalJob[] = [];

    for (let page = 1; page <= MAX_PAGES; page++) {
      const html = await fetchExternalText(`${BASE_URL}/jobs/search?page=${page}`);
      const pageJobs = parsePageupCards(html, { baseUrl: BASE_URL, state: "TAS" });
      if (pageJobs.length === 0) break;
      jobs.push(...pageJobs);
      await sleep(REQUEST_DELAY_MS);
    }

    return jobs;
  },
};
