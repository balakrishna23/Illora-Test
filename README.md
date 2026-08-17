# Illora

Illora is a recruitment platform built with Next.js 16, React 19, Supabase Auth, Drizzle, PostgreSQL, JobAdder, Supabase Storage, and Resend.

It includes:
- Public marketing pages for candidates, employers, industries, testimonials, and the knowledge hub
- Public candidate and employer lead-generation flows
- Candidate authentication and portal features
- Admin tools for jobs, applications, messages, articles, team members, settings, campaigns, and analytics
- Job alerts, email unsubscribe flows, and resume upload/review support

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- Supabase Auth
- PostgreSQL + Drizzle ORM
- JobAdder integration
- Supabase Storage
- Resend
- Vitest + Playwright

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Copy env vars and fill them in:

```bash
copy .env.example .env
```

3. Start the dev server:

```bash
npm run dev
```

The app runs at `http://localhost:3000`.

## Environment

Review `.env.example` for the full list. The app expects configuration for:
- Supabase project URL, anon key, and service role key
- PostgreSQL connection strings
- Supabase Storage S3-compatible credentials
- Resend
- Gemini
- Admin email allowlist
- Cron and unsubscribe secrets

## Useful Commands

```bash
npm run dev
npm run build
npm run start
npm run lint
npm test
npm run test:e2e
npm run db:generate
npm run db:migrate
npm run db:seed
npm run db:seed-content
npm run db:seed-applications
```

## Project Structure

```text
src/
  app/          Route segments only
  features/     Feature-scoped UI, actions, queries, docs
  components/   Shared and UI primitives
  server/       Auth, DB, and third-party integrations
  lib/          Pure utilities
e2e/            Playwright coverage
scripts/        Local automation and agent helpers
```

## Testing

- Unit and server-side logic: `npm test`
- End-to-end browser checks: `npm run test:e2e`
- Static analysis: `npm run lint`
- Production build verification: `npm run build`

## Deployment

Deployment notes live in [DEPLOYMENT.md](DEPLOYMENT.md). The current production target is `illouraservices.com` on Hostinger VPS + Coolify.

## Current Caveats

- Public job listings are sourced from JobAdder, while the local admin jobs area writes to the app database. That split should be reconciled before treating the admin jobs UI as the sole source of truth.
- Legal pages still require solicitor review before they should be treated as final compliance documents.
