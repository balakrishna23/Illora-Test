CREATE TABLE "contact_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"subject" text NOT NULL,
	"message" text NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"location" text NOT NULL,
	"state" text NOT NULL,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"type" text NOT NULL,
	"industry" text NOT NULL,
	"salary_range" text,
	"posted_date" text NOT NULL,
	"closing_date" text NOT NULL,
	"reference_number" text NOT NULL,
	"teaser" text NOT NULL,
	"description" text NOT NULL,
	"responsibilities" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"requirements" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"benefits" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "jobs_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "vacancy_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_name" text NOT NULL,
	"contact_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"role_title" text NOT NULL,
	"employment_type" text NOT NULL,
	"location" text NOT NULL,
	"industry" text NOT NULL,
	"urgency" text NOT NULL,
	"message" text NOT NULL,
	"service_type" text,
	"status" text DEFAULT 'new' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "applications" ALTER COLUMN "candidate_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "applications" ALTER COLUMN "job_id" SET DATA TYPE uuid USING "job_id"::uuid;--> statement-breakpoint
ALTER TABLE "applications" ALTER COLUMN "job_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "applications" ALTER COLUMN "job_slug" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "applications" ALTER COLUMN "job_title" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "saved_jobs" ALTER COLUMN "job_id" SET DATA TYPE uuid USING "job_id"::uuid;--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "email" text NOT NULL;--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "phone" text NOT NULL;--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "target_industry" text NOT NULL;--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "current_role" text NOT NULL;--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "linked_in" text;--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "cover_letter_r2_key" text;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_jobs" ADD CONSTRAINT "saved_jobs_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;