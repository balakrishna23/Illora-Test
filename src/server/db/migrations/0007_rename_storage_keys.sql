ALTER TABLE "applications" RENAME COLUMN "resume_r2_key" TO "resume_storage_key";--> statement-breakpoint
ALTER TABLE "applications" RENAME COLUMN "cover_letter_r2_key" TO "cover_letter_storage_key";--> statement-breakpoint
ALTER TABLE "email_campaigns" RENAME COLUMN "attachment_r2_key" TO "attachment_storage_key";
