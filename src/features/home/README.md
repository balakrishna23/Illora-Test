# Home

Landing page sections for `/`.

## What it does

- `queries.ts` — `getSiteStats()` reads the singleton `site_settings` row
  (years operating, candidates placed, client retention %, active employers)
  admins edit at `/admin/settings`. Falls back to zeros until that row is
  first saved, so the homepage never shows stale seed data.
- `components/` — one component per landing section, composed by
  `app/page.tsx`: `HomeHero`, `JobTicker` (live JobAdder roles),
  `IndustryTiles`, `Accreditations` / `Clients` (auto-detected logo files),
  `TestimonialsCarousel`, `KnowledgeHubPreview` (latest articles),
  `NameMeaning`, `DualCtaBand`.

## Key entry points

- `queries.ts` — `getSiteStats`.
- `components/JobTicker.tsx` — fetches and renders live vacancies via
  `src/server/integrations/jobadder`.
- `components/KnowledgeHubPreview.tsx` — takes already-fetched `Article[]`
  from `features/knowledge-hub/queries`; no data fetching of its own.

## Gotchas

- `Accreditations`/`Clients` render whatever logo files exist under
  `public/` at build time — adding/removing a logo file is the whole
  workflow, no CMS entry needed.
- Site stats are one shared singleton row, not versioned — `/admin/settings`
  overwrites it directly.
