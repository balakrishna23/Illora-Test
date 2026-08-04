# Illora — Deployment Runbook (Hostinger VPS + Coolify + bravero.ai)

Goal: a live site at **https://bravero.ai** where anyone, on any machine, can sign
in and use the admin panel and candidate portal. Auth is Supabase Auth — unlike
Clerk, there's no separate dev/prod key pair or domain-verified "production
instance" to set up; the same Supabase project and keys used locally work in
production too. What production does need: pointing Supabase's Auth URL
configuration at the real domain, and (see Phase 3) a custom SMTP provider for
auth emails, since Supabase's default email sender has a strict rate limit
unsuitable for real traffic.

Legend: 🧑 = you do it (dashboard/account actions I can't do) · 🤖 = I do it (code/config)

---

## Phase 0 — Buy the VPS 🧑  ← START HERE (everything is blocked on this)

1. Hostinger → buy a **KVM 2 VPS** (2 vCPU, 8 GB RAM — Next.js builds OOM on smaller).
2. When choosing the OS/template, pick the **Coolify** application template.
3. After it provisions, note the **VPS public IP address** (e.g. `203.0.113.10`).
4. Coolify's dashboard will be at `http://<VPS_IP>:8000` — open it and create the
   admin login. (This is Coolify's own account, separate from everything else.)

Tell me the VPS IP once you have it and I'll walk you through each following step live.

---

## Phase 1 — Point bravero.ai at the VPS 🧑 (GoDaddy DNS)

In GoDaddy DNS for `bravero.ai`, add:

| Type | Name | Value | Notes |
|---|---|---|---|
| A | `@` | `<VPS_IP>` | root domain → server |
| A | `www` | `<VPS_IP>` | www → server |

⚠️ **Known blocker:** GoDaddy required an SMS code to your registered phone last time
(during the Resend setup) and you didn't have access. You'll need that phone to save
DNS changes. Sort this out early — the whole deploy is blocked on DNS.

DNS takes a few minutes to a couple of hours to propagate.

---

## Phase 2 — Deploy the app in Coolify 🧑 (I guide each click)

1. In Coolify: **+ New → Application → Public/Private GitHub repo**.
2. Connect the repo `balakrishna23/Illora-Test`.
3. Branch: **`feat/backend-and-hardening`** (this session's work) — or `main` after
   you merge the PR.
4. Build pack: **Nixpacks** (auto-detects Next.js). Build = `npm run build`,
   start = `npm run start`, port `3000`.
5. Domain: set **`bravero.ai`** → Coolify auto-provisions Let's Encrypt HTTPS.
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
   URL** to `https://bravero.ai` and add `https://bravero.ai/**` to
   **Redirect URLs**.
2. Supabase dashboard → **Authentication → Settings → SMTP Settings** →
   configure custom SMTP using Resend (already set up for transactional mail
   in this project). Without this, Supabase's default email sender hits its
   rate limit after only a handful of sign-ups/password-resets per hour —
   confirmed by testing during the auth migration.
3. Redeploy.

---

## Phase 4 — Finalize 🤖 + 🧑

1. 🧑 **R2 CORS**: add `https://bravero.ai` to the `illora-resumes` bucket's CORS
   AllowedOrigins (alongside `http://localhost:3000`), so resume uploads work in prod.
2. Coolify env: set `NEXT_PUBLIC_SITE_URL=https://bravero.ai`.
3. 🧑 **Resend** (optional, for real emails): finish the bravero.ai domain verification
   (the DKIM/SPF/MX records) and set `RESEND_FROM_EMAIL=noreply@bravero.ai`. Until then,
   confirmation emails just fail silently — the site still works.
4. Redeploy, then test: open `https://bravero.ai/sign-in` from a *different* machine,
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
| `NEXT_PUBLIC_SITE_URL` | `https://bravero.ai` |
| `GEMINI_API_KEY` | Same as local (admin assistant) |
| `ADMIN_ASSISTANT_DATABASE_URL` | Same read-only role URL as local |
| `R2_ACCOUNT_ID` / `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` / `R2_BUCKET_NAME` | Same as local |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` | Same as local (until domain verified) |
| `JOB_ALERTS_CRON_SECRET` | Generate a new random string for prod |
| `CAMPAIGN_UNSUBSCRIBE_SECRET` | Generate a new random string for prod |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` / `NEXT_PUBLIC_SANITY_DATASET` / `SANITY_API_VERSION` | Only if/when Sanity is set up; app degrades gracefully without |

---

## Interim: what your boss CAN see today (no deploy)
The tunnel link shows the **public pages** fine (home, jobs, industries, about,
submit-CV, contact). Login-gated pages (admin/portal) previously didn't work
through the tunnel due to Clerk's dev-instance domain restriction — that
restriction doesn't apply to Supabase Auth (no dev/prod key split), so this
may already work through the tunnel now. Worth re-testing before assuming
Phase 0-3 are still required just to demo login.
