// Client-safe job taxonomy constants. Kept separate from
// src/server/integrations/jobadder.ts (which imports the Postgres client) so
// Client Components can import these without pulling `postgres` into the
// browser bundle.

// Illoura recruits only in these three specialisms. Jobs, CV submissions,
// vacancy requests and job alerts are all validated against this list.
export const JOB_INDUSTRIES = ["AI Engineering", "Cyber Security", "Data Analytics"] as const;

export type JobIndustry = (typeof JOB_INDUSTRIES)[number];

export function isJobIndustry(value: string): value is JobIndustry {
  return (JOB_INDUSTRIES as readonly string[]).includes(value);
}

export const JOB_TYPES = ["Permanent", "Contract", "Casual"] as const;

export const AU_STATES = ["NSW", "VIC", "QLD", "WA", "SA", "ACT", "NT", "TAS"] as const;
