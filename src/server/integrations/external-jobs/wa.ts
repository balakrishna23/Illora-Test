import { fetchExternalText, sleep } from "@/server/integrations/external-jobs/http";
import { parsePageupCards } from "@/server/integrations/external-jobs/pageup-style";
import type { ExternalJobSource, RawExternalJob } from "@/server/integrations/external-jobs/types";

// WA Government Jobs. Fully server-rendered (confirmed by direct fetch — no
// browser needed). robots.txt sets Crawl-delay: 5 for all agents, which
// REQUEST_DELAY_MS respects.
const BASE_URL = "https://search.jobs.wa.gov.au";
const MAX_PAGES = 5; // ~75-100 jobs/run, newest-first default sort
const REQUEST_DELAY_MS = 5000;

export const waJobSource: ExternalJobSource = {
  key: "wa",
  label: "WA Government",
  mode: "full",

  async fetchListings(): Promise<RawExternalJob[]> {
    const jobs: RawExternalJob[] = [];

    for (let page = 1; page <= MAX_PAGES; page++) {
      const html = await fetchExternalText(`${BASE_URL}/jobs/search?page=${page}`);
      const pageJobs = parsePageupCards(html, { baseUrl: BASE_URL, state: "WA" });
      if (pageJobs.length === 0) break;
      jobs.push(...pageJobs);
      await sleep(REQUEST_DELAY_MS);
    }

    return jobs;
  },
};
