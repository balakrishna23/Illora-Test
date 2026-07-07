import { expect, test } from "@playwright/test";

test.describe("Homepage", () => {
  test("renders hero, key sections, and CTAs", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Recruitment that delivers real outcomes"
    );

    // "Behind the Name" block with the real etymology (heading + body both
    // contain the phrase — assert the first is visible).
    await expect(page.getByText("a pleasant place").first()).toBeVisible();

    // Trust signals — the header badge is hidden on mobile, so assert the
    // first *visible* Supply Nation mention (hero eyebrow / trust strip).
    await expect(page.getByText(/Supply Nation/i).filter({ visible: true }).first()).toBeVisible();
  });

  test("has no obvious console errors on load", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    await page.goto("/");
    // Clerk dev-key telemetry warnings are noise; assert no hard page errors.
    const real = errors.filter((e) => !/clerk|telemetry/i.test(e));
    expect(real).toEqual([]);
  });
});
