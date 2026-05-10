import { test, expect } from "@playwright/test";

test("submits valid contact form", async ({ page }) => {
  await page.goto("/contact");
  await page.fill('input[name="name"]', "Ada Lovelace");
  await page.fill('textarea[name="message"]', "this is a real message with more than 10 chars");
  await page.getByRole("button", { name: /SEND MESSAGE/ }).click();
  await expect(page.getByText(/queued/i)).toBeVisible();
});

test("rejects empty message via HTML5 validation", async ({ page }) => {
  await page.goto("/contact");
  await page.fill('input[name="name"]', "Ada");
  const button = page.getByRole("button", { name: /SEND MESSAGE/ });
  await button.click();
  expect(page.url()).toContain("/contact");
});
