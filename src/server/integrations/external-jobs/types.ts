import type { jobSourceValues } from "@/server/db/schema";

export type ExternalJobSourceKey = Exclude<(typeof jobSourceValues)[number], "illoura">;

// Raw shape each adapter extracts before normalizeJob() maps it onto the
// `jobs` table's columns. Left as loose/free-text here deliberately — each
// source spells job type, location, etc. differently; normalizeJob is the
// one place that reconciles that against Illoura's fixed enums.
export type RawExternalJob = {
  externalId: string;
  title: string;
  employerName?: string;
  location: string;
  state: string;
  jobType: string;
  postedDate?: string;
  closingDate?: string;
  teaser: string;
  description: string;
  externalUrl: string;
  salaryRange?: string;
  latitude?: number;
  longitude?: number;
};

export type ExternalJobSourceMode = "full" | "reference";

export interface ExternalJobSource {
  key: ExternalJobSourceKey;
  label: string;
  // "reference" sources are only allowed to be linked to, per their stated
  // usage policy — adapters for these must never populate `description`
  // beyond what's already public as a short teaser.
  mode: ExternalJobSourceMode;
  fetchListings(): Promise<RawExternalJob[]>;
}

export type IngestionSourceResult = {
  source: ExternalJobSourceKey;
  fetched: number;
  created: number;
  updated: number;
  // Postings outside Illoura's specialisms, dropped before upsert.
  skipped: number;
  failed: number;
  error?: string;
};
