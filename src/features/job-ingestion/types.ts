import type { jobs } from "@/server/db/schema";

export type { RawExternalJob, ExternalJobSource, IngestionSourceResult } from "@/server/integrations/external-jobs/types";

export type NormalizedJob = typeof jobs.$inferInsert;
