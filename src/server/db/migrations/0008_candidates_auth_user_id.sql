UPDATE "applications" SET "candidate_id" = NULL WHERE "candidate_id" IS NOT NULL;--> statement-breakpoint
DELETE FROM "saved_jobs";--> statement-breakpoint
DELETE FROM "candidates";--> statement-breakpoint
ALTER TABLE "candidates" DROP COLUMN "clerk_user_id";--> statement-breakpoint
ALTER TABLE "candidates" ADD COLUMN "auth_user_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_auth_user_id_unique" UNIQUE ("auth_user_id");
