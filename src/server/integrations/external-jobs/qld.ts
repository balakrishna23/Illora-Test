import * as cheerio from "cheerio";

import { fetchExternalText } from "@/server/integrations/external-jobs/http";
import type { ExternalJobSource, RawExternalJob } from "@/server/integrations/external-jobs/types";

// Smart Jobs (Queensland). Fully server-rendered (legacy "jobtools" ATS
// platform, no robots.txt found at all). Only the first results page is
// fetched — default sort is "Relevance" not date, and this platform's
// pagination isn't link-based (JS-driven), so v1 doesn't page through it.
// New postings still surface over successive runs since relevance ranking
// shifts as jobs close; a wider net could be added later if this proves
// insufficient.
const BASE_URL = "https://smartjobs.qld.gov.au";
const RESULTS_URL = `${BASE_URL}/jobtools/jncustomsearch.searchResults?in_organid=14904`;

function parseListing(html: string): RawExternalJob[] {
  const $ = cheerio.load(html);
  const jobs: RawExternalJob[] = [];

  $("ol.search-results.jobs > li").each((_, el) => {
    const $item = $(el);
    const link = $item.find("h3 a").first();
    const href = link.attr("href");
    const titleSpan = link.find("span.result-title");
    const title = titleSpan.find("strong").first().text().trim();
    if (!href || !title) return;

    const employerName = titleSpan
      .text()
      .replace(title, "")
      .replace(/^[,\s]+/, "")
      .trim();

    const jobType = $item.find("h3 span.type").first().text().trim();
    const location = $item.find("ul.location li strong.locality").first().text().trim() || "Queensland";
    const description = $item.find("div.search-description").text().trim() || title;
    const closingDate = $item.find("time.date-closes").attr("datetime");
    const externalUrl = new URL(href, BASE_URL).toString();

    jobs.push({
      externalId: href,
      title,
      employerName: employerName || undefined,
      location,
      state: "QLD",
      jobType,
      closingDate: closingDate?.slice(0, 10),
      teaser: description.slice(0, 240),
      description,
      externalUrl,
    });
  });

  return jobs;
}

export const qldJobSource: ExternalJobSource = {
  key: "qld",
  label: "Queensland Government",
  mode: "full",

  async fetchListings(): Promise<RawExternalJob[]> {
    const html = await fetchExternalText(RESULTS_URL);
    return parseListing(html);
  },
};
