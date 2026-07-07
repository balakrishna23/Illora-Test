import { and, desc, eq, ne } from "drizzle-orm";

import { db } from "@/server/db/client";
import { jobs as jobsTable } from "@/server/db/schema";
import { AU_STATES, JOB_INDUSTRIES, JOB_TYPES } from "@/lib/job-constants";

export { AU_STATES, JOB_INDUSTRIES, JOB_TYPES };

// Deliberately DB-backed via Drizzle against the `jobs` table, pending a real
// JobAdder API integration. Function names/signatures are kept stable so
// call sites don't need to change when that integration eventually lands.

export type Job = {
  id: string;
  slug: string;
  title: string;
  location: string;
  state: string;
  latitude: number;
  longitude: number;
  type: "Permanent" | "Contract" | "Casual";
  industry: string;
  salaryRange?: string;
  postedDate: string;
  closingDate: string;
  referenceNumber: string;
  teaser: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
};

type JobRow = typeof jobsTable.$inferSelect;

function toJob(row: JobRow): Job {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    location: row.location,
    state: row.state,
    latitude: row.latitude,
    longitude: row.longitude,
    type: row.type as Job["type"],
    industry: row.industry,
    salaryRange: row.salaryRange ?? undefined,
    postedDate: row.postedDate,
    closingDate: row.closingDate,
    referenceNumber: row.referenceNumber,
    teaser: row.teaser,
    description: row.description,
    responsibilities: row.responsibilities,
    requirements: row.requirements,
    benefits: row.benefits,
  };
}

export async function getRecentJobs(count = 4): Promise<Job[]> {
  const rows = await db
    .select()
    .from(jobsTable)
    .where(eq(jobsTable.status, "active"))
    .orderBy(desc(jobsTable.postedDate))
    .limit(count);

  return rows.map(toJob);
}

export async function getAllJobs(): Promise<Job[]> {
  const rows = await db
    .select()
    .from(jobsTable)
    .where(eq(jobsTable.status, "active"))
    .orderBy(desc(jobsTable.postedDate));

  return rows.map(toJob);
}

export async function getJobBySlug(slug: string): Promise<Job | null> {
  // Returns the job regardless of status (including closed) so a direct
  // link still resolves; the caller branches on status to show a
  // "no longer accepting applications" state instead of a 404.
  const [row] = await db.select().from(jobsTable).where(eq(jobsTable.slug, slug));
  return row ? toJob(row) : null;
}

export async function getJobsByIndustry(industry: string): Promise<Job[]> {
  const rows = await db
    .select()
    .from(jobsTable)
    .where(and(eq(jobsTable.status, "active"), eq(jobsTable.industry, industry)))
    .orderBy(desc(jobsTable.postedDate));

  return rows.map(toJob);
}

export async function getSimilarJobs(job: Job, count = 3): Promise<Job[]> {
  const rows = await db
    .select()
    .from(jobsTable)
    .where(
      and(
        eq(jobsTable.status, "active"),
        eq(jobsTable.industry, job.industry),
        ne(jobsTable.id, job.id)
      )
    )
    .orderBy(desc(jobsTable.postedDate))
    .limit(count);

  return rows.map(toJob);
}

