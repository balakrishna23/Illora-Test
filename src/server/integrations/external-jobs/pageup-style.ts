import * as cheerio from "cheerio";

import type { RawExternalJob } from "@/server/integrations/external-jobs/types";

// Shared parser for the job board platform used by both WA Government Jobs
// (search.jobs.wa.gov.au) and Tasmanian Government Jobs
// (careers.jobs.tas.gov.au) — identical server-rendered markup on both
// (`job-search-results-card` / `job-component-*`), just different content
// and base URLs. Each `job-component-icon-and-text` <li> carries a
// `job-component-<field>` class identifying what it holds.
export function parsePageupCards(
  html: string,
  opts: { baseUrl: string; state: string }
): RawExternalJob[] {
  const $ = cheerio.load(html);
  const jobs: RawExternalJob[] = [];

  $("article.job-search-results-card-col").each((_, el) => {
    const $card = $(el);
    const link = $card.find("h3.job-search-results-card-title a").first();
    const href = link.attr("href");
    const title = link.text().trim();
    if (!href || !title) return;

    // Both sites label most icons via aria-label ("Department", "Location
    // Description", ...) — prefer that (kebab-cased) as the field key since
    // it's consistent across both platforms; the numbered dropdown-field-N
    // classes alone aren't (their meaning shifts per posting). Fall back to
    // the semantic job-component-<field> class when aria-label is absent
    // (e.g. TAS's closing-date icon has none).
    const fields: Record<string, string> = {};
    $card.find("li.job-component-icon-and-text").each((_, li) => {
      const $li = $(li);
      const ariaLabel = $li.find("i").first().attr("aria-label");
      const fieldClass = ($li.attr("class") ?? "")
        .split(/\s+/)
        .find((c) => c.startsWith("job-component-") && c !== "job-component-icon-and-text");
      const key = ariaLabel
        ? ariaLabel.trim().toLowerCase().replace(/\s+/g, "-")
        : fieldClass?.replace("job-component-", "");
      if (!key) return;
      fields[key] = $li.find("span").first().text().trim();
    });

    const externalId = href.split("/").filter(Boolean).pop() ?? href;
    const location = fields["location-description"] ?? fields["location"] ?? opts.state;
    const jobType = fields["employment-type"] ?? "";
    const description = [fields["department"], fields["category"], title].filter(Boolean).join(" — ");
    const closingRaw = fields["closing-at"]?.replace(/^Closing at:\s*/i, "");

    jobs.push({
      externalId,
      title,
      employerName: fields["department"],
      location,
      state: opts.state,
      jobType,
      closingDate: closingRaw,
      teaser: description.slice(0, 240),
      description,
      externalUrl: new URL(href, opts.baseUrl).toString(),
      salaryRange: fields["salary-range"] || fields["pay_scale"] || undefined,
    });
  });

  return jobs;
}
