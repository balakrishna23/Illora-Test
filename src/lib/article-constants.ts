// Client-safe Knowledge Hub taxonomy. Kept separate from
// src/features/knowledge-hub/queries.ts (which imports the Postgres client)
// so Client Components can import this without pulling `postgres` into the
// browser bundle.

export const ARTICLE_CATEGORIES = [
  "Hiring Trends",
  "Candidate Advice",
  "First Nations Procurement",
  "Industry Insights",
] as const;
