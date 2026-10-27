import { describe, expect, it } from "vitest";

import { parsePageupCards } from "@/server/integrations/external-jobs/pageup-style";

// Trimmed from a real search.jobs.wa.gov.au response — see the "External
// government job ingestion" plan doc for how this markup was confirmed.
const WA_FIXTURE = `
<article class="col-12 job-search-results-card-col" aria-labelledby="link_job_title_1_0_0">
  <div class="card job-search-results-card">
    <div class="card-body job-search-results-card-body">
      <h3 class="card-title job-search-results-card-title">
        <a id="link_job_title_1_0_0" href="https://search.jobs.wa.gov.au/jobs/clinical-nurse-specialist-6570c251">Clinical Nurse Specialist - Community Mental Health</a>
      </h3>
      <div class="job-component-details">
        <div class="job-component-list job-component-list-department">
          <ul><li class="job-component-icon-and-text job-component-department">
            <i class="fas fa-user-friends" aria-label="Department"></i>
            <span>North Metropolitan Health Service</span>
          </li></ul>
        </div>
        <div class="job-component-list job-component-list-employment_type">
          <ul><li class="job-component-icon-and-text job-component-employment-type">
            <i class="far fa-clock" aria-label="Employment type"></i>
            <span>Permanent - Full Time</span>
          </li></ul>
        </div>
        <ul>
          <li class="job-component-icon-and-text job-component-dropdown-field-5">
            <i class="fas fa-asterisk" aria-label="Salary range"></i>
            <span>From $130,000</span>
          </li>
          <li class="job-component-icon-and-text job-component-dropdown-field-9">
            <i class="fas fa-asterisk" aria-label="Location Description"></i>
            <span>Stirling</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</article>
`;

// Tasmania shares this exact platform, but its closing-date icon carries no
// aria-label — the parser falls back to the job-component-closing-at class.
const TAS_FIXTURE = `
<article class="col-12 job-search-results-card-col">
  <div class="card job-search-results-card">
    <div class="card-body job-search-results-card-body">
      <h3 class="card-title job-search-results-card-title">
        <a href="https://careers.jobs.tas.gov.au/jobs/manager-organisational-development-527368">Manager Organisational Development (527368)</a>
      </h3>
      <div class="job-component-details">
        <ul>
          <li class="job-component-icon-and-text job-component-location">
            <i class="fas fa-location-arrow" aria-label="Location"></i>
            <span>South</span>
          </li>
          <li class="job-component-icon-and-text job-component-employment-type">
            <i class="far fa-clock" aria-label="Employment type"></i>
            <span>Permanent, full-time</span>
          </li>
          <li class="job-component-icon-and-text job-component-closing-at">
            <i class="fas fa-calendar-times"></i>
            <span>Closing at: 14 Sep 2026 - 11:55pm AEST</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</article>
`;

describe("parsePageupCards", () => {
  it("extracts a WA job card via aria-label fields", () => {
    const [job] = parsePageupCards(WA_FIXTURE, { baseUrl: "https://search.jobs.wa.gov.au", state: "WA" });

    expect(job.title).toBe("Clinical Nurse Specialist - Community Mental Health");
    expect(job.externalId).toBe("clinical-nurse-specialist-6570c251");
    expect(job.employerName).toBe("North Metropolitan Health Service");
    expect(job.jobType).toBe("Permanent - Full Time");
    expect(job.location).toBe("Stirling");
    expect(job.salaryRange).toBe("From $130,000");
    expect(job.externalUrl).toBe("https://search.jobs.wa.gov.au/jobs/clinical-nurse-specialist-6570c251");
  });

  it("falls back to the class-derived key when aria-label is absent (TAS closing date)", () => {
    const [job] = parsePageupCards(TAS_FIXTURE, { baseUrl: "https://careers.jobs.tas.gov.au", state: "TAS" });

    expect(job.title).toBe("Manager Organisational Development (527368)");
    expect(job.location).toBe("South");
    expect(job.closingDate).toBe("14 Sep 2026 - 11:55pm AEST");
  });

  it("returns no jobs for a page with no matching cards", () => {
    expect(parsePageupCards("<html><body>No results</body></html>", { baseUrl: "https://example.com", state: "WA" })).toEqual([]);
  });
});
