# Admin — Email Campaigns

Admin-only mass email ("mailbot") for job-opportunity and marketing mail to the
contact base, sent via Resend's batch API.

## What it does

- Composes a campaign (subject + body) with `{{name}}` / `{{company}}`
  placeholders, rendered per recipient with fallbacks ("there" / "your company").
- Audiences are derived from existing tables — no separate mailing list:
  - **candidates** = application submitters (`applications`) + portal accounts (`candidates`)
  - **clients** = vacancy request contacts (`vacancy_requests`)
  - **all** = union of both
  Recipients are deduped by email and filtered against `email_suppressions`.
- Every email carries a stateless HMAC unsubscribe link
  (`/email-preferences/unsubscribe`) plus a `List-Unsubscribe` header. The page
  verifies the token on GET but only writes on a confirm POST — email link
  scanners that prefetch URLs must not unsubscribe people. Unsubscribing adds
  the address to `email_suppressions` (global for campaigns, separate from
  job-alert unsubscribes).
- Each send is recorded in `email_campaigns` with sent/failed counts.

## Key entry points

- `actions.ts` — `submitCampaign` (admin; `intent=test` sends only to the
  signed-in admin, `intent=send` requires the confirmation checkbox),
  `confirmCampaignUnsubscribe` (public, token-gated, rate-limited).
- `queries.ts` — audience building + campaign records.
- `template.ts` / `recipients.ts` — pure, unit-tested rendering and dedupe logic.
- Sending lives in `src/server/integrations/resend.ts` (`sendCampaignEmails`,
  chunks of 100 per Resend batch call).

## Gotchas

- Requires `CAMPAIGN_UNSUBSCRIBE_SECRET` — sends throw without it (fail loud).
- A Resend batch call fails or succeeds as a whole chunk of ≤100; counts are
  per-chunk, not per-address.
- The send loop runs inside the Server Action request. Fine at the current
  contact-base size (hundreds); if the base grows to many thousands, move the
  loop to a background job like the job-alerts cron.
