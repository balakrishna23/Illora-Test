# Job Alerts

Public email sign-up for new-job notifications, plus the digest that sends
them. Distinct from the admin campaigns mailbot
(`features/admin/campaigns`) — alerts are user-initiated, criteria-matched,
and sent by a cron job, not composed by an admin.

## What it does

- A visitor subscribes with an email + optional industry/state/job-type/
  keyword filter (`subscribeToJobAlert`), no auth required — the trust
  boundary is the email opt-in itself, verified later via the alert's own
  unsubscribe token.
- `processJobAlertDigest()` (invoked by the cron route,
  `app/api/cron/job-alerts`) fetches all live JobAdder jobs and all active
  alerts, matches jobs against each alert's criteria, and emails matches via
  Resend — skipping jobs already sent to that alert
  (`findMatchingJobs`/`markJobAlertNotified`).
- `unsubscribeFromJobAlert` flips an alert's status via its unique token.

## Key entry points

- `actions.ts` — `subscribeToJobAlert` (honeypot + rate-limited),
  `unsubscribeFromJobAlert`.
- `queries.ts` — `createJobAlert`, `getActiveJobAlerts`,
  `unsubscribeJobAlert`, `markJobAlertNotified`, `findMatchingJobs` (pure,
  the actual matching logic), `processJobAlertDigest` (the cron
  entry point).
- `components/JobAlertForm.tsx` — the sign-up form, embedded in the jobs
  sidebar.

## Gotchas

- The cron route is gated by `JOB_ALERTS_CRON_SECRET` — if that env var is
  unset the route fails closed (401 on every call, digest never runs)
  rather than skipping the check.
- `lastNotifiedJobIds` accumulates forever on the alert row to prevent
  re-notifying the same job — there's no pruning, so very long-lived alerts
  will grow this array indefinitely.
