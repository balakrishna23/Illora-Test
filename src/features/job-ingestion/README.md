# Job ingestion

Pulls new postings from Australian government job boards into the `jobs`
table as `status: "pending"`, for an admin to approve via `/admin/jobs`
before they appear on the public `/jobs` page.

## What it does

- `queries.ts` — `normalizeJob()` maps a source's raw listing onto the
  `jobs` table's columns (job type mapping, date parsing, geocoding
  fallback via `@/lib/au-geocoding`). `upsertExternalJob()` dedupes on
  `(source, externalId)` and deliberately never resets `status` on an
  update, so a previously approved/rejected job doesn't reappear as pending
  just because a later run saw it again. `processJobIngestion()` runs every
  registered source and returns a per-source summary.
- Triggered by `src/app/api/cron/job-ingest/route.ts` (bearer-secret gated,
  same pattern as `/api/cron/job-alerts`), hit by an external scheduler —
  see DEPLOYMENT.md.

## Key entry points

- `queries.ts` — `normalizeJob`, `upsertExternalJob`, `processJobIngestion`.
- The actual per-source scraping/API logic lives in
  `src/server/integrations/external-jobs/` (own README there).

## Gotchas

- `upsertExternalJob`/`processJobIngestion` aren't unit tested — they touch
  the DB via Drizzle's chained query builder, which CLAUDE.md says not to
  mock; that needs a real test database/transaction-rollback setup this repo
  doesn't have yet. `normalizeJob` (the part that actually carries risk —
  date/job-type parsing, geocoding) is tested thoroughly in `queries.test.ts`.
- Every source is capped to a handful of pages/one API call per run (see
  each adapter's own comment in `external-jobs/`) — this is an incremental
  "catch new postings each run" model, not a full historical sync.
