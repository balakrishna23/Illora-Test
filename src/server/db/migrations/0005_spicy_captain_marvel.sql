CREATE TABLE "articles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"category" text NOT NULL,
	"publish_date" text NOT NULL,
	"reading_time_minutes" integer NOT NULL,
	"excerpt" text NOT NULL,
	"body" text NOT NULL,
	"author_name" text NOT NULL,
	"author_role" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "articles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "campaign_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"signature" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"years_operating" integer NOT NULL,
	"candidates_placed" integer NOT NULL,
	"client_retention_pct" integer NOT NULL,
	"active_employers" integer NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"role" text NOT NULL,
	"cultural_connection" text,
	"bio" text NOT NULL,
	"linked_in" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "email_campaigns" ADD COLUMN "reply_to" text;--> statement-breakpoint
ALTER TABLE "email_campaigns" ADD COLUMN "attachment_r2_key" text;--> statement-breakpoint
ALTER TABLE "email_campaigns" ADD COLUMN "attachment_filename" text;