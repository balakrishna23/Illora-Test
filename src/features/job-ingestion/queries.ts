import { and, eq } from "drizzle-orm";

import { db } from "@/server/db/client";
import { jobs, jobTypeValues } from "@/server/db/schema";
import { AU_STATES } from "@/lib/job-constants";
import { geocodeAuLocation } from "@/lib/au-geocoding";
import { EXTERNAL_JOB_SOURCES } from "@/server/integrations/external-jobs";
import type {
  ExternalJobSource,
  IngestionSourceResult,
  NormalizedJob,
  RawExternalJob,
} from "@/features/job-ingestion/types";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function mapJobType(raw: string): (typeof jobTypeValues)[number] {
  if (/casual/i.test(raw)) return "Casual";
  if (/contract|fixed|temp/i.test(raw)) return "Contract";
  return "Permanent";
}

function normalizeState(raw: string): (typeof AU_STATES)[number] {
  const upper = raw.trim().toUpperCase();
  return (AU_STATES as readonly string[]).includes(upper) ? (upper as (typeof AU_STATES)[number]) : "NSW";
}

// Handles the handful of date shapes the 8 sources actually send: NT's
// DD/MM/YYYY, ISO (optionally with a time part), and "13 September 2026" /
// "14 Sep 2026 - 11:55pm AEST" style long-form text (VIC/TAS). Returns
// undefined rather than guessing when nothing matches.
function parseDateToIso(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const text = raw.trim();

  const dmy = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dmy) {
    const [, d, m, y] = dmy;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  const iso = text.match(/^(\d{4}-\d{2}-\d{2})/);
  if (iso) return iso[1];

  const cleaned = text
    .replace(/^[A-Za-z]+,?\s+(?=\d)/, "")
    .split(" - ")[0]
    .trim();

  const parsed = new Date(cleaned);
  if (Number.isNaN(parsed.getTime())) return undefined;

  // Read back the LOCAL calendar date, not toISOString()'s UTC one — the
  // input has no timezone info, so `new Date(...)` parses it as local
  // midnight, and converting that to UTC can roll it onto the wrong day.
  const y = parsed.getFullYear();
  const m = String(parsed.getMonth() + 1).padStart(2, "0");
  const d = String(parsed.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function normalizeJob(raw: RawExternalJob, source: ExternalJobSource): NormalizedJob {
  const state = normalizeState(raw.state);
  const coords =
    raw.latitude !== undefined && raw.longitude !== undefined
      ? { latitude: raw.latitude, longitude: raw.longitude }
      : geocodeAuLocation(raw.location, state);

  const postedDate = parseDateToIso(raw.postedDate) ?? new Date().toISOString().slice(0, 10);
  const closingDate = parseDateToIso(raw.closingDate) ?? "Ongoing";

  // Reference-mode sources (content-usage policy says "link to, don't
  // reproduce") only ever get a short teaser as their description too — see
  // ExternalJobSource.mode.
  const description = source.mode === "reference" ? raw.teaser : raw.description;

  return {
    slug: `${source.key}-${slugify(raw.externalId)}`,
    title: raw.title,
    location: raw.location,
    state,
    latitude: coords.latitude,
    longitude: coords.longitude,
    type: mapJobType(raw.jobType),
    industry: "Government",
    salaryRange: raw.salaryRange || null,
    postedDate,
    closingDate,
    referenceNumber: raw.externalId,
    teaser: raw.teaser,
    description,
    responsibilities: [],
    requirements: [],
    benefits: [],
    source: source.key,
    sourceLabel: source.label,
    externalId: raw.externalId,
    externalUrl: raw.externalUrl,
    importedAt: new Date(),
  };
}

// Upserts on (source, externalId). Deliberately never resets `status` on an
// update — an admin's approve/reject decision on a previously-seen job must
// survive it reappearing in a later ingestion run; only content fields
// refresh (title changes, salary updates, extended closing dates, etc.).
export async function upsertExternalJob(job: NormalizedJob): Promise<"created" | "updated"> {
  const [existing] = await db
    .select({ id: jobs.id })
    .from(jobs)
    .where(and(eq(jobs.source, job.source!), eq(jobs.externalId, job.externalId!)));

  if (existing) {
    await db
      .update(jobs)
      .set({
        title: job.title,
        location: job.location,
        state: job.state,
        latitude: job.latitude,
        longitude: job.longitude,
        type: job.type,
        salaryRange: job.salaryRange,
        closingDate: job.closingDate,
        teaser: job.teaser,
        description: job.description,
        sourceLabel: job.sourceLabel,
        externalUrl: job.externalUrl,
        importedAt: job.importedAt,
        updatedAt: new Date(),
      })
      .where(eq(jobs.id, existing.id));
    return "updated";
  }

  await db.insert(jobs).values({ ...job, status: "pending" });
  return "created";
}

export async function processJobIngestion(): Promise<IngestionSourceResult[]> {
  const results: IngestionSourceResult[] = [];

  for (const source of EXTERNAL_JOB_SOURCES) {
    const result: IngestionSourceResult = { source: source.key, fetched: 0, created: 0, updated: 0, failed: 0 };

    try {
      const raw = await source.fetchListings();
      result.fetched = raw.length;

      for (const rawJob of raw) {
        try {
          const normalized = normalizeJob(rawJob, source);
          const outcome = await upsertExternalJob(normalized);
          if (outcome === "created") result.created++;
          else result.updated++;
        } catch (err) {
          result.failed++;
          console.error(`processJobIngestion: failed to upsert one job from ${source.key}`, err);
        }
      }
    } catch (err) {
      result.error = err instanceof Error ? err.message : String(err);
      console.error(`processJobIngestion: source ${source.key} failed entirely`, err);
    }

    results.push(result);
  }

  return results;
}
