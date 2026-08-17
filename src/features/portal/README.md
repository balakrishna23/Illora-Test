# Portal

Authenticated candidate account area at `/portal` (saved jobs, applications,
account settings) — gated by `requireUser()` in `src/proxy.ts` and re-checked
in every Server Action here.

## What it does

- Candidates get a `candidates` row lazily created on first portal visit,
  keyed by their Supabase Auth `authUserId` (`getOrCreateCandidate`).
- Save/unsave a job listing (`toggleSaveJob`) — persisted in `saved_jobs`,
  scoped to the candidate.
- View submitted applications (`getApplications`) and saved jobs
  (`getSavedJobs`).
- Change password (`changePassword`) and change email (`changeEmail`)
  through Supabase Auth's `updateUser()`.

## Key entry points

- `actions.ts` — `toggleSaveJob`, `changePassword`, `changeEmail`.
- `queries.ts` — `getCandidateByAuthUserId`, `getOrCreateCandidate`,
  `getSavedJobs`, `isJobSaved`, `saveJob`, `removeSavedJob`,
  `getApplications`.
- `components/` — `SaveJobButton`, `SavedJobsList`, `ApplicationStatusList`,
  `ChangeEmailForm`, `ChangePasswordForm`.

## Gotchas

- `changePassword` re-verifies the current password via
  `signInWithPassword()` before calling `updateUser()` — Supabase's
  `updateUser()` alone doesn't require it, so this is deliberate
  defense-in-depth, not redundant.
- `changeEmail` doesn't apply immediately — Supabase emails a confirmation
  link to the new address first.
- `saved_jobs` stores a denormalized snapshot (`jobId`/`jobSlug`/`jobTitle`)
  at save time since job listings live in JobAdder, not the DB — a saved
  job's title won't update if the live listing changes.
