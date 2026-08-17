# Admin — Team

Admin CRUD for the team profiles shown on `/about`, replacing what used to
be a Sanity CMS document type.

## What it does

- Create/update/delete team members (name, role, bio, optional cultural
  connection note, optional LinkedIn URL, manual `sortOrder`).
- Every mutation revalidates `/admin/team` and the public `/about` page.

## Key entry points

- `actions.ts` — `createTeamMember`, `updateTeamMember`, `deleteTeamMember`.
- `queries.ts` — read queries backing the admin list/edit views.
- `components/` — `TeamForm` (shared create/edit form), `TeamRowActions`.

## Gotchas

- Display order on `/about` is driven entirely by the manually-set
  `sortOrder` field — there's no drag-and-drop reordering, admins set the
  number directly in the form.
