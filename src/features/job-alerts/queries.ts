import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";

import { db } from "@/server/db/client";
import { jobAlertSendLog, jobAlerts } from "@/server/db/schema";
import { getAllJobs, type Job } from "@/server/integrations/jobadder";
import { sendJobAlertEmail } from "@/server/integrations/resend";
import type { JobAlertCriteria } from "@/features/job-alerts/types";

type JobAlert = typeof jobAlerts.$inferSelect;

export async function createJobAlert(
  input: JobAlertCriteria & { email: string }
): Promise<JobAlert> {
  const [alert] = await db
    .insert(jobAlerts)
    .values({
      email: input.email,
      industry: input.industry || null,
      state: input.state || null,
      jobType: input.jobType || null,
      keyword: input.keyword || null,
      unsubscribeToken: randomUUID(),
    })
    .returning();

  return alert;
}

export async function getActiveJobAlerts(): Promise<JobAlert[]> {
  return db.select().from(jobAlerts).where(eq(jobAlerts.status, "active"));
}

export async function unsubscribeJobAlert(token: string): Promise<boolean> {
  const [updated] = await db
    .update(jobAlerts)
    .set({ status: "unsubscribed", updatedAt: new Date() })
    .where(and(eq(jobAlerts.unsubscribeToken, token), eq(jobAlerts.status, "active")))
    .returning();

  return Boolean(updated);
}

export async function markJobAlertNotified(
  alertId: string,
  matchedJobIds: string[],
  previouslyNotifiedJobIds: string[]
): Promise<void> {
  await db
    .update(jobAlerts)
    .set({
      lastNotifiedJobIds: [...previouslyNotifiedJobIds, ...matchedJobIds],
      updatedAt: new Date(),
    })
    .where(eq(jobAlerts.id, alertId));

  await db.insert(jobAlertSendLog).values({ jobAlertId: alertId, matchedJobIds });
}

export function findMatchingJobs(alert: JobAlert, jobs: Job[]): Job[] {
  const notified = new Set(alert.lastNotifiedJobIds);
  const keyword = alert.keyword?.toLowerCase();

  return jobs.filter((job) => {
    if (notified.has(job.id)) return false;
    if (alert.industry && job.industry !== alert.industry) return false;
    if (alert.state && job.state !== alert.state) return false;
    if (alert.jobType && job.type !== alert.jobType) return false;
    if (
      keyword &&
      !job.title.toLowerCase().includes(keyword) &&
      !job.teaser.toLowerCase().includes(keyword)
    ) {
      return false;
    }
    return true;
  });
}

export async function processJobAlertDigest(): Promise<{ sent: number }> {
  const [jobs, alerts] = await Promise.all([getAllJobs(), getActiveJobAlerts()]);

  let sent = 0;
  for (const alert of alerts) {
    const matches = findMatchingJobs(alert, jobs);
    if (matches.length === 0) continue;

    const { success } = await sendJobAlertEmail({
      to: alert.email,
      matches,
      unsubscribeToken: alert.unsubscribeToken,
    });

    if (success) {
      await markJobAlertNotified(
        alert.id,
        matches.map((job) => job.id),
        alert.lastNotifiedJobIds
      );
      sent += 1;
    }
  }

  return { sent };
}
