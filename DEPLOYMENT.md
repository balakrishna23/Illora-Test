# Illora — Deployment Runbook (Hostinger VPS + Coolify + bravero.ai)

Goal: a live site at **https://bravero.ai** where anyone, on any machine, can sign
in and use the admin panel and candidate portal. This requires production Clerk
keys on a real domain — it cannot be done on localhost or a tunnel.

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

## Phase 3 — Production Clerk on bravero.ai 🧑 (Clerk dashboard)

This is what fixes the "can't sign in from another machine" problem.

1. Clerk dashboard → create a **Production** instance for this app.
2. Clerk will show DNS records (CNAMEs like `clerk`, `accounts`,
   `clkmail`, plus DKIM entries) → **add them all to GoDaddy DNS** for bravero.ai.
3. Wait for Clerk to verify the domain (green ticks).
4. Copy the production keys: `pk_live_…` and `sk_live_…`.
5. Put them in Coolify env as `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and
   `CLERK_SECRET_KEY` (replacing the `pk_test`/`sk_test` dev values).
6. Redeploy.

Keep your **dev** keys in your local `.env` — production keys live only in Coolify.

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
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | **Production** `pk_live_…` (Phase 3) |
| `CLERK_SECRET_KEY` | **Production** `sk_live_…` (Phase 3) |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` |
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
submit-CV, contact). Only **login-gated** pages (admin/portal) don't work through the
tunnel — that's the dev-keys limitation this whole deploy solves.
