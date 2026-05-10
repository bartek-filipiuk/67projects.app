import { test, expect } from "@playwright/test";

test("projects list -> detail flow", async ({ page }) => {
  await page.goto("/projects");
  await expect(page.locator(".file-card").first()).toBeVisible();
  await page.locator(".file-card").first().click();
  await expect(page.getByRole("button", { name: /BUY NOW/ })).toBeVisible();
  await expect(page.getByText(/ROI/)).toBeVisible();
});

test("category filter narrows list", async ({ page }) => {
  await page.goto("/projects");
  const initial = await page.locator(".file-card").count();
  await page.getByRole("button", { name: /BOILERPLATES/i }).click();
  await page.waitForTimeout(100);
  const filtered = await page.locator(".file-card").count();
  expect(filtered).toBeLessThanOrEqual(initial);
  expect(filtered).toBeGreaterThan(0);
});
