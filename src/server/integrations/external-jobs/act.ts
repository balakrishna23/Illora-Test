import * as cheerio from "cheerio";

import { fetchExternalText } from "@/server/integrations/external-jobs/http";
import type { ExternalJobSource, RawExternalJob } from "@/server/integrations/external-jobs/types";

// ACT Government (Jobs ACT). The whole opportunities list renders as one
// flat, fully server-rendered page — no pagination needed. Jobs aren't
// nested under their agency's heading in the DOM; they're siblings that
// follow it, up to the next <h2 class="agency-heading">, so the agency name
// has to be tracked while walking the page in document order.
const BASE_URL = "https://www.jobs.act.gov.au";
const LISTING_URL = `${BASE_URL}/opportunities/all`;

function parseListing(html: string): RawExternalJob[] {
  const $ = cheerio.load(html);
  const jobs: RawExternalJob[] = [];
  let currentAgency = "ACT Government";

  $("h2.agency-heading, a.position-tile").each((_, el) => {
    const $el = $(el);

    if (el.tagName === "h2") {
      currentAgency = $el.text().trim() || currentAgency;
      return;
    }

    const href = $el.attr("href");
    const titleLine = $el.find("h3").first().text().trim();
    if (!href || !titleLine) return;

    const [title, jobType] = titleLine.split("|").map((s) => s.trim());
    const detailText = $el.find(".span50 p").first().text().replace(/\s+/g, " ").trim();
    const closingDate = $el.attr("data-closingdate")?.slice(0, 10);
    const advertisedDate = $el.attr("data-advertiseddate");
    const salary = $el.attr("data-salary");

    const externalId = href.split("/").filter(Boolean).slice(-2).join("-");

    jobs.push({
      externalId,
      title: title || titleLine,
      employerName: currentAgency,
      location: "Canberra",
      state: "ACT",
      jobType: jobType ?? "",
      postedDate: advertisedDate,
      closingDate,
      teaser: detailText.slice(0, 240) || titleLine,
      description: detailText || titleLine,
      externalUrl: new URL(href, BASE_URL).toString(),
      salaryRange: salary ? `From $${Number(salary).toLocaleString("en-AU")}` : undefined,
    });
  });

  return jobs;
}

export const actJobSource: ExternalJobSource = {
  key: "act",
  label: "ACT Government",
  mode: "full",

  async fetchListings(): Promise<RawExternalJob[]> {
    const html = await fetchExternalText(LISTING_URL);
    return parseListing(html);
  },
};
