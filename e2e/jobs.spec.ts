import { expect, test } from "@playwright/test";

test.describe("Jobs", () => {
  test("lists jobs and navigates to a job detail", async ({ page }) => {
    await page.goto("/jobs");

    // At least one job card links to a /jobs/<slug> detail page.
    const firstJobLink = page.locator('a[href^="/jobs/"]').first();
    await expect(firstJobLink).toBeVisible();

    const href = await firstJobLink.getAttribute("href");
    expect(href).toMatch(/^\/jobs\/.+/);

    await firstJobLink.click();
    await expect(page).toHaveURL(/\/jobs\/.+/);

    // Detail page shows an apply path to submit-cv.
    await expect(page.locator('a[href*="/candidates/submit-cv"]').first()).toBeVisible();
  });
});
