import { expect, test } from "@playwright/test";

test.describe("home page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("renders without error", async ({ page }) => {
    await expect(page).toHaveTitle(/GiraSun/i);
  });

  test("navigation is visible", async ({ page }) => {
    await expect(page.locator("nav")).toBeVisible();
  });

  test("newsletter signup section is present", async ({ page }) => {
    const section = page.locator(".newsletter").first();
    await expect(section).toBeVisible();
  });

  test("newsletter form has email input and submit button", async ({ page }) => {
    const form = page.locator(".newsletter form").first();
    await expect(form.locator('input[type="email"]')).toBeVisible();
    await expect(form.locator('button[type="submit"]')).toBeVisible();
  });
});
