import { desc, eq } from "drizzle-orm";

import { db } from "@/server/db/client";
import { jobs } from "@/server/db/schema";

export type AdminJob = typeof jobs.$inferSelect;

export async function getAllJobsAdmin(): Promise<AdminJob[]> {
  return db.select().from(jobs).orderBy(desc(jobs.createdAt));
}

export async function getJobByIdAdmin(id: string): Promise<AdminJob | null> {
  const [row] = await db.select().from(jobs).where(eq(jobs.id, id));
  return row ?? null;
}
