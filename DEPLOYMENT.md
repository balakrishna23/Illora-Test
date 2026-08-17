# Illoura — Deployment Runbook (Hostinger VPS + Coolify + illouraservices.com)

Goal: a live site at **https://illouraservices.com** where anyone, on any machine, can sign
in and use the admin panel and candidate portal. Auth is Supabase Auth, so the
same Supabase project and keys used locally can also be used in production.
What production does need: pointing Supabase's Auth URL
configuration at the real domain, and (see Phase 3) a Send Email Hook so auth
emails go through Resend's HTTP API — Supabase's default email sender has a
strict rate limit unsuitable for real traffic, and (see below) its built-in
SMTP relay proved unreliable even with a correctly configured custom SMTP
provider.

Legend: 🧑 = you do it (dashboard/account actions I can't do) · 🤖 = I do it (code/config)

---

## ✅ Resolved: Supabase Storage is connected (2026-08-06)

Storage is now on Supabase Storage (S3-compatible endpoint) —
`src/server/integrations/supabase-storage.ts`. This is now
fully configured and verified: bucket `illora-resumes` created (private, 10
MB limit), all five env vars set in local `.env`
(`SUPABASE_PROJECT_REF`, `SUPABASE_STORAGE_REGION`,
`SUPABASE_STORAGE_ACCESS_KEY_ID`, `SUPABASE_STORAGE_SECRET_ACCESS_KEY`,
`SUPABASE_STORAGE_BUCKET_NAME`), and a live upload → read → presigned-download
→ delete round trip confirmed working. Also fixed a real bug found along the
way: the S3 client was missing `forcePathStyle: true`, which Supabase's S3
gateway requires (without it, the AWS SDK builds a virtual-hosted-style
hostname that fails TLS handshake against Supabase's cert). `npm run build`
now succeeds with these vars set.

Still needed for **prod** specifically: add these same 5 vars to Coolify at
deploy time (see the env var table below), and the Supabase Storage CORS
step in Phase 4.

---

## ✅ Resolved: Resend domain verification is complete (2026-08-17)

`illouraservices.com` is verified in Resend and ready to send from addresses
on that domain (for example `noreply@illouraservices.com`).

---

## ✅ Resolved: auth emails now go through a Send Email Hook, not Supabase's SMTP relay (2026-08-17)

Supabase Auth's built-in custom-SMTP relay to `smtp.resend.com` was
diagnosed and found unreliable: correct credentials, correct host, both port
465 and 587 all confirmed working via a raw SMTP handshake test, yet
sign-up still intermittently returned a bare HTTP 500 /
`AuthRetryableFetchError` from GoTrue itself — confirmed via Supabase's own
Auth Logs, which showed clusters of failures alternating with clusters of
clean successes on the *identical* config (a signature of a transient
backend/connection issue, not a settings problem). Switching SMTP port
465→587 did not fix it, because the port was never the actual cause.

**Fix**: bypass Supabase's SMTP relay entirely. `src/app/api/auth/send-email/route.ts`
is a Supabase **Send Email Hook** target — Supabase POSTs auth-email
requests (signup confirmation, email change, etc.) to this endpoint instead
of sending them itself, and the endpoint sends via Resend's **HTTP API**
(`src/server/integrations/resend.ts`'s `sendAuthHookEmail`), which was 100%
reliable across all testing today, unlike the SMTP path. Webhook requests
are verified via HMAC signature (`src/server/auth/verify-webhook.ts`,
Standard Webhooks spec) before anything is sent.

🧑 **To activate**: Supabase Dashboard → **Authentication → Hooks** → add a
**"Send Email"** hook → type **HTTPS** → URL =
`https://illouraservices.com/api/auth/send-email` (must be publicly
reachable — this can't be tested against `localhost`). Saving the hook
generates a signing secret starting `v1,whsec_...` — copy it into
`SEND_EMAIL_HOOK_SECRET` (local `.env` and Coolify). Once this is
configured, the custom-SMTP settings under Authentication → Settings → SMTP
Settings become unused and can be left as-is or disabled.

---

## Phase 0 — Buy the VPS 🧑  ← START HERE (everything is blocked on this)

1. Hostinger → buy a **KVM 2 VPS** (2 vCPU, 8 GB RAM — Next.js builds OOM on smaller).
2. When choosing the OS/template, pick the **Coolify** application template.
3. After it provisions, note the **VPS public IP address** (e.g. `203.0.113.10`).
4. Coolify's dashboard will be at `http://<VPS_IP>:8000` — open it and create the
   admin login. (This is Coolify's own account, separate from everything else.)

Tell me the VPS IP once you have it and I'll walk you through each following step live.

---

## Phase 1 — Point illouraservices.com at the VPS 🧑 (Hostinger DNS)

DNS for `illouraservices.com` is managed in Hostinger's hPanel (same account as
the VPS) — **Domains → illouraservices.com → DNS / Nameservers → DNS Zone
Editor**. Add:

| Type | Name | Value | Notes |
|---|---|---|---|
| A | `@` | `<VPS_IP>` | root domain → server |
| A | `www` | `<VPS_IP>` | www → server |

⚠️ **This domain already has live email** (`sirish.kkumar@illouraservices.com`,
`bala.krishna@illouraservices.com` are real inboxes people use today). A/CNAME
records for the website don't conflict with the existing MX records for
email — different record types — so this step alone is safe. But **before
touching anything else in this zone, note what's already there** (especially
the MX records and any existing SPF `TXT` record), so Phase 4's Resend setup
doesn't accidentally replace them. Resend's DKIM/verification records go on
their own subdomain/selector and shouldn't touch the root MX, but an SPF
`TXT` record is trickier — a domain can only have *one* SPF record, so if one
already exists for the current email provider, Resend's `include:` needs to
be merged into it rather than added as a second, competing TXT record.

DNS takes a few minutes to a couple of hours to propagate.

---

## Phase 2 — Deploy the app in Coolify 🧑 (I guide each click)

1. In Coolify: **+ New → Application → Public/Private GitHub repo**.
2. Connect the repo `balakrishna23/Illora-Test`.
3. Branch: **`feat/backend-and-hardening`** (this session's work) — or `main` after
   you merge the PR.
4. Build pack: **Nixpacks** (auto-detects Next.js). Build = `npm run build`,
   start = `npm run start`, port `3000`.
5. Domain: set **`illouraservices.com`** → Coolify auto-provisions Let's Encrypt HTTPS.
6. Paste the environment variables (full list in the last section) — **do NOT commit
   these; paste them into Coolify's env UI only**.
7. Deploy.

---

## Phase 3 — Supabase Auth production config 🧑 (Supabase dashboard)

No new keys or DNS records needed — `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are the same
values already in your local `.env`. Just point Auth at the real domain and
fix email deliverability:

1. Supabase dashboard → **Authentication → URL Configuration** → set **Site
   URL** to `https://illouraservices.com` and add `https://illouraservices.com/**` to
   **Redirect URLs**.
2. Configure the **Send Email Hook** — see the resolved section above for
   exact steps. This is what makes auth emails work at all in prod; without
   it, Supabase falls back to its own default sender, which hits a strict
   rate limit after only a handful of sign-ups/password-resets per hour.
3. Redeploy.

---

## Phase 4 — Finalize 🤖 + 🧑

1. 🧑 **Supabase Storage CORS**: in the Supabase dashboard, add
   `https://illouraservices.com` to the storage bucket's allowed origins (alongside
   `http://localhost:3000`), so resume uploads work in prod.
2. Coolify env: set `NEXT_PUBLIC_SITE_URL=https://illouraservices.com`.
3. 🧑 **Resend**: add `illouraservices.com` as a domain in the Resend dashboard,
   add the DKIM/SPF/MX records it generates to the Hostinger DNS zone (see the
   SPF-merge caution in Phase 1 — this domain already has an email provider),
   verify, then set `RESEND_FROM_EMAIL` to an address on that domain (e.g.
   `noreply@illouraservices.com`). Until this is done, confirmation/job-alert/
   campaign emails fail (confirmed via a live test send — Resend rejects any
   real recipient domain while `RESEND_FROM_EMAIL` is still the
   `onboarding@resend.dev` sandbox sender) — the site still works, the emails
   just never arrive.
4. Redeploy, then test: open `https://illouraservices.com/sign-in` from a *different* machine,
   sign in, reach `/admin`. This is the proof for your boss.

---

## Environment variables to set in Coolify

Copy the **values** from your local `.env` unless noted. Never commit these.

| Variable | Source / note |
|---|---|
| `DATABASE_URL` | Same Supabase **session pooler** URL as local (works fine on a VPS) |
| `NEXT_PUBLIC_SUPABASE_URL` | Same as local (Phase 3) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same as local (Phase 3) |
| `SUPABASE_SERVICE_ROLE_KEY` | Same as local — server-only, never expose to the client (Phase 3) |
| `ADMIN_EMAILS` | `sirish.kkumar@illouraservices.com` |
| `NEXT_PUBLIC_SITE_URL` | `https://illouraservices.com` |
| `GEMINI_API_KEY` | Same as local (admin assistant) |
| `ADMIN_ASSISTANT_DATABASE_URL` | Same read-only role URL as local |
| `SUPABASE_PROJECT_REF` / `SUPABASE_STORAGE_REGION` / `SUPABASE_STORAGE_ACCESS_KEY_ID` / `SUPABASE_STORAGE_SECRET_ACCESS_KEY` / `SUPABASE_STORAGE_BUCKET_NAME` | Same as local |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` | Same as local |
| `SEND_EMAIL_HOOK_SECRET` | Generated by Supabase when you save the Send Email Hook (Phase 3) — not known until then |
| `JOB_ALERTS_CRON_SECRET` | Generate a new random string for prod |
| `CAMPAIGN_UNSUBSCRIBE_SECRET` | Generate a new random string for prod |

---

## Interim: what your boss CAN see today (no deploy)
The tunnel link shows the **public pages** fine (home, jobs, industries, about,
submit-CV, contact). Since auth is now on Supabase rather than a provider with
dev-instance domain restrictions, login-gated pages may also work through the
tunnel. Worth re-testing before assuming Phase 0-3 are still required just to
demo login.
