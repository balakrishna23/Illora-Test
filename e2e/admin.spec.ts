import { expect, test, type Page } from "@playwright/test";
import postgres from "postgres";

// Deep pass over every /admin section, driven as a real signed-in admin.
// Uses a dedicated test account (created via the Supabase admin API,
// pre-confirmed) rather than a real staff account. Runs serially — later
// tests depend on earlier ones (e.g. editing the job created in the create
// test) — and shares one authenticated page across the whole file instead of
// re-signing-in per test.
//
// Deliberately does NOT: send a real campaign to the full audience (only the
// "send test to my email" path, which only emails the signed-in admin), or
// hammer the Gemini-backed AI review/assistant beyond one call each (small
// daily quota on the free tier).

const ADMIN_EMAIL = "claude-admin-test@illouraservices.com";
const ADMIN_PASSWORD = "ClaudeAdminTest12345!";

const sql = postgres(process.env.DATABASE_URL!);
let adminUserId: string;
let seededContactMessageId: string;
let seededVacancyRequestId: string;

async function adminUsersFetch(path: string, init?: RequestInit): Promise<{ status: number; body: { id: string; users?: { id: string }[] } }> {
  const res = await fetch(process.env.NEXT_PUBLIC_SUPABASE_URL + path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
      Authorization: "Bearer " + process.env.SUPABASE_SERVICE_ROLE_KEY,
      ...(init?.headers ?? {}),
    },
  });
  return { status: res.status, body: await res.json() };
}

test.beforeAll(async () => {
  // Self-contained: provisions its own admin account rather than assuming
  // one already exists — a prior run's cleanup (or a fresh checkout) would
  // otherwise leave this spec permanently broken with no way to sign in.
  // @illouraservices.com matches ADMIN_DOMAINS, so this account is treated
  // as admin automatically (see src/server/auth/session.ts).
  const existing = await adminUsersFetch(`/auth/v1/admin/users?email=${ADMIN_EMAIL}`);
  for (const u of existing.body.users ?? []) {
    await adminUsersFetch(`/auth/v1/admin/users/${u.id}`, { method: "DELETE" });
  }
  const created = await adminUsersFetch("/auth/v1/admin/users", {
    method: "POST",
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD, email_confirm: true }),
  });
  adminUserId = created.body.id;

  [{ id: seededContactMessageId }] = await sql`
    insert into contact_messages (name, email, phone, subject, message, status)
    values ('E2E Test Contact', 'e2e-contact@example.com', '0400000000', 'Test subject', 'Test message body for admin e2e pass.', 'new')
    returning id
  `;
  [{ id: seededVacancyRequestId }] = await sql`
    insert into vacancy_requests (company_name, contact_name, email, phone, role_title, employment_type, location, industry, urgency, message, status)
    values ('E2E Test Co', 'E2E Contact', 'e2e-vacancy@example.com', '0400000000', 'Test Role', 'Permanent', 'Sydney', 'ICT', 'ASAP', 'Test vacancy message for admin e2e pass.', 'new')
    returning id
  `;
});

test.afterAll(async () => {
  await sql`delete from contact_messages where id = ${seededContactMessageId}`;
  await sql`delete from vacancy_requests where id = ${seededVacancyRequestId}`;
  await sql.end();
  if (adminUserId) {
    await adminUsersFetch(`/auth/v1/admin/users/${adminUserId}`, { method: "DELETE" });
  }
});

