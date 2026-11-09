# External job sources

One adapter per Australian government job board, each implementing
`ExternalJobSource` (`types.ts`): `fetchListings()` returns `RawExternalJob[]`,
which `features/job-ingestion` then normalizes and upserts.

## Sources and how each one actually works

Each source turned out to run on a different platform — there's no single
scraping strategy that fits all of them. See each file's own module comment
for specifics; summary:

| File | Source | Method |
|---|---|---|
| `nt.ts` | NT Government Jobs | Plain stateless POST → JSON, no session needed |
| `workforce-australia.ts` | Workforce Australia (federal) | Plain stateless GET → JSON. **Ingested despite the site's robots.txt disallowing automated access** — an explicit decision made against the recommendation against it; see the file's comment |
| `vic.ts` | Careers Vic | Plain GET, server-rendered HTML (Drupal Views), parsed with Cheerio |
| `qld.ts` | Smart Jobs (QLD) | Plain GET, server-rendered HTML (legacy "jobtools" ATS), parsed with Cheerio |
| `wa.ts`, `tas.ts` | WA / Tasmanian Government Jobs | Plain GET, share the exact same platform/markup — both use `pageup-style.ts` |
| `act.ts` | ACT Government | Plain GET, one flat page listing every agency's jobs |
| `aps-jobs.ts` | APS Jobs (federal) | **The one source needing a real headless browser** (Playwright) — it's a Salesforce Lightning app with no listings in its raw HTML; launching a browser once and reading the JSON response its own frontend produces is far more robust than trying to replicate that internal API by hand |

**Deliberately not included:** NSW (actively bot-protected by Cloudflare,
and its own content-usage policy is reference-only anyway) and SA (legacy
session-bound job board that didn't yield a reliable integration in the
time invested). Both can be added later as their own adapters.

## Shared conventions

- `http.ts` — every plain-HTTP adapter goes through `fetchExternalText`/
  `fetchExternalJson`, which set an honest, identifying User-Agent
  (`IlouraJobBot/1.0`). Never spoof an allowlisted crawler's identity to get
  around a site's access policy — Workforce Australia's inclusion above is
  an accepted, disclosed exception to *policy*, not a case of technical
  evasion.
- `sleep()` (also in `http.ts`) implements each source's courtesy delay
  between requests, matching published crawl-delays where one exists (WA:
  5s, SA would've been 2s).
- Each adapter caps how much it fetches per run (a handful of pages, or
  whatever a single API call returns) rather than pulling a source's entire
  listing every time — see the "Gotchas" note in `features/job-ingestion`'s
  README for why that's an acceptable trade-off here.

## Gotchas

- `pageup-style.ts` is shared by `wa.ts` and `tas.ts` because those two
  sites are, byte-for-byte, the same underlying platform. Don't duplicate
  its parsing logic into a new adapter without checking whether the new
  source is actually the same platform first.
- Field extraction in `pageup-style.ts` prefers each icon's `aria-label`
  over its CSS class, because the two sites don't use the same semantic
  class names for every field (e.g. TAS's closing-date icon has no
  aria-label at all) — see the file's comment before changing the key
  derivation logic.
