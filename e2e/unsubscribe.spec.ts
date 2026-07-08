import { createHmac } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { expect, test } from "@playwright/test";

// Playwright doesn't load .env; read the values the full-flow test needs
// directly so the test can skip cleanly when they aren't configured.
function readEnvVar(name: string): string | undefined {
  try {
    const env = fs.readFileSync(path.join(__dirname, "..", ".env"), "utf8");
    const line = env.split(/\r?\n/).find((entry) => entry.startsWith(`${name}=`));
    const value = line?.slice(name.length + 1).trim();
    return value || undefined;
  } catch {
    return undefined;
  }
}

test.describe("Campaign unsubscribe page", () => {
  test("shows an error state without a token", async ({ page }) => {
    await page.goto("/email-preferences/unsubscribe");

    await expect(page.getByRole("heading", { name: /link not valid/i })).toBeVisible();
  });

  test("shows an error state for a forged token", async ({ page }) => {
    await page.goto(
      "/email-preferences/unsubscribe?email=someone%40example.com&token=deadbeef"
    );

    await expect(page.getByRole("heading", { name: /link not valid/i })).toBeVisible();
  });

  test("shows the confirmation for the done state", async ({ page }) => {
    await page.goto("/email-preferences/unsubscribe?done=1");

    await expect(
      page.getByRole("heading", { name: /you.ve been unsubscribed/i })
    ).toBeVisible();
  });

  test("a valid link requires a confirm click, then unsubscribes", async ({ page }, testInfo) => {
    const secret = readEnvVar("CAMPAIGN_UNSUBSCRIBE_SECRET");
    const databaseUrl = readEnvVar("DATABASE_URL");
    test.skip(!secret || !databaseUrl, "needs CAMPAIGN_UNSUBSCRIBE_SECRET and DATABASE_URL in .env");

    const email = `e2e-unsub-${testInfo.project.name}-${testInfo.workerIndex}@example.com`;
    const token = createHmac("sha256", secret!).update(email).digest("hex");

    await page.goto(
      `/email-preferences/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`
    );

    // GET render must NOT unsubscribe (link scanners prefetch these URLs).
    await expect(
      page.getByRole("heading", { name: /unsubscribe from illora emails\?/i })
    ).toBeVisible();

    await page.getByRole("button", { name: /unsubscribe/i }).click();
    await expect(
      page.getByRole("heading", { name: /you.ve been unsubscribed/i })
    ).toBeVisible();

    // Verify the suppression row landed, then clean up the test address.
    const postgres = (await import("postgres")).default;
    const sql = postgres(databaseUrl!);
    try {
      const rows = await sql`select email from email_suppressions where email = ${email}`;
      expect(rows.length).toBe(1);
      await sql`delete from email_suppressions where email = ${email}`;
    } finally {
      await sql.end();
    }
  });
});
