// Client-safe job taxonomy constants. Kept separate from
// src/server/integrations/jobadder.ts (which imports the Postgres client) so
// Client Components can import these without pulling `postgres` into the
// browser bundle.

export const JOB_INDUSTRIES = [
  "IT & Telecommunications",
  "Construction",
  "Healthcare",
  "Data Science",
  "Cyber Security",
  "EV Waste & Recycling",
  "Nursing & Aged Care",
] as const;

export const JOB_TYPES = ["Permanent", "Contract", "Casual"] as const;

export const AU_STATES = ["NSW", "VIC", "QLD", "WA", "SA", "ACT", "NT", "TAS"] as const;
