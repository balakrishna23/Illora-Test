import { and, count, eq, gte } from "drizzle-orm";

import { db } from "@/server/db/client";
import { supabaseAdmin } from "@/server/integrations/supabase-admin";
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

const ACCOUNTS_COUNT_TIMEOUT_MS = 8_000;

async function getTotalAccountsCreated(): Promise<number> {
  // perPage: 1 — only the `total` field from the pagination metadata is
  // needed, not the actual user list.
  // Race against a timeout: this is the one dashboard stat that calls
  // Supabase's Auth Admin API rather than our own Postgres connection, and
  // a slow/hung call here would otherwise block the entire page (it's
  // awaited inside a Promise.all with everything else) until the host's
  // own gateway timeout kicks in, well before this component gets a
  // chance to catch and fall back to 0 like it does for a normal error.
  const timeout = new Promise<{ data: null; error: Error }>((resolve) =>
    setTimeout(
      () => resolve({ data: null, error: new Error("listUsers timed out") }),
      ACCOUNTS_COUNT_TIMEOUT_MS
    )
  );

  const { data, error } = await Promise.race([
    supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1 }),
    timeout,
  ]);
  if (error || !data) {
    console.error("getTotalAccountsCreated: listUsers failed", error);
    return 0;
  }
  return data.total;
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
    totalAccountsCreated,
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
    getTotalAccountsCreated(),
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
    totalAccountsCreated,
  };
}
