import * as cheerio from "cheerio";

import { fetchExternalText, sleep } from "@/server/integrations/external-jobs/http";
import type { ExternalJobSource, RawExternalJob } from "@/server/integrations/external-jobs/types";

// Careers Vic. The `/jobs` landing page is a Vue-mounted search form with no
// results in its initial HTML, but submitting a search navigates to a plain
// query-string URL (`/jobs?keywords=...`) whose results ARE server-rendered
// Drupal Views markup — no browser needed. Default sort is "Newest to
// oldest", so capping pages here still surfaces new postings; older jobs
// already ingested in a prior run are still deduped correctly if they
// reappear.
const BASE_URL = "https://www.careers.vic.gov.au/jobs?keywords=";
const MAX_PAGES = 5; // ~75 jobs/run — see module comment on the recency-sort assumption
const REQUEST_DELAY_MS = 1000;

function textAfterLabel(
  $: cheerio.CheerioAPI,
  $card: cheerio.Cheerio<import("domhandler").Element>,
  label: string
): string | undefined {
  let value: string | undefined;
  $card.find(".job-searchResult-details").each((_, el) => {
    const $detail = $(el);
    const strong = $detail.find("strong").first().text().trim().replace(/:$/, "");
    if (strong === label) {
      value = $detail.find("p").eq(1).text().trim();
    }
  });
  return value;
}

function parsePage(html: string): RawExternalJob[] {
  const $ = cheerio.load(html);
  const jobs: RawExternalJob[] = [];

  $(".views-row rpl-content.job-searchResult").each((_, el) => {
    const $card = $(el);
    const link = $card.find(".job-searchResult-header__title a").first();
    const href = link.attr("href");
    const title = link.find("h3").text().trim() || link.text().trim();
    if (!href || !title) return;

    const externalId = href.split("-").pop() ?? href;
    const employerName = $card.find(".job-searchResult-header__title p").first().text().trim();
    const location = textAfterLabel($, $card, "Location") ?? "Victoria";
    const jobType = textAfterLabel($, $card, "Work Type") ?? "";
    const salaryRange = textAfterLabel($, $card, "Salary");
    const closingDate = textAfterLabel($, $card, "Applications close");
    const description =
      $card.find(".job-searchResult-description").text().trim() || title;

    jobs.push({
      externalId,
      title,
      employerName: employerName || undefined,
      location,
      state: "VIC",
      jobType,
      closingDate,
      teaser: description.slice(0, 240),
      description,
      externalUrl: new URL(href, "https://www.careers.vic.gov.au").toString(),
      salaryRange: salaryRange && !/not specified/i.test(salaryRange) ? salaryRange : undefined,
    });
  });

  return jobs;
}

export const vicJobSource: ExternalJobSource = {
  key: "vic",
  label: "Victorian Government",
  mode: "full",

  async fetchListings(): Promise<RawExternalJob[]> {
    const jobs: RawExternalJob[] = [];

    for (let page = 0; page < MAX_PAGES; page++) {
      const html = await fetchExternalText(`${BASE_URL}&page=${page}`);
      const pageJobs = parsePage(html);
      if (pageJobs.length === 0) break;
      jobs.push(...pageJobs);
      await sleep(REQUEST_DELAY_MS);
    }

    return jobs;
  },
};
