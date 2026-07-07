import { and, count, eq, gte } from "drizzle-orm";

import { db } from "@/server/db/client";
import {
  applications,
  contactMessages,
  jobAlerts,
  jobs,
  savedJobs,
  vacancyRequests,
} from "@/server/db/schema";

function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

async function countRows(query: Promise<{ value: number }[]>): Promise<number> {
  const [row] = await query;
  return row?.value ?? 0;
}

export async function getAdminAnalytics() {
  const [
    activeJobs,
    applicationsThisWeek,
    applicationsThisMonth,
    savedJobsCount,
    alertSubscribers,
    alertSubscribersLastWeek,
    contactMessagesTotal,
    contactMessagesNew,
    vacancyRequestsTotal,
    vacancyRequestsNew,
  ] = await Promise.all([
    countRows(db.select({ value: count() }).from(jobs).where(eq(jobs.status, "active"))),
    countRows(
      db
        .select({ value: count() })
        .from(applications)
        .where(gte(applications.submittedAt, daysAgo(7)))
    ),
    countRows(
      db
        .select({ value: count() })
        .from(applications)
        .where(gte(applications.submittedAt, daysAgo(30)))
    ),
    countRows(db.select({ value: count() }).from(savedJobs)),
    countRows(
      db.select({ value: count() }).from(jobAlerts).where(eq(jobAlerts.status, "active"))
    ),
    countRows(
      db
        .select({ value: count() })
        .from(jobAlerts)
        .where(and(eq(jobAlerts.status, "active"), gte(jobAlerts.createdAt, daysAgo(7))))
    ),
    countRows(db.select({ value: count() }).from(contactMessages)),
    countRows(
      db.select({ value: count() }).from(contactMessages).where(eq(contactMessages.status, "new"))
    ),
    countRows(db.select({ value: count() }).from(vacancyRequests)),
    countRows(
      db.select({ value: count() }).from(vacancyRequests).where(eq(vacancyRequests.status, "new"))
    ),
  ]);

  return {
    activeJobs,
    applicationsThisWeek,
    applicationsThisMonth,
    savedJobsCount,
    alertSubscribers,
    alertSubscribersLastWeek,
    contactMessagesTotal,
    contactMessagesNew,
    vacancyRequestsTotal,
    vacancyRequestsNew,
  };
}
