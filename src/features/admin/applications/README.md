# Admin — Applications

Admin-only review queue for candidate applications at `/admin/applications`.

## What it does

- Lists every application with a left join to the live `jobs` table so the
  admin sees the current job title/slug even if the application predates a
  title edit (`getAllApplications`).
- Lets an admin download a candidate's resume/cover letter
  (`getResumeDownloadUrl`) or ask Gemini for an AI recruiter-style review of
  the resume (`reviewResumeWithAi`), and change an application's status
  (`updateApplicationStatus`).
- File access is always server-mediated: the Supabase Storage key never
  reaches the client, only a short-lived (~2 min) presigned URL generated
  on demand after the admin check passes.

## Key entry points

- `actions.ts` — `getResumeDownloadUrl`, `reviewResumeWithAi`,
  `updateApplicationStatus`.
- `queries.ts` — `getAllApplications`, `getApplicationForFileAccess` (the
  shared server-side key lookup both file actions use).
- `components/` — `ApplicationsTable`, `ApplicationStatusSelect`,
  `ResumeReviewPanel`.

## Gotchas

- `reviewResumeWithAi` is rate-limited (20/window) separately from the
  general admin rate limits, since it calls out to Gemini per request.
- Both file actions re-validate `applicationId` as a UUID and re-run
  `requireAdmin()` — never trust that the table UI already gated this.
