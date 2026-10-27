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

import { JOB_INDUSTRIES } from "@/lib/job-constants";
import { ARTICLE_CATEGORIES } from "@/lib/article-constants";

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
}).enableRLS();

export const jobAlertSendLog = pgTable("job_alert_send_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobAlertId: uuid("job_alert_id")
    .notNull()
    .references(() => jobAlerts.id),
  sentAt: timestamp("sent_at").notNull().defaultNow(),
  matchedJobIds: jsonb("matched_job_ids").$type<string[]>().notNull(),
}).enableRLS();

export const candidates = pgTable("candidates", {
  id: uuid("id").primaryKey().defaultRandom(),
  // References auth.users.id (Supabase Auth) — a Supabase-managed schema
  // outside Drizzle's ownership, so no cross-schema FK is declared here.
  authUserId: uuid("auth_user_id").notNull().unique(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}).enableRLS();

// Job type/status taxonomies are duplicated here (not imported from features/)
// per CLAUDE.md's server/db boundary; keep in sync with the Zod schemas in
// src/features/*/actions.ts that reference the same values.
export const jobTypeValues = ["Permanent", "Contract", "Casual"] as const;
export const jobStatusValues = ["active", "closed", "pending", "rejected"] as const;

// "illoura" = admin-authored via /admin/jobs. All other values are ingested
// externally by the job-ingestion pipeline (src/features/job-ingestion) from
// the corresponding government job board — see external-jobs/ for the
// per-source adapters and each source's compliance notes.
export const jobSourceValues = [
  "illoura",
  "aps_jobs",
  "workforce_australia",
  "vic",
  "qld",
  "wa",
  "tas",
  "act",
  "nt",
] as const;

export const jobs = pgTable(
  "jobs",
  {
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
    // Ingestion metadata — all null for admin-authored ("illoura") jobs.
    source: text("source", { enum: jobSourceValues }).notNull().default("illoura"),
    sourceLabel: text("source_label"),
    externalId: text("external_id"),
    externalUrl: text("external_url"),
    importedAt: timestamp("imported_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  // Dedup key for the ingestion pipeline's upsert. Postgres treats each NULL
  // as distinct for uniqueness purposes, so native "illoura" rows (externalId
  // always null) never collide with each other or with ingested rows.
  (table) => [unique().on(table.source, table.externalId)]
).enableRLS();

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
).enableRLS();

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
  resumeStorageKey: text("resume_storage_key"),
  coverLetterStorageKey: text("cover_letter_storage_key"),
  // Explicit opt-in to marketing/campaign email at the point of submission.
  // The campaign mailer only sends to rows where this is true.
  marketingConsent: boolean("marketing_consent").notNull().default(false),
  status: text("status", { enum: applicationStatusValues })
    .notNull()
    .default("submitted"),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}).enableRLS();

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
}).enableRLS();

export const campaignAudienceValues = [
  "candidates",
  ...JOB_INDUSTRIES.map((industry) => `candidates:${industry}` as const),
  "clients",
  "general",
  "all",
] as const;
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
  replyTo: text("reply_to"),
  attachmentStorageKey: text("attachment_storage_key"),
  attachmentFilename: text("attachment_filename"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
}).enableRLS();

// Global opt-out list for campaign email. Job alerts keep their own per-alert
// unsubscribe; this suppresses an address from all admin-sent campaigns.
export const emailSuppressions = pgTable("email_suppressions", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}).enableRLS();

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
}).enableRLS();

// Singleton — the app always reads/updates the first (and only) row. Replaces
// the retired Sanity `siteStats` document type.
export const siteSettings = pgTable("site_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  yearsOperating: integer("years_operating").notNull(),
  candidatesPlaced: integer("candidates_placed").notNull(),
  clientRetentionPct: integer("client_retention_pct").notNull(),
  activeEmployers: integer("active_employers").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}).enableRLS();

// Replaces the retired Sanity `teamMember` document type.
export const teamMembers = pgTable("team_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  culturalConnection: text("cultural_connection"),
  bio: text("bio").notNull(),
  linkedIn: text("linked_in"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}).enableRLS();

export const articleCategoryValues = ARTICLE_CATEGORIES;

// Knowledge Hub posts. Replaces the retired Sanity `article` document type.
export const articles = pgTable("articles", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  category: text("category", { enum: articleCategoryValues }).notNull(),
  publishDate: text("publish_date").notNull(),
  readingTimeMinutes: integer("reading_time_minutes").notNull(),
  excerpt: text("excerpt").notNull(),
  body: text("body").notNull(),
  authorName: text("author_name").notNull(),
  authorRole: text("author_role").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}).enableRLS();

// Singleton — shared signature appended to every campaign send unless the
// admin unchecks it in the composer.
export const campaignSettings = pgTable("campaign_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  signature: text("signature"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}).enableRLS();
