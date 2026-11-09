import { describe, expect, it, vi } from "vitest";

import { normalizeJob } from "@/features/job-ingestion/queries";
import type { ExternalJobSource, RawExternalJob } from "@/features/job-ingestion/types";

// queries.ts imports the Drizzle client at module scope; mocked here purely
// so importing normalizeJob doesn't require a real DATABASE_URL in the test
// environment (same pattern as job-alerts/actions.test.ts).
vi.mock("@/server/db/client", () => ({ db: {} }));

// upsertExternalJob/processJobIngestion touch the DB via Drizzle's chained
// query builder, which isn't meaningfully testable without a real test
// database (CLAUDE.md: don't mock the DB for query functions) — deliberately
// out of scope here. normalizeJob is pure and carries the actual risk
// (date/job-type parsing, geocoding fallback), so it's covered thoroughly
// instead.

function fullSource(overrides: Partial<ExternalJobSource> = {}): ExternalJobSource {
  return {
    key: "wa",
    label: "WA Government",
    mode: "full",
    fetchListings: async () => [],
    ...overrides,
  };
}

function rawJob(overrides: Partial<RawExternalJob> = {}): RawExternalJob {
  return {
    externalId: "abc-123",
    title: "Senior Data Analyst",
    location: "Perth",
    state: "WA",
    jobType: "Permanent - Full Time",
    teaser: "A short teaser about the role.",
    description: "A much longer description of the role and its duties.",
    externalUrl: "https://search.jobs.wa.gov.au/jobs/senior-data-analyst",
    ...overrides,
  };
}

describe("normalizeJob", () => {
  it("builds a slug from the source key and external id", () => {
    const job = normalizeJob(rawJob({ externalId: "ABC 123!" }), fullSource(), "Data Analytics");
    expect(job.slug).toBe("wa-abc-123");
  });

  it("tags ingestion metadata and defaults status-relevant fields", () => {
    const job = normalizeJob(rawJob(), fullSource(), "Data Analytics");
    expect(job.source).toBe("wa");
    expect(job.sourceLabel).toBe("WA Government");
    expect(job.externalId).toBe("abc-123");
    expect(job.industry).toBe("Data Analytics");
    expect(job.importedAt).toBeInstanceOf(Date);
  });

  it.each([
    ["Casual", "Casual"],
    ["Ongoing (Permanent) - Full Time", "Permanent"],
    ["Fixed (Temporary) - Full Time", "Contract"],
    ["Permanent, full-time", "Permanent"],
    ["Some unrecognized wording", "Permanent"],
  ])("maps job type text %s to %s", (raw, expected) => {
    const job = normalizeJob(rawJob({ jobType: raw }), fullSource(), "Data Analytics");
    expect(job.type).toBe(expected);
  });

  it.each([
    ["17/09/2026", "2026-09-17"],
    ["2026-09-17T23:59:59+10:00", "2026-09-17"],
    ["Sunday 13 September 2026", "2026-09-13"],
    ["14 Sep 2026 - 11:55pm AEST", "2026-09-14"],
  ])("parses closing date %s to ISO %s", (raw, expected) => {
    const job = normalizeJob(rawJob({ closingDate: raw }), fullSource(), "Data Analytics");
    expect(job.closingDate).toBe(expected);
  });

  it("falls back to 'Ongoing' when the closing date can't be parsed", () => {
    const job = normalizeJob(rawJob({ closingDate: undefined }), fullSource(), "Data Analytics");
    expect(job.closingDate).toBe("Ongoing");
  });

  it("uses the raw job's own coordinates when provided", () => {
    const job = normalizeJob(rawJob({ latitude: -31.9, longitude: 115.8 }), fullSource(), "Data Analytics");
    expect(job.latitude).toBe(-31.9);
    expect(job.longitude).toBe(115.8);
  });

  it("falls back to a state centroid when no coordinates are given", () => {
    const job = normalizeJob(rawJob({ location: "Some Unknown Town", state: "WA" }), fullSource(), "Data Analytics");
    expect(job.latitude).toBeCloseTo(-31.9505, 2);
    expect(job.longitude).toBeCloseTo(115.8605, 2);
  });

  it("falls back to NSW when the state text isn't a recognized AU state", () => {
    const job = normalizeJob(rawJob({ state: "Not A State" }), fullSource(), "Data Analytics");
    expect(job.state).toBe("NSW");
  });

  it("only carries the short teaser as description for reference-mode sources", () => {
    const source = fullSource({ mode: "reference" });
    const job = normalizeJob(
      rawJob({ teaser: "Short teaser only.", description: "Full body that must not be reproduced." }),
      source,
      "Data Analytics"
    );
    expect(job.description).toBe("Short teaser only.");
  });

  it("carries the full description for full-mode sources", () => {
    const job = normalizeJob(rawJob({ description: "The full body." }), fullSource({ mode: "full" }), "Data Analytics");
    expect(job.description).toBe("The full body.");
  });
});