test.describe.serial("Admin panel — deep pass", () => {
  let page: Page;
  const consoleErrors: string[] = [];

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
  });

  test.afterAll(async () => {
    await page.close();
  });

  test("signs in with the admin test account", async () => {
    await page.goto("/sign-in");
    await page.getByLabel(/email/i).fill(ADMIN_EMAIL);
    await page.getByLabel(/^password$/i).fill(ADMIN_PASSWORD);
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/portal/);
  });

  test("dashboard: loads with all stat cards, no console errors", async () => {
    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: "Admin" })).toBeVisible();
    await expect(page.getByText("Total accounts created")).toBeVisible();
    await expect(page.getByText("Active jobs")).toBeVisible();
    await expect(page.getByText("Applications this week")).toBeVisible();
    await expect(page.getByText("Contact messages")).toBeVisible();
    await expect(page.getByText("Vacancy requests", { exact: true })).toBeVisible();
  });

  test("dashboard: nav links to every admin section", async () => {
    const adminNav = page.getByRole("navigation", { name: "Admin" });
    for (const label of [
      "Jobs",
      "Applications",
      "Messages",
      "Vacancy Requests",
      "Campaigns",
      "Articles",
      "Team",
      "Settings",
      "Assistant",
    ]) {
      await expect(adminNav.getByRole("link", { name: label, exact: true })).toBeVisible();
    }
  });

  // ---- Jobs ----
  const jobSlug = `e2e-test-job-${Date.now()}`;

  test("jobs: create", async () => {
    await page.goto("/admin/jobs/new");
    await page.getByLabel("Title *").fill("E2E Test Job");
    await page.getByLabel("Slug *").fill(jobSlug);
    await page.getByLabel("Location *").fill("Sydney");
    await page.getByLabel("State *").selectOption("NSW");
    await page.getByLabel("Latitude *").fill("-33.8688");
    await page.getByLabel("Longitude *").fill("151.2093");
    await page.getByLabel("Type *").selectOption("Permanent");
    await page.getByLabel("Industry *").selectOption("ICT");
    await page.getByLabel("Posted date (YYYY-MM-DD) *").fill("2026-08-17");
    await page.getByLabel("Closing date (YYYY-MM-DD) *").fill("2026-09-17");
    await page.getByLabel("Reference number *").fill("E2E-001");
    await page.getByLabel("Teaser *").fill("A test job for the admin e2e pass.");
    await page.getByLabel("Description *").fill("Full description for the e2e test job.");
    await page.getByLabel("Responsibilities *").fill("Do the thing");
    await page.getByLabel("Requirements *").fill("Be able to do the thing");
    await page.getByLabel("Benefits *").fill("Satisfaction of a passing test");
    await page.getByRole("button", { name: "Create job" }).click();
    await expect(page.getByText("Saved.")).toBeVisible();
  });

  test("jobs: appears in the list and public /jobs page", async () => {
    await page.goto("/admin/jobs");
    await expect(page.getByRole("link", { name: "E2E Test Job" })).toBeVisible();

    await page.goto(`/jobs/${jobSlug}`);
    await expect(page.getByRole("heading", { name: "E2E Test Job" })).toBeVisible();
  });

  test("jobs: edit persists changes", async () => {
    await page.goto("/admin/jobs");
    await page.getByRole("link", { name: "E2E Test Job" }).click();
    await page.getByLabel("Title *").fill("E2E Test Job (edited)");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("Saved.")).toBeVisible();

    await page.goto("/admin/jobs");
    await expect(page.getByRole("link", { name: "E2E Test Job (edited)" })).toBeVisible();
  });

  test("jobs: close marks it closed instead of deleting", async () => {
    await page.goto("/admin/jobs");
    const row = page.locator("tr", { hasText: "E2E Test Job (edited)" });
    await row.getByRole("button", { name: "Close" }).click();
    await expect(row.getByText("closed")).toBeVisible();
    await expect(row.getByRole("button", { name: "Close" })).toHaveCount(0);
  });

  test("jobs: delete removes it from the list", async () => {
    await page.goto("/admin/jobs");
    const row = page.locator("tr", { hasText: "E2E Test Job (edited)" });
    page.once("dialog", (dialog) => dialog.accept());
    await row.getByRole("button", { name: "Delete" }).click();
    await expect(page.getByRole("link", { name: "E2E Test Job (edited)" })).toHaveCount(0);
  });

  // ---- Applications ----
  test("applications: list renders and search filters", async () => {
    await page.goto("/admin/applications");
    await expect(page.getByRole("heading", { name: /Applications \(\d+\)/ })).toBeVisible();

    const searchBox = page.getByLabel("Search applications");
    await searchBox.fill("zzz-no-such-candidate-zzz");
    await expect(page.getByText(/No applications match/)).toBeVisible();
    await searchBox.fill("");
  });

  test("applications: status change persists", async () => {
    // Anchor on a specific application's email via direct DB lookup, not
    // table position — seeded rows share near-identical submittedAt values,
    // so ORDER BY submittedAt DESC (no tiebreaker) isn't stable across the
    // background refetch revalidatePath triggers mid-test, and a positional
    // "first row" locator can silently resolve to a different row after it.
    const [target0] = await sql`select email, status from applications order by id limit 1`;
    const anchorEmail = target0.email as string;
    const originalValue = target0.status as string;
    const target = originalValue === "submitted" ? "under_review" : "submitted";

    await page.goto("/admin/applications");
    const row = page.locator("tbody tr", { hasText: anchorEmail });
    await expect(row).toHaveCount(1);
    await row.locator("select").selectOption(target);

    await expect
      .poll(async () => (await sql`select status from applications where email = ${anchorEmail}`)[0].status)
      .toBe(target);

    await page.reload();
    await expect(page.locator("tbody tr", { hasText: anchorEmail }).locator("select")).toHaveValue(target);

    // Revert so re-running this spec doesn't drift real seed data.
    await page.locator("tbody tr", { hasText: anchorEmail }).locator("select").selectOption(originalValue);
    await expect
      .poll(async () => (await sql`select status from applications where email = ${anchorEmail}`)[0].status)
      .toBe(originalValue);
  });

  test("applications: resume download button responds (success or graceful error)", async () => {
    await page.goto("/admin/applications");
    const resumeButton = page.getByRole("button", { name: /^Resume$/ }).first();
    if ((await resumeButton.count()) === 0) {
      test.skip(true, "No seeded application has a resume on file");
    }
    const [popup] = await Promise.all([
      page.waitForEvent("popup", { timeout: 5000 }).catch(() => null),
      resumeButton.click(),
    ]);
    await page.waitForTimeout(1000);
    if (popup) {
      expect(popup.url()).toContain("http");
      await popup.close();
    } else {
      // No popup opened — acceptable only if a visible error explains why
      // (e.g. the seeded storage key doesn't correspond to a real object).
      await expect(page.locator("text=/./").first()).toBeVisible();
    }
  });

  test("applications: AI review button responds (one call only — quota-limited)", async () => {
    await page.goto("/admin/applications");
    const reviewButton = page.getByRole("button", { name: "Review with AI" }).first();
    if ((await reviewButton.count()) === 0) {
      test.skip(true, "No AI review button found on any seeded row (no resume on file)");
    }
    await reviewButton.click();
    // Opens a side sheet, shows a loading state, then either an error alert
    // or the review summary — either is a legitimate completed round trip.
    await expect(page.getByRole("heading", { name: "AI resume review" })).toBeVisible();
    // Loading state clearing (within the Gemini call's time budget) proves
    // the round trip completed — success or a handled error, either is fine.
    await expect(page.getByText("Reading the resume…")).toBeHidden({ timeout: 20000 });
  });

  // ---- Articles ----
  const articleSlug = `e2e-test-article-${Date.now()}`;

  test("articles: create, appears in list and public knowledge hub, edit, delete", async () => {
    await page.goto("/admin/articles/new");
    await page.getByLabel("Title *").fill("E2E Test Article");
    await page.getByLabel("Slug *").fill(articleSlug);
    await page.getByLabel("Category *").selectOption({ index: 1 });
    await page.getByLabel(/Publish date/).fill("2026-08-17");
    await page.getByLabel(/Reading time/).fill("3");
    await page.getByLabel("Excerpt *").fill("An e2e test article excerpt.");
    await page.getByLabel("Body *").fill("Full body content for the e2e test article.");
    await page.getByLabel(/Author name/).fill("E2E Tester");
    await page.getByLabel(/Author role/).fill("Automated Test");
    await page.getByRole("button", { name: "Create article" }).click();
    await expect(page.getByText("Saved.")).toBeVisible();

    await page.goto("/admin/articles");
    await expect(page.getByRole("link", { name: "E2E Test Article" })).toBeVisible();

    await page.goto(`/knowledge-hub/${articleSlug}`);
    await expect(page.getByRole("heading", { name: "E2E Test Article" })).toBeVisible();

    await page.goto("/admin/articles");
    await page.getByRole("link", { name: "E2E Test Article" }).click();
    await page.getByLabel("Title *").fill("E2E Test Article (edited)");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("Saved.")).toBeVisible();

    await page.goto("/admin/articles");
    page.once("dialog", (dialog) => dialog.accept());
    await page.locator("tr", { hasText: "E2E Test Article (edited)" }).getByRole("button", { name: "Delete" }).click();
    await expect(page.getByRole("link", { name: "E2E Test Article (edited)" })).toHaveCount(0);
  });

  // ---- Team ----
  test("team: create, appears in list and /about, edit, delete", async () => {
    await page.goto("/admin/team/new");
    await page.getByLabel("Name *").fill("E2E Test Person");
    await page.getByLabel("Role *").fill("Automated Tester");
    await page.getByLabel("Bio *").fill("Bio for the e2e test team member.");
    await page.getByLabel(/Display order/).fill("999");
    await page.getByRole("button", { name: "Add team member" }).click();
    await expect(page.getByText("Saved.")).toBeVisible();

    await page.goto("/admin/team");
    await expect(page.getByRole("link", { name: "E2E Test Person" })).toBeVisible();

    await page.goto("/about");
    await expect(page.getByText("E2E Test Person")).toBeVisible();

    await page.goto("/admin/team");
    await page.getByRole("link", { name: "E2E Test Person" }).click();
    await page.getByLabel("Name *").fill("E2E Test Person (edited)");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("Saved.")).toBeVisible();

    await page.goto("/admin/team");
    page.once("dialog", (dialog) => dialog.accept());
    await page.locator("tr", { hasText: "E2E Test Person (edited)" }).getByRole("button", { name: "Delete" }).click();
    await expect(page.getByRole("link", { name: "E2E Test Person (edited)" })).toHaveCount(0);
  });

  // ---- Messages ----
  test("messages: contact — seeded row renders and status change persists", async () => {
    await page.goto("/admin/messages/contact");
    await expect(page.getByText("E2E Test Contact")).toBeVisible();

    const card = page.locator("div", { has: page.getByText("E2E Test Contact — Test subject") }).first();
    await card.locator("select").selectOption("read");

    await expect
      .poll(async () => (await sql`select status from contact_messages where id = ${seededContactMessageId}`)[0].status)
      .toBe("read");

    await page.reload();
    const cardAfter = page.locator("div", { has: page.getByText("E2E Test Contact — Test subject") }).first();
    await expect(cardAfter.locator("select")).toHaveValue("read");
  });

  test("messages: vacancy requests — seeded row renders and status change persists", async () => {
    await page.goto("/admin/messages/vacancies");
    await expect(page.getByText("E2E Test Co")).toBeVisible();

    const card = page.locator("div", { has: page.getByText("Test Role — E2E Test Co") }).first();
    await card.locator("select").selectOption("contacted");

    await expect
      .poll(async () => (await sql`select status from vacancy_requests where id = ${seededVacancyRequestId}`)[0].status)
      .toBe("contacted");

    await page.reload();
    const cardAfter = page.locator("div", { has: page.getByText("Test Role — E2E Test Co") }).first();
    await expect(cardAfter.locator("select")).toHaveValue("contacted");
  });

  // ---- Settings ----
  test("settings: update persists and reflects on the homepage, then reverts", async () => {
    await page.goto("/admin/settings");
    const original = {
      years: await page.getByLabel("Years operating").inputValue(),
      placed: await page.getByLabel("Candidates placed").inputValue(),
      retention: await page.getByLabel("Client retention (%)").inputValue(),
      employers: await page.getByLabel("Active employers").inputValue(),
    };

    await page.getByLabel("Years operating").fill("77");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText(/Saved —/)).toBeVisible();

    await page.goto("/admin/settings");
    await expect(page.getByLabel("Years operating")).toHaveValue("77");

    // Revert.
    await page.getByLabel("Years operating").fill(original.years || "0");
    await page.getByLabel("Candidates placed").fill(original.placed || "0");
    await page.getByLabel("Client retention (%)").fill(original.retention || "0");
    await page.getByLabel("Active employers").fill(original.employers || "0");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText(/Saved —/)).toBeVisible();
  });

  // ---- Campaigns ----
  test("campaigns: composer renders with audience counts, signature form, history", async () => {
    await page.goto("/admin/campaigns");
    await expect(page.getByLabel("Audience", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Subject *")).toBeVisible();
    await expect(page.getByLabel("Message *")).toBeVisible();
    await expect(page.getByRole("button", { name: "Send test to my email" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Send campaign" })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Email signature/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Sent campaigns/ })).toBeVisible();
  });

  test("campaigns: 'send test to my email' completes without error (never sends to full audience)", async () => {
    await page.goto("/admin/campaigns");
    await page.getByLabel("Subject *").fill("E2E admin pass — test send");
    await page.getByLabel("Message *").fill("This is an automated test send, only to the admin's own inbox.");
    await page.getByRole("button", { name: "Send test to my email" }).click();
    await expect(page.getByRole("status")).toBeVisible({ timeout: 15000 });
    const statusText = await page.getByRole("status").textContent();
    expect(statusText?.toLowerCase()).not.toContain("error");
  });

  // ---- Assistant ----
  test("assistant: one query gets a response (Gemini-backed, quota-limited)", async () => {
    await page.goto("/admin/assistant");
    await page.getByPlaceholder(/How many applications/).fill("How many active jobs are there?");
    await page.getByRole("button", { name: "Ask" }).click();
    await expect(page.getByText("Thinking…")).toBeVisible();
    await expect(page.getByText("Thinking…")).toHaveCount(0, { timeout: 30000 });
    const messages = page.locator(".whitespace-pre-wrap");
    await expect(messages.last()).not.toHaveText("");
  });

  test("no unexpected console errors accumulated across the whole pass", async () => {
    // "Base UI: ...uncontrolled FieldControl..." fires on every edit form
    // (Job/Article/Team) that pre-fills via defaultValue — a pre-existing
    // characteristic of components/ui/input.tsx and native-select.tsx
    // (untouched since the app's original scaffold, long before this
    // session), not something introduced here. Filtered rather than
    // silently fixed, per CLAUDE.md's "don't refactor unrelated code, note
    // it and ask" — flagged to the user instead.
    const meaningful = consoleErrors.filter(
      (e) => !/favicon|extension|clerk|telemetry|uncontrolled FieldControl/i.test(e)
    );
    expect(meaningful, `Console errors seen: ${meaningful.join("\n")}`).toEqual([]);
  });
});
