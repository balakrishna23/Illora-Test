# Admin — Email Campaigns

Admin-only mass email ("mailbot") for job-opportunity and marketing mail to the
contact base, sent via Resend's batch API.

## What it does

- Composes a campaign (subject + body, optional reply-to, optional single
  attachment, optional shared signature) with `{{name}}` / `{{company}}`
  placeholders, rendered per recipient with fallbacks ("there" / "your company").
- Audiences are derived from existing tables — no separate mailing list:
  - **candidates** = application submitters (`applications`) who opted into
    marketing, optionally scoped to one industry (`candidates:<industry>`,
    matching the industry they picked on their CV submission)
  - **clients** = vacancy request contacts (`vacancy_requests`)
  - **general** = contact-form submitters (`contact_messages`) who opted into
    marketing on the general Contact page
  - **all** = union of all three
  The `candidates` table (account sign-ups) is intentionally NOT a source — it
  has no consent capture point, so including it would email people who never
  opted in (Spam Act 2003). Recipients are deduped by email and filtered
  against `email_suppressions`.
- Every email carries a stateless HMAC unsubscribe link
  (`/email-preferences/unsubscribe`) plus a `List-Unsubscribe` header. The page
  verifies the token on GET but only writes on a confirm POST — email link
  scanners that prefetch URLs must not unsubscribe people. Unsubscribing adds
  the address to `email_suppressions` (global for campaigns, separate from
  job-alert unsubscribes).
- Each send is recorded in `email_campaigns` with sent/failed counts, plus the
  reply-to and attachment filename used (if any).

## Key entry points

- `actions.ts` — `submitCampaign` (admin; `intent=test` sends only to the
  signed-in admin, `intent=send` requires the confirmation checkbox),
  `confirmCampaignUnsubscribe` (public, token-gated, rate-limited),
  `getCampaignAttachmentUploadUrl` (presigned R2 upload for the attachment),
  `updateCampaignSignature` (admin; edits the shared signature).
- `queries.ts` — audience building + campaign records + signature storage
  (`campaign_settings`, a singleton row).
- `template.ts` / `recipients.ts` — pure, unit-tested rendering and dedupe logic.
- Sending lives in `src/server/integrations/resend.ts` (`sendCampaignEmails`).

## Gotchas

- Requires `CAMPAIGN_UNSUBSCRIBE_SECRET` — sends throw without it (fail loud).
- **Resend's batch API does not support attachments** (only single-send does).
  `sendCampaignEmails` normally chunks through the fast batch API (≤100/call),
  but the moment a campaign has an attachment it switches to one request per
  recipient instead — slower, and subject to per-request rate limits rather
  than per-batch ones. Reply-to works on both paths.
- A batch call fails or succeeds as a whole chunk of ≤100; counts are
  per-chunk, not per-address, on the batch path.
- The send loop runs inside the Server Action request. Fine at the current
  contact-base size (hundreds); if the base grows to many thousands, move the
  loop to a background job like the job-alerts cron.
