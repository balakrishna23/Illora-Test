# Illoura — Deployment Runbook (Hostinger Business Web Hosting + illouraservices.com)

Production is live at **https://illouraservices.com**, running as a managed
Node.js app on Hostinger's **Business Web Hosting** (shared) plan. Auth is
Supabase Auth and the database is Supabase Postgres — production uses the
same Supabase project as local development, so **local and prod share one
database**. Anything that touches the schema (migrations, seeds) affects the
live site immediately.

The earlier plan of a Hostinger KVM VPS running Coolify was never set up and
has been dropped — there is no VPS on the account.

Legend: 🧑 = you do it (dashboard/account actions) · 🤖 = Claude can do it (code/config, or via the Hostinger MCP connector)

---

## Current production setup

| Setting | Value |
|---|---|
| Hostinger plan | Business Web Hosting (shared), account user `u153188888` |
| Website | `illouraservices.com` (website type: Node.js) |
| Node.js version | 22 |
| App type | `next` |
| Build script | **`build:hostinger`** (`next build --webpack`) — see below for why |
| Output directory | `.next` |
| Source | uploaded archive `illora-deploy.zip` in `public_html` |
| Last deploy | 2026-10-27, commit `aeadc68` (branch `feat/team-photos-job-ingestion`) |

Env vars live in hPanel → **Websites → illouraservices.com → Node.js →
Environment variables** (full list at the bottom of this file).

---

## How to deploy

1. 🤖 **Check locally first**: `npx tsc --noEmit`, `npm run lint`, `npm test`,
   then `npm run build:hostinger`. The build queries the database (static
   page data), so it fails if a pending migration hasn't been applied yet.
2. 🤖/🧑 **Apply migrations before deploying** code that depends on them:
   `npm run db:migrate`. Because local and prod share the database, this is
   a production change — keep migrations additive (new nullable/defaulted
   columns) so the currently-live build keeps working until the new one is up.
3. 🤖 **Build the archive from a commit, not the working tree** — this
   guarantees `.env`, `node_modules/` and `.next/` are never uploaded:
   ```
   git archive -o illora-deploy.zip HEAD
   ```
4. 🤖 **Upload** `illora-deploy.zip` to `public_html` (hPanel File Manager, or
   the Hostinger API's upload URL + TUS upload), overwriting the old one.
5. 🤖 **Start the build** (hPanel → Node.js → Build, or the API's
   `hosting_nodejs_start-build`) with the settings in the table above —
   **build script `build:hostinger`**. Hostinger runs `npm install` and then
   the build; a full run takes ~3–5 minutes.
6. 🤖 **Verify**: the old version keeps serving until the new build succeeds,
   so a failed build does not take the site down. Afterwards check `/`,
   `/about`, `/jobs`, a job detail page, `/sign-in`, `/sitemap.xml`,
   `/favicon.ico`, and that `/admin` redirects (307) to sign-in.

**Rollback**: check out the previous good commit, repeat steps 3–5.

### Why `build:hostinger` uses webpack

Since 2026-10-27, every Turbopack build (`npm run build`) on Hostinger fails at
`src/app/globals.css` with `node process exited before we could connect to it`:
Turbopack runs PostCSS (Tailwind) in a child Node process, and the shared build
machine kills it. Nothing in the CSS toolchain changed — the same config built
fine in August. Webpack runs PostCSS in-process, so `build:hostinger` builds
with `next build --webpack`. Local development and `npm run build` stay on
Turbopack.

---

## Scheduled jobs (cron) — not configured yet

There are **no cron jobs** on the Hostinger account, so neither scheduled
route is running in production yet:

| Route | Secret env var | Suggested schedule |
|---|---|---|
| `/api/cron/job-alerts` | `JOB_ALERTS_CRON_SECRET` (set in prod) | daily |
| `/api/cron/job-ingest` | `JOB_INGEST_CRON_SECRET` (**not set in prod yet**) | every few hours |

🧑 To add one: hPanel → **Advanced → Cron Jobs** → custom command, e.g.
```
curl -s -H "Authorization: Bearer <secret>" https://illouraservices.com/api/cron/job-ingest
```
Both routes fail closed: without the secret env var set, they return 401 and
do nothing.

---

## Government job ingestion pipeline (2026-08-31, deployed 2026-10-27)

`src/features/job-ingestion` pulls new postings from 8 Australian government
job boards and lands them in `/admin/jobs` as **pending** for an admin to
approve before they show on the public `/jobs` page.

- ✅ **Migration `0009_last_terrax.sql` applied** (2026-10-27) — adds
  `source`/`source_label`/`external_id`/`external_url`/`imported_at` to
  `jobs` plus a dedup unique constraint.
- ✅ **Code deployed** — `/api/cron/job-ingest` is live and returns 401.
- 🧑 **Still needed**: generate a random string, add it as
  `JOB_INGEST_CRON_SECRET` in the Hostinger env vars, rebuild, then add the
  cron job above. A single run can take a couple of minutes (sequential
  requests with courtesy delays); this is normal, not a hang.
- ⚠️ **APS Jobs will not work on shared hosting.** That source launches
  headless Chromium via `playwright-core`
  (`src/server/integrations/external-jobs/aps-jobs.ts`), and a browser can't
  be installed on this plan. Ingestion handles failures per source, so APS
  just reports an error and the other sources still run.

**Not included, and why:** NSW is excluded — actively bot-protected
(Cloudflare challenge) and its own usage policy is reference-only anyway. SA
didn't yield a working integration in the time invested so far (legacy,
session-bound job board) — both can be added later as their own adapters.
Workforce Australia **is** included despite its robots.txt disallowing
automated access — an explicit decision made against the recommendation
against it; see the comment in `workforce-australia.ts`.

