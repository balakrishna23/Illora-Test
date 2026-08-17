import { expect, test, type Page } from "@playwright/test";
import postgres from "postgres";

// Deep pass over the candidate portal, driven as a real signed-in (non-admin)
// candidate. Mirrors the rigor of admin.spec.ts: real account, real DB
// verification of state changes, cleans up everything it creates.

const CANDIDATE_EMAIL = "claude-portal-test@example.com";
const CANDIDATE_PASSWORD = "PortalTest12345!";
const NEW_PASSWORD = "PortalTestNew6789!";
const SAVE_JOB_SLUG = "aged-care-nurse-unit-manager-cairns";

const sql = postgres(process.env.DATABASE_URL!);
let userId: string;
let candidateId: string;
let seededApplicationId: string;

async function adminUsersFetch(path: string, init?: RequestInit): Promise<{ status: number; body: { id: string } }> {
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
  const created = await adminUsersFetch("/auth/v1/admin/users", {
    method: "POST",
    body: JSON.stringify({ email: CANDIDATE_EMAIL, password: CANDIDATE_PASSWORD, email_confirm: true }),
  });
  userId = created.body.id;

  [{ id: candidateId }] = await sql`
    insert into candidates (auth_user_id, email)
    values (${userId}, ${CANDIDATE_EMAIL})
    returning id
  `;

  [{ id: seededApplicationId }] = await sql`
    insert into applications (candidate_id, name, email, phone, target_industry, "current_role", security_clearance, status, resume_storage_key)
    values (${candidateId}, 'E2E Portal Test', ${CANDIDATE_EMAIL}, '0400000000', 'ICT', 'Tester', 'None', 'under_review', 'resumes/e2e-portal-test.pdf')
    returning id
  `;
});

test.afterAll(async () => {
  await sql`delete from saved_jobs where candidate_id = ${candidateId}`;
  await sql`delete from applications where id = ${seededApplicationId}`;
  await sql`delete from candidates where id = ${candidateId}`;
  await sql.end();
  if (userId) {
    await adminUsersFetch(`/auth/v1/admin/users/${userId}`, { method: "DELETE" });
  }
});

test.describe.serial("Candidate portal — deep pass", () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterAll(async () => {
    await page.close();
  });

  test("signs in with the candidate test account", async () => {
    await page.goto("/sign-in");
    await page.getByLabel(/email/i).fill(CANDIDATE_EMAIL);
    await page.getByLabel(/^password$/i).fill(CANDIDATE_PASSWORD);
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/portal/);
  });

  test("shows the seeded application with its status", async () => {
    await page.goto("/portal");
    await expect(page.getByText(/general cv submission/i).or(page.getByText("E2E Portal Test"))).toBeVisible();
    await expect(page.getByText("Under review")).toBeVisible();
  });

  test("saving a job from the public listing adds it to the portal", async () => {
    await page.goto(`/jobs/${SAVE_JOB_SLUG}`);
    await page.getByRole("button", { name: /save job/i }).click();
    await expect(page.getByRole("button", { name: /^saved$/i })).toBeVisible();

    await expect
      .poll(async () => (await sql`select count(*)::int as n from saved_jobs where candidate_id = ${candidateId}`)[0].n)
      .toBe(1);

    await page.goto("/portal");
    await expect(page.getByRole("link", { name: /aged care nurse unit manager/i })).toBeVisible();
  });

  test("unsaving from the portal removes it", async () => {
    await page.goto("/portal");
    await page.getByRole("button", { name: /^saved$/i }).click();

    await expect
      .poll(async () => (await sql`select count(*)::int as n from saved_jobs where candidate_id = ${candidateId}`)[0].n)
      .toBe(0);

    await page.reload();
    await expect(page.getByText(/no saved jobs yet/i)).toBeVisible();
  });

  test("account: rejects a password change with the wrong current password", async () => {
    await page.goto("/portal/account");
    await page.getByLabel("Current password").fill("definitely-wrong");
    await page.getByLabel("New password", { exact: true }).fill(NEW_PASSWORD);
    await page.getByLabel("Confirm new password", { exact: true }).fill(NEW_PASSWORD);
    await page.getByRole("button", { name: "Update password" }).click();

    await expect(page.getByRole("status").filter({ hasText: /current password is incorrect/i })).toBeVisible();
  });

  test("account: changes the password with the correct current password, and it actually takes effect", async () => {
    await page.goto("/portal/account");
    await page.getByLabel("Current password").fill(CANDIDATE_PASSWORD);
    await page.getByLabel("New password", { exact: true }).fill(NEW_PASSWORD);
    await page.getByLabel("Confirm new password", { exact: true }).fill(NEW_PASSWORD);
    await page.getByRole("button", { name: "Update password" }).click();

    await expect(page.getByText(/your password has been updated/i)).toBeVisible();

    await page.context().clearCookies();
    await page.goto("/sign-in");
    await page.getByLabel(/email/i).fill(CANDIDATE_EMAIL);
    await page.getByLabel(/^password$/i).fill(CANDIDATE_PASSWORD);
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForTimeout(1000);
    expect(page.url()).toContain("/sign-in");

    await page.goto("/sign-in");
    await page.getByLabel(/email/i).fill(CANDIDATE_EMAIL);
    await page.getByLabel(/^password$/i).fill(NEW_PASSWORD);
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/portal/);
  });

  test("account: requesting an email change never changes the email immediately either way", async () => {
    await page.goto("/portal/account");
    await expect(page.getByText(`Current email: ${CANDIDATE_EMAIL}`)).toBeVisible();

    await page.getByLabel("New email").fill("claude-portal-test-new@example.com");
    await page.getByRole("button", { name: "Update email" }).click();

    // Supabase's updateUser({email}) triggers the Send Email Hook
    // (src/app/api/auth/send-email) to send the change-confirmation email —
    // Supabase's cloud infra calls that hook over the public internet, which
    // can't reach a local dev server. So locally this legitimately errors
    // ("Could not update your email"); in a deployed environment it would
    // show the "check your email" pending-confirmation message instead.
    // Either way, the one thing that must hold is that the email never
    // changes immediately — confirming isn't optional.
    await expect(page.getByRole("status")).toBeVisible();

    const [{ email: stillOldEmail }] = await sql`select email from auth.users where id = ${userId}`;
    expect(stillOldEmail).toBe(CANDIDATE_EMAIL);
  });
});
