import { expect, test } from "@playwright/test";

test.describe("Navigation", () => {
  test("protected /portal redirects unauthenticated visitors to sign-in", async ({ page }) => {
    await page.goto("/portal");
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("protected /admin redirects unauthenticated visitors to sign-in", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/sign-in/);
  });
});

test.describe("Mobile navigation", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("hamburger opens the mobile menu", async ({ page }) => {
    await page.goto("/");

    // Desktop nav is hidden at this width; the hamburger trigger is present.
    const trigger = page.getByRole("button", { name: /open menu/i });
    await expect(trigger).toBeVisible();

    await trigger.click();

    // The slide-out sheet exposes primary nav links.
    await expect(page.getByRole("link", { name: /jobs/i }).first()).toBeVisible();
  });
});