---

## Site icons and the Google search result icon

Google shows the site's **favicon** next to search results (not the
Organization `logo` in the JSON-LD). Icons are Next.js file conventions in
`src/app/`: `favicon.ico` (16/32/48px), `icon.png` (192px) and
`apple-icon.png` (180px), all made from `public/logo.png`. After changing
them, 🧑 request indexing of the home page in Google Search Console — Google
updates the icon on its own schedule (days to a couple of weeks).

---

## ✅ Resolved: Supabase Storage is connected (2026-08-06)

Storage is on Supabase Storage (S3-compatible endpoint) —
`src/server/integrations/supabase-storage.ts`. Bucket `illora-resumes`
(private, 10 MB limit); all five storage env vars are set locally and in
prod. The S3 client needs `forcePathStyle: true`, which Supabase's S3 gateway
requires (without it, the AWS SDK builds a virtual-hosted-style hostname that
fails the TLS handshake against Supabase's cert).

🧑 Prod check: the bucket's allowed origins in Supabase should include
`https://illouraservices.com` (alongside `http://localhost:3000`) so resume
uploads work in prod.

---

## ✅ Resolved: Resend domain verification is complete (2026-08-17)

`illouraservices.com` is verified in Resend and ready to send from addresses
on that domain (for example `noreply@illouraservices.com`). This domain also
has live mailboxes — when touching its DNS zone, never replace the existing MX
records, and merge any new SPF `include:` into the single existing SPF `TXT`
record rather than adding a second one.

---

## ✅ Resolved: auth emails go through a Send Email Hook, not Supabase's SMTP relay (2026-08-17)

Supabase Auth's built-in custom-SMTP relay to `smtp.resend.com` proved
unreliable (intermittent bare HTTP 500 / `AuthRetryableFetchError` from
GoTrue on an otherwise correct config). The fix bypasses it:
`src/app/api/auth/send-email/route.ts` is a Supabase **Send Email Hook**
target that sends auth emails through Resend's **HTTP API**
(`sendAuthHookEmail` in `src/server/integrations/resend.ts`). Requests are
verified via HMAC signature (`src/server/auth/verify-webhook.ts`, Standard
Webhooks spec) before anything is sent.

🧑 Setup: Supabase Dashboard → **Authentication → Hooks** → **"Send Email"**
hook → type **HTTPS** → URL `https://illouraservices.com/api/auth/send-email`.
Saving generates a `v1,whsec_...` secret → set it as `SEND_EMAIL_HOOK_SECRET`
(local `.env` and the Hostinger env vars).

---

## Supabase Auth production config 🧑 (Supabase dashboard)

1. **Authentication → URL Configuration**: Site URL
   `https://illouraservices.com`, and `https://illouraservices.com/**` in
   Redirect URLs.
2. The Send Email Hook above — without it Supabase falls back to its default
   sender, which hits a strict rate limit after a handful of emails per hour.

---

## Environment variables (Hostinger)

Set in hPanel → **Websites → illouraservices.com → Node.js → Environment
variables**. Never commit these.

- Adding or editing one variable in hPanel is safe. The Hostinger **API**
  call (`hosting_nodejs_replace-environment-variables`) replaces the *whole*
  set and values can't be read back — only use it with every value in hand.
- Saving restarts the app, but Next.js bakes some values in at build time
  (all `NEXT_PUBLIC_*`), so **rebuild after changing env vars**.

| Variable | Source / note |
|---|---|
| `DATABASE_URL` | Supabase **session pooler** URL — same database as local |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same as local |
| `SUPABASE_SERVICE_ROLE_KEY` | Same as local — server-only, never expose to the client |
| `ADMIN_EMAILS` | `sirish.kkumar@illouraservices.com` |
| `ADMIN_DOMAINS` | Optional; defaults to `illouraservices.com` (not set in prod) |
| `NEXT_PUBLIC_SITE_URL` | `https://illouraservices.com` |
| `GEMINI_API_KEY` | Same as local (admin assistant) |
| `ADMIN_ASSISTANT_DATABASE_URL` | Same read-only role URL as local |
| `SUPABASE_PROJECT_REF` / `SUPABASE_STORAGE_REGION` / `SUPABASE_STORAGE_ACCESS_KEY_ID` / `SUPABASE_STORAGE_SECRET_ACCESS_KEY` / `SUPABASE_STORAGE_BUCKET_NAME` | Same as local |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` | Same as local |
| `SEND_EMAIL_HOOK_SECRET` | Generated by Supabase when the Send Email Hook is saved |
| `JOB_ALERTS_CRON_SECRET` | Random string, prod-specific |
| `JOB_INGEST_CRON_SECRET` | Random string, prod-specific — **not set in prod yet** |
| `CAMPAIGN_UNSUBSCRIBE_SECRET` | Random string, prod-specific; rotating it breaks unsubscribe links in sent emails |

Prod also has `SUPABASE_URL` and `SUPABASE_API_KEY` set; no code reads them,
so they are leftovers and can be removed.
