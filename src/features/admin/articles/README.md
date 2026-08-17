# Admin — Articles

Admin CRUD for Knowledge Hub articles at `/admin/articles`, replacing what
used to be a Sanity CMS document type.

## What it does

- Create/update/delete articles, each with a unique slug enforced at the
  application layer (checked before insert/update, not a DB constraint
  error path).
- Every mutation revalidates `/admin/articles`, the public `/knowledge-hub`
  listing, the article's own detail page, and `/` (the homepage preview
  section).

## Key entry points

- `actions.ts` — `createArticle`, `updateArticle`, `deleteArticle`.
- `queries.ts` — read queries backing the admin list/edit views.
- `components/` — `ArticleForm` (shared create/edit form), `ArticleRowActions`.

## Gotchas

- Slug uniqueness is checked with a separate `select` before the
  insert/update, so there's a narrow TOCTOU window under concurrent admin
  edits — acceptable given this is a single-admin-at-a-time internal tool,
  but not DB-enforced.
- `updateArticle`/`deleteArticle` revalidate three or four paths each —
  forgetting one on a future edit here will show stale content on the
  public site.
