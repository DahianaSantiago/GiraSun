import { expect, test } from "@playwright/test";

test.describe("comment moderation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/comentarios");
  });

  test("page renders without redirecting", async ({ page }) => {
    await expect(page).not.toHaveURL(/\/admin\/login/);
    await expect(page.locator(".admin-page")).toBeVisible();
  });

  test("filter bar is visible", async ({ page }) => {
    await expect(page.locator(".mod-filters")).toBeVisible();
  });

  test("filter buttons are present", async ({ page }) => {
    await expect(page.getByRole("button", { name: /todos/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /ocultos/i })).toBeVisible();
  });

  test("search input is present", async ({ page }) => {
    await expect(page.locator(".mod-search")).toBeVisible();
  });

  test("shows empty state or comment groups", async ({ page }) => {
    // Either shows "No hay comentarios" text (may appear in multiple elements) or the group list
    const emptyCount = await page.getByText(/No hay comentarios/).count();
    const hasGroups = await page.locator(".mcl-groups").isVisible();
    expect(emptyCount > 0 || hasGroups).toBe(true);
  });
});
