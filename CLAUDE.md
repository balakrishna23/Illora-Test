# CLAUDE.md — Illora Engineering Constitution

This file is the single source of truth for how Claude (and any human) writes code in this repository. It is read before every task. If something here conflicts with a request, flag the conflict instead of silently picking one side.

---

## 1. Stack (do not deviate without explicit instruction)

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router only — no Pages Router) |
| UI library | React 19 (Server Components by default) |
| Language | TypeScript, strict mode, no `any` |
| Styling | Tailwind v4 (CSS-first config, no `tailwind.config.js` unless v4 requires it) |
| Components | shadcn/ui — extend, never fork core primitives |
| Auth | Clerk |
| ORM | Drizzle ORM |
| Database | PostgreSQL (via Supabase) |
| CMS | None — Knowledge Hub articles, team profiles, and site stats are managed via a custom admin panel (`/admin/articles`, `/admin/team`, `/admin/settings`), stored in Postgres via Drizzle. Sanity was removed. |
| ATS integration | JobAdder |
| File storage | Cloudflare R2 |
| Email | Resend |
| Testing | Playwright (E2E), Vitest (unit) |
| Hosting | Hostinger KVM VPS running Coolify (self-hosted PaaS) |
| CI/CD | GitHub → Coolify (git-push deploy, auto Let's Encrypt SSL) |
| MCP tools available | Context7, GitHub, Playwright, Sequential Thinking |

**Never** introduce a new package, ORM, auth provider, CMS, or styling system not listed above without asking first. If a task seems to require something outside this stack, stop and ask rather than installing it.

---

## 2. Engineering Principles

1. **Server-first.** Default to Server Components. Only add `"use client"` when the component needs interactivity, browser APIs, or hooks (`useState`, `useEffect`, event handlers).
2. **Colocate by feature, not by type.** Prefer `features/job-board/components/JobCard.tsx` over scattering across global `components/`.
3. **Boring code wins.** Prefer the obvious, readable solution over a clever one. Optimize for the next engineer reading this in six months.
4. **No premature abstraction.** Don't build a generic system for one use case. Wait for the third repetition before abstracting.
5. **Fail loud, fail early.** Validate inputs at the boundary (Server Actions, API routes) and throw/return typed errors immediately — don't let bad data propagate.
6. **Small diffs.** Every change should be reviewable in isolation. Don't bundle refactors with feature work unless asked.

---

## 3. Architecture Rules

- **Server Actions** are the default mutation mechanism. Use API routes only for webhooks (Clerk, JobAdder, Resend) or third-party callbacks that require a stable HTTP endpoint.
- **Data fetching** happens in Server Components or Server Actions — never fetch from the client unless it's a real-time/interactive case (e.g. live search), and even then prefer Server Actions over client-side `fetch`.
- **Database access** only through Drizzle, only from server-side code (`server/`, Server Actions, API routes). Never import the DB client into a Client Component, ever.
- **Sanity content** is fetched server-side via the Sanity client; no client-side GROQ queries unless building a live preview.
- **Auth checks** happen at the layout/page level (server) first, then defense-in-depth in Server Actions. Never trust client-side auth state for authorization decisions.
- **File uploads** go directly to Cloudflare R2 via presigned URLs generated server-side. Never proxy large files through a Next.js API route.

---

## 4. Folder Conventions

```
src/
  app/                    → routes only (page.tsx, layout.tsx, route.ts)
  features/
    <feature-name>/
      components/         → feature-scoped UI
      actions.ts          → Server Actions for this feature
      queries.ts          → Drizzle queries for this feature
      types.ts
  components/
    ui/                   → shadcn/ui primitives, untouched core
    shared/                → cross-feature reusable components
  server/
    db/                   → drizzle schema, client, migrations
    auth/                 → Clerk helpers, session utilities
    integrations/         → JobAdder, Resend, R2 clients
  lib/                     → pure utility functions, no side effects
  styles/
```

Rules:
- A file in `app/` should contain almost no logic — import from `features/`.
- Never create a top-level folder outside this structure without updating this file.
- One component per file. One Server Action group per `actions.ts` per feature.

---

## 5. Naming Conventions

- Components: `PascalCase.tsx` (`JobCard.tsx`)
- Hooks: `useCamelCase.ts` (`useJobFilters.ts`)
- Server Actions: verb-first, camelCase (`createJobListing`, `updateCandidateProfile`)
- Drizzle tables: `snake_case` in the DB, exported as `camelCase` const (`jobListings`)
- Route folders: `kebab-case` (`app/job-board/[slug]`)
- Booleans: prefix with `is`/`has`/`should` (`isLoading`, `hasAccess`)
- Files exporting a single component/function: match the export name exactly.

---

## 6. Server Component Guidelines

- Default export of every `page.tsx` is a Server Component unless explicitly stated.
- Don't add `"use client"` to a parent just to make one child interactive — extract the interactive piece into its own small Client Component and pass it down.
- Pass only serializable props across the server/client boundary (no functions, no class instances, no Date objects without conversion).
- Use `Suspense` boundaries around slow data fetches; don't block the whole page on one slow query.

---

## 7. Server Action Guidelines

- Every Server Action validates its input with a schema (Zod) before touching the database.
- Every Server Action re-checks authentication/authorization server-side — never assume the UI already gated it.
- Return a typed result object (`{ success: true, data }` or `{ success: false, error }`), never throw raw errors to the client.
- Mutations that affect cached data call `revalidatePath`/`revalidateTag` explicitly — don't rely on implicit revalidation.
- Keep Server Actions thin: validate → call a `queries.ts`/`server/` function → return. Business logic lives in plain functions that can be unit tested without the Next.js runtime.

---

## 8. Component Size & Complexity Limits

- Soft limit: **150 lines** per component file. If it's growing past that, extract subcomponents or hooks.
- A component should do one thing. If you're writing "and" to describe what it does, split it.
- Max 3 levels of prop drilling — beyond that, use composition or context (sparingly).
- No inline business logic in JSX beyond simple conditionals/formatting — extract to a function.

---

## 9. Accessibility Checklist (required on every UI task)

- [ ] All interactive elements reachable and operable via keyboard
- [ ] Visible focus states (don't strip Tailwind's focus ring without replacing it)
- [ ] Semantic HTML first — `<button>` not `<div onClick>`, real headings in order
- [ ] All images have meaningful `alt` text (or `alt=""` if decorative)
- [ ] Form inputs have associated `<label>`s, errors announced via `aria-describedby`
- [ ] Color contrast meets WCAG AA (4.5:1 text, 3:1 large text/UI components)
- [ ] Modals/dialogs trap focus and are dismissible via Escape
- [ ] No content conveyed by color alone

---

## 10. Performance Budgets

- LCP target: < 2.5s on simulated 4G
- No client bundle increase > 20KB gzipped without flagging it in the PR description
- Images: always `next/image`, always sized, never unoptimized
- No top-level `"use client"` in `layout.tsx` files
- Avoid waterfalled `await`s — parallelize independent data fetches with `Promise.all`
- Don't import an entire library for one function — check tree-shaking before adding a dependency

---

## 11. Error Handling Patterns

- Server Actions: typed result objects, never unhandled throws.
- API routes: always return a proper status code and JSON error shape `{ error: { message, code } }`.
- Client: use `error.tsx` boundaries per route segment; don't let one broken page take down the whole app.
- Log errors server-side with enough context to debug (user id, action name) — never log secrets, tokens, or full PII.
- User-facing error messages are plain-language and actionable; internal error details never leak to the client.

---

## 12. Testing Requirements

- New Server Actions and `lib/` utilities require unit tests (Vitest).
- New user-facing flows (candidate apply, employer post job, auth) require a Playwright E2E test.
- Don't mock the database in unit tests for query functions — use a test database/transaction rollback pattern.
- A PR that changes behavior without a corresponding test update is incomplete, not done.

---

## 13. Documentation Policy

- Every feature folder gets a short `README.md` if it has more than 3 files: what it does, key entry points, gotchas.
- Complex Server Actions get a one-line comment explaining *why*, not *what* (the code already says what).
- Update `context/architecture.md` when a structural decision changes — don't let it go stale.
- No documentation for self-evident code. Don't comment `// fetch the user` above `getUser()`.

---

## 14. Git Workflow

- Branch naming: `feat/<short-name>`, `fix/<short-name>`, `chore/<short-name>`
- Commit messages: imperative mood, scoped (`feat(job-board): add salary range filter`)
- One logical change per commit; squash noise before opening a PR
- PRs include: what changed, why, how it was tested, screenshots for UI changes
- Never commit directly to `main` — always via PR, even for small fixes

---

## 15. Code Review Checklist

- [ ] Follows folder/naming conventions above
- [ ] No client/server boundary violations (DB client, secrets in client code)
- [ ] Server Actions validate input and check auth
- [ ] No new dependency without justification
- [ ] Accessibility checklist applied to any new UI
- [ ] Tests added/updated for new logic
- [ ] No console.log left in
- [ ] No commented-out code blocks left in

---

## 16. Never Do This

- Never put secrets, API keys, or DB credentials in client-side code or `NEXT_PUBLIC_` variables unless they are genuinely safe to expose.
- Never query the database from a Client Component.
- Never `npm install` a new package without checking it isn't already covered by an existing dependency in the stack.
- Never use `any` to silence a TypeScript error — fix the type.
- Never fetch JobAdder/Resend/R2 directly from the client — always proxy through a Server Action or API route.
- Never bypass Clerk's session checks with a custom auth hack.
- Never write raw SQL when a Drizzle query will do.
- Never delete or alter a migration file that's already been applied — write a new migration.
- Never assume a shadcn/ui component's API without checking the installed version's source in `components/ui/`.
- Never mark a task "done" without running the relevant tests.

---

## 17. AI-Specific Instructions

These rules exist specifically to prevent common AI failure modes in this codebase:

- **Do not invent APIs.** If unsure whether a Next.js 16, React 19, Drizzle, Clerk, or Sanity API exists as you're imagining it, say so and check with Context7 MCP before writing code that depends on it. Do not guess function signatures.
- **Do not install packages speculatively.** Before adding any dependency, check if the existing stack (listed in Section 1) already solves the problem. If a new package genuinely seems required, name it and ask before installing.
- **Match existing patterns.** Before writing a new feature, look at how a similar existing feature is structured in this repo and follow that pattern rather than introducing a new one.
- **Don't refactor unrelated code** while completing a task, even if you notice something that could be improved — note it instead and ask.
- **Prefer Context7 MCP for library documentation** over relying on training data, especially for Next.js 16, React 19, Tailwind v4, and Drizzle, since these are fast-moving and your knowledge may be stale.
- **Use Sequential Thinking MCP** for any task that involves multi-step architectural decisions (new feature design, schema changes, integration wiring) before writing code.
- **Use Playwright MCP** to verify UI changes render and behave as expected when feasible, rather than assuming.
- **When uncertain, ask.** A clarifying question costs less than a wrong implementation built on a guessed assumption.

---

## 18. Project Context

Illora is a recruitment/job-board platform connecting candidates and employers, with ATS integration via JobAdder. Core flows: candidate job search & application, employer job posting & candidate management, CMS-driven content (Sanity) for marketing pages, and authenticated dashboards for both user types (Clerk).

See `context/` for deeper detail on architecture, design system, roadmap, and conventions — this file is the summary; those files are the detail.
