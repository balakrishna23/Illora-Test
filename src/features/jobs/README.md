# Jobs

Public job search/listing UI at `/jobs` and `/jobs/[slug]`. All job data is
sourced live from `src/server/integrations/jobadder` (the ATS), not the
Drizzle DB — there's no `queries.ts`/`actions.ts` in this folder because
there's nothing to mutate here (applying is a separate flow under
`features/candidates`).

## What it does

- `JobsClient` — client-side search/filter/sort over an already-fetched
  `Job[]` list (keyword, industry, state, location), fed by the server
  component at `app/jobs/page.tsx`.
- `JobSearchForm` — the compact search box reused in the hero and elsewhere.
- `JobListCard` — one row in the results list, with a save-job toggle for
  signed-in candidates.
- `JobLocationMap` — embeds an OpenStreetMap iframe centered on a job's
  lat/long on the job detail page.

## Gotchas

- Filtering/sorting happens entirely client-side over the full job list
  (`JobsClient`) — fine at current volumes; revisit if the live JobAdder
  feed grows large enough that shipping the whole list to the client is
  wasteful.
- `JobLocationMap` needs `latitude`/`longitude` on the job record (admin-set
  in `features/admin/jobs`, or geocoded approximately by
  `features/job-ingestion` for external jobs) — jobs without coordinates
  won't render a map.
- `Job.source !== "illoura"` means the row came from a government job board
  via `features/job-ingestion`, not one of Illoura's own client vacancies.
  `JobListCard` shows a source badge for these; `app/jobs/[slug]/page.tsx`
  routes "Apply" to the original posting instead of Illoura's own candidate
  pipeline in that case — don't treat `job.source`/`sourceLabel`/
  `externalUrl` as optional metadata when touching either of those files.
