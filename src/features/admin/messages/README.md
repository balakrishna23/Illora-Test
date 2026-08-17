# Admin — Messages

Admin inbox for the two public "someone contacted us" forms — general
contact-form submissions and employer vacancy requests — at
`/admin/messages/contact` and `/admin/messages/vacancies`.

## What it does

- Status-only workflow: admins triage each submission by updating its
  status (e.g. new → in progress → resolved). No create/delete here —
  messages originate from the public `features/contact` and
  `features/employers` forms.

## Key entry points

- `actions.ts` — `updateContactMessageStatus`, `updateVacancyRequestStatus`.
- `queries.ts` — read queries backing the two admin list views.
- `components/` — `ContactMessageStatusSelect`, `VacancyRequestStatusSelect`.

## Gotchas

- The two message types (`contact_messages`, `vacancy_requests`) are
  separate tables with separate status enums — don't assume they share a
  status set if extending one.
