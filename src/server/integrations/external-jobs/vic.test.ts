import { afterEach, describe, expect, it, vi } from "vitest";

import { fetchExternalText } from "@/server/integrations/external-jobs/http";
import { vicJobSource } from "@/server/integrations/external-jobs/vic";

vi.mock("@/server/integrations/external-jobs/http", () => ({
  fetchExternalText: vi.fn(),
  sleep: vi.fn().mockResolvedValue(undefined),
}));

// Trimmed from a real careers.vic.gov.au/jobs?keywords= response.
const VIC_PAGE_HTML = `
<div class="views-row"><rpl-content class="job-searchResult">
  <div class="job-searchResult-header">
    <div class="job-searchResult-header__title">
      <a href="/job/senior-corporate-lawyer-83886"><h3>Senior Corporate Lawyer</h3></a>
      <p>State Trustees Limited</p>
    </div>
  </div>
  <div class="job-searchResult-detailsWrapper">
    <div class="job-searchResult-details"><p><strong>Work Type:</strong></p><p>Fixed-term - Full-time</p></div>
    <div class="job-searchResult-details"><p><strong>Salary:</strong></p><p>$123,963 - $179,180</p></div>
    <div class="job-searchResult-details"><p><strong>Location:</strong></p><p>Melbourne - Western suburbs</p></div>
    <div class="job-searchResult-details"><p><strong>Applications close:</strong></p><p>Sunday 13 September 2026</p></div>
  </div>
  <div class="job-searchResult-description">
    <div><p>Provide legal services, including documentation and advice.</p></div>
  </div>
</rpl-content></div>
`;

describe("vicJobSource.fetchListings", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("parses a job card and stops once a page returns no results", async () => {
    vi.mocked(fetchExternalText)
      .mockResolvedValueOnce(VIC_PAGE_HTML)
      .mockResolvedValueOnce("<html><body>no more jobs</body></html>");

    const jobs = await vicJobSource.fetchListings();

    expect(fetchExternalText).toHaveBeenCalledTimes(2);
    expect(jobs).toHaveLength(1);
    expect(jobs[0]).toMatchObject({
      externalId: "83886",
      title: "Senior Corporate Lawyer",
      employerName: "State Trustees Limited",
      location: "Melbourne - Western suburbs",
      jobType: "Fixed-term - Full-time",
      salaryRange: "$123,963 - $179,180",
      closingDate: "Sunday 13 September 2026",
      externalUrl: "https://www.careers.vic.gov.au/job/senior-corporate-lawyer-83886",
    });
  });

  it("stops immediately when the first page has no jobs", async () => {
    vi.mocked(fetchExternalText).mockResolvedValueOnce("<html><body>none</body></html>");

    const jobs = await vicJobSource.fetchListings();

    expect(fetchExternalText).toHaveBeenCalledTimes(1);
    expect(jobs).toEqual([]);
  });
});
