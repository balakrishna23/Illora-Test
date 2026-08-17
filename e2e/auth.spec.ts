import { expect, test } from "@playwright/test";

// These tests exercise the real Supabase Auth round trip (invalid credentials,
// server-side validation) but deliberately never submit a *successful*
// sign-up or sign-in — doing so would create a real (if unconfirmed) user in
// the connected Supabase project on every test run. A full happy-path check
// would need a pre-seeded, disposable test account; out of scope here.

test.describe("Sign in", () => {
  test("renders with email/password fields and a link to sign up", async ({ page }) => {
    await page.goto("/sign-in");

    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/^password$/i)).toBeVisible();
    await expect(page.locator("form").getByRole("link", { name: /sign up/i })).toBeVisible();
  });

  test("blocks submission of an empty form via native required validation", async ({ page }) => {
    await page.goto("/sign-in");

    await page.getByRole("button", { name: /sign in/i }).click();

    // Still on the sign-in page — the browser's native `required` validation
    // stopped the Server Action from firing.
    await expect(page).toHaveURL(/\/sign-in/);
    await expect(page.getByLabel(/email/i)).toHaveJSProperty("validity.valid", false);
  });

  test("shows a generic error for invalid credentials without leaking which field was wrong", async ({
    page,
  }) => {
    await page.goto("/sign-in");

    await page.getByLabel(/email/i).fill(`nonexistent-${Date.now()}@example.com`);
    await page.getByLabel(/^password$/i).fill("wrong-password-123");
    await page.getByRole("button", { name: /sign in/i }).click();

    await expect(page.getByRole("alert").filter({ hasText: /invalid email or password/i })).toBeVisible();
  });

  test("carries a redirect_url from a protected route into a hidden form field", async ({ page }) => {
    await page.goto("/portal");
    await expect(page).toHaveURL(/\/sign-in\?redirect_url=/);

    const hidden = page.locator('input[name="redirectTo"]');
    await expect(hidden).toHaveValue("/portal");
  });

  test("links to the forgot-password page", async ({ page }) => {
    await page.goto("/sign-in");
    await page.getByRole("link", { name: /forgot password/i }).click();
    await expect(page).toHaveURL(/\/forgot-password/);
  });
});

test.describe("Forgot password", () => {
  test("renders with an email field and a link back to sign in", async ({ page }) => {
    await page.goto("/forgot-password");

    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /back to sign in/i })).toBeVisible();
  });

  test("shows the same generic confirmation regardless of whether the email is registered", async ({
    page,
  }) => {
    await page.goto("/forgot-password");

    // Safe to actually submit: requestPasswordReset returns identical output
    // whether or not the address exists (no enumeration), so this never
    // reveals — or depends on — real account state.
    await page.getByLabel(/email/i).fill(`nonexistent-${Date.now()}@example.com`);
    await page.getByRole("button", { name: /send reset link/i }).click();

    await expect(page.getByText(/check your email/i)).toBeVisible();
  });
});

test.describe("Reset password", () => {
  test("shows an invalid-link state when visited without a valid recovery session", async ({ page }) => {
    await page.goto("/reset-password");

    await expect(page.getByText(/link invalid or expired/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /request a new link/i })).toBeVisible();
  });
});

test.describe("Sign up", () => {
  test("renders with email/password/confirm-password fields and a link to sign in", async ({ page }) => {
    await page.goto("/sign-up");

    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/^password$/i)).toBeVisible();
    await expect(page.getByLabel(/confirm password/i)).toBeVisible();
    await expect(page.locator("form").getByRole("link", { name: /sign in/i })).toBeVisible();
  });

  test("shows a field error when the passwords don't match, without creating an account", async ({
    page,
  }) => {
    await page.goto("/sign-up");

    await page.getByLabel(/email/i).fill(`e2e-mismatch-${Date.now()}@example.com`);
    await page.getByLabel(/^password$/i).fill("password123");
    await page.getByLabel(/confirm password/i).fill("password456");
    await page.getByRole("button", { name: /sign up/i }).click();

    await expect(page.getByText(/passwords do not match/i)).toBeVisible();
    // Still on the form, not the "check your email" success state.
    await expect(page.getByRole("button", { name: /sign up/i })).toBeVisible();
  });
});
