import { test, expect } from "@playwright/test";

test("home renders hero + sections", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /67 Projects/i })).toBeVisible();
  await expect(page.getByText(/shipped/i).first()).toBeVisible();
});

test("home has no console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  expect(errors).toEqual([]);
});
