# Admin — Jobs

Admin CRUD for job listings at `/admin/jobs`.

Note this is distinct from the public `features/jobs` folder: live job
*display* is sourced from JobAdder (the ATS), but this admin surface writes
to the local `jobs` Drizzle table directly. (If/when JobAdder becomes the
system of record for creation too, this will need reconciling — see
CLAUDE.md's JobAdder integration note.)

## What it does

- Create/update a job listing, including free-text `responsibilities`/
  `requirements`/`benefits` fields that are newline-split into arrays
  (`listField()`).
- `closeJob` marks status `closed` without deleting the row (keeps history);
  `deleteJob` hard-deletes.
- Every mutation revalidates `/admin/jobs`, `/jobs`, and (on update) the
  job's own `/jobs/[slug]` page.

## Key entry points

- `actions.ts` — `createJob`, `updateJob`, `closeJob`, `deleteJob`.
- `queries.ts` — read queries backing the admin list/edit views.
- `components/` — `JobForm` (shared create/edit form), `JobRowActions`.

## Gotchas

- `slug`, `state`, `type`, and `industry` are validated against fixed enums
  from `server/integrations/jobadder` (`AU_STATES`, `JOB_TYPES`,
  `JOB_INDUSTRIES`) — adding a new industry/state means updating that
  shared source, not this file.
- Prefer `closeJob` over `deleteJob` for roles that filled normally; use
  `deleteJob` only for listings created in error.
