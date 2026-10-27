ALTER TABLE "jobs" ADD COLUMN "source" text DEFAULT 'illoura' NOT NULL;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "source_label" text;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "external_id" text;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "external_url" text;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "imported_at" timestamp;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_source_external_id_unique" UNIQUE("source","external_id");