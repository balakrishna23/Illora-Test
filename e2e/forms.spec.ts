import { expect, test } from "@playwright/test";

test.describe("Public forms", () => {
  test("Submit CV form renders with a hidden honeypot and no cover-letter field", async ({ page }) => {
    await page.goto("/candidates/submit-cv");

    await expect(page.getByLabel(/full name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();

    // Cover letter was removed.
    await expect(page.getByText(/cover letter/i)).toHaveCount(0);

    // Honeypot exists in the DOM but is hidden from users.
    // Honeypot uses the off-screen technique (not display:none, so naive bots
    // still fill it) — so assert it's out of the viewport rather than "hidden".
    const honeypot = page.locator('input[name="contactFax"]');
    await expect(honeypot).toHaveCount(1);
    await expect(honeypot).not.toBeInViewport();
  });

  test("Submit CV blocks submission until a resume is provided", async ({ page }) => {
    await page.goto("/candidates/submit-cv");
    // The submit button is disabled without a resume key (client-gated).
    const submit = page.getByRole("button", { name: /submit cv/i });
    await expect(submit).toBeDisabled();
  });

  test("Contact form renders with a hidden honeypot", async ({ page }) => {
    await page.goto("/contact");

    await expect(page.getByLabel(/name/i).first()).toBeVisible();
    await expect(page.getByLabel(/message/i)).toBeVisible();

    // Honeypot uses the off-screen technique (not display:none, so naive bots
    // still fill it) — so assert it's out of the viewport rather than "hidden".
    const honeypot = page.locator('input[name="contactFax"]');
    await expect(honeypot).toHaveCount(1);
    await expect(honeypot).not.toBeInViewport();
  });
});
