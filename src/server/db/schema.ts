import {
  boolean,
  doublePrecision,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

export const jobAlerts = pgTable("job_alerts", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  industry: text("industry"),
  state: text("state"),
  jobType: text("job_type"),
  keyword: text("keyword"),
  unsubscribeToken: text("unsubscribe_token").notNull().unique(),
  status: text("status", { enum: ["active", "unsubscribed"] })
    .notNull()
    .default("active"),
  lastNotifiedJobIds: jsonb("last_notified_job_ids")
    .$type<string[]>()
    .notNull()
    .default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const jobAlertSendLog = pgTable("job_alert_send_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobAlertId: uuid("job_alert_id")
    .notNull()
    .references(() => jobAlerts.id),
  sentAt: timestamp("sent_at").notNull().defaultNow(),
  matchedJobIds: jsonb("matched_job_ids").$type<string[]>().notNull(),
});

export const candidates = pgTable("candidates", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkUserId: text("clerk_user_id").notNull().unique(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Job type/status taxonomies are duplicated here (not imported from features/)
// per CLAUDE.md's server/db boundary; keep in sync with the Zod schemas in
// src/features/*/actions.ts that reference the same values.
export const jobTypeValues = ["Permanent", "Contract", "Casual"] as const;
export const jobStatusValues = ["active", "closed"] as const;

export const jobs = pgTable("jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  location: text("location").notNull(),
  state: text("state").notNull(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  type: text("type", { enum: jobTypeValues }).notNull(),
  industry: text("industry").notNull(),
  salaryRange: text("salary_range"),
  postedDate: text("posted_date").notNull(),
  closingDate: text("closing_date").notNull(),
  referenceNumber: text("reference_number").notNull(),
  teaser: text("teaser").notNull(),
  description: text("description").notNull(),
  responsibilities: jsonb("responsibilities").$type<string[]>().notNull().default([]),
  requirements: jsonb("requirements").$type<string[]>().notNull().default([]),
  benefits: jsonb("benefits").$type<string[]>().notNull().default([]),
  status: text("status", { enum: jobStatusValues }).notNull().default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const savedJobs = pgTable(
  "saved_jobs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    candidateId: uuid("candidate_id")
      .notNull()
      .references(() => candidates.id),
    jobId: uuid("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),
    jobSlug: text("job_slug").notNull(),
    jobTitle: text("job_title").notNull(),
    savedAt: timestamp("saved_at").notNull().defaultNow(),
  },
  (table) => [unique().on(table.candidateId, table.jobId)]
);

export const applicationStatusValues = [
  "submitted",
  "under_review",
  "interviewing",
  "offered",
  "rejected",
  "withdrawn",
] as const;

// Australian Government security clearance levels (AGSVA). NV1/NV2 = Negative
// Vetting 1/2; TSPV = Top Secret Positive Vetting. Relevant for ICT/government
// roles. Keep in sync with the Zod enum in candidates/actions.ts.
export const securityClearanceValues = [
  "None",
  "Baseline",
  "NV1",
  "NV2",
  "TSPV",
] as const;

// Represents every CV/application submission, not only ones from signed-in
// candidates — candidateId and jobId are both nullable to support anonymous
// submitters and jobs that are later deleted.
export const applications = pgTable("applications", {
  id: uuid("id").primaryKey().defaultRandom(),
  candidateId: uuid("candidate_id").references(() => candidates.id),
  jobId: uuid("job_id").references(() => jobs.id, { onDelete: "set null" }),
  jobSlug: text("job_slug"),
  jobTitle: text("job_title"),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  targetIndustry: text("target_industry").notNull(),
  currentRole: text("current_role").notNull(),
  linkedIn: text("linked_in"),
  securityClearance: text("security_clearance", { enum: securityClearanceValues })
    .notNull()
    .default("None"),
  resumeR2Key: text("resume_r2_key"),
  coverLetterR2Key: text("cover_letter_r2_key"),
  // Explicit opt-in to marketing/campaign email at the point of submission.
  // The campaign mailer only sends to rows where this is true.
  marketingConsent: boolean("marketing_consent").notNull().default(false),
  status: text("status", { enum: applicationStatusValues })
    .notNull()
    .default("submitted"),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const vacancyRequestStatusValues = ["new", "contacted", "closed"] as const;

export const vacancyRequests = pgTable("vacancy_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyName: text("company_name").notNull(),
  contactName: text("contact_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  roleTitle: text("role_title").notNull(),
  employmentType: text("employment_type", { enum: jobTypeValues }).notNull(),
  location: text("location").notNull(),
  industry: text("industry").notNull(),
  urgency: text("urgency").notNull(),
  message: text("message").notNull(),
  serviceType: text("service_type"),
  marketingConsent: boolean("marketing_consent").notNull().default(false),
  status: text("status", { enum: vacancyRequestStatusValues })
    .notNull()
    .default("new"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const campaignAudienceValues = ["candidates", "clients", "all"] as const;
export const campaignStatusValues = ["sending", "sent", "failed"] as const;

export const emailCampaigns = pgTable("email_campaigns", {
  id: uuid("id").primaryKey().defaultRandom(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  audience: text("audience", { enum: campaignAudienceValues }).notNull(),
  status: text("status", { enum: campaignStatusValues }).notNull().default("sending"),
  recipientCount: integer("recipient_count").notNull().default(0),
  sentCount: integer("sent_count").notNull().default(0),
  failedCount: integer("failed_count").notNull().default(0),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Global opt-out list for campaign email. Job alerts keep their own per-alert
// unsubscribe; this suppresses an address from all admin-sent campaigns.
export const emailSuppressions = pgTable("email_suppressions", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const contactMessageStatusValues = ["new", "read", "replied"] as const;

export const contactMessages = pgTable("contact_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  marketingConsent: boolean("marketing_consent").notNull().default(false),
  status: text("status", { enum: contactMessageStatusValues })
    .notNull()
    .default("new"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
