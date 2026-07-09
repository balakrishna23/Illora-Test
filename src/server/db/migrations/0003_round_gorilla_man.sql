ALTER TABLE "applications" ADD COLUMN "marketing_consent" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "contact_messages" ADD COLUMN "marketing_consent" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "vacancy_requests" ADD COLUMN "marketing_consent" boolean DEFAULT false NOT NULL;