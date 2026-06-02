import { expect, test } from "@playwright/test";

test.describe("subscribers list", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/suscriptores");
  });

  test("page renders without redirecting", async ({ page }) => {
    await expect(page).not.toHaveURL(/\/admin\/login/);
    await expect(page.locator(".admin-page")).toBeVisible();
  });

  test("filter bar is visible", async ({ page }) => {
    await expect(page.locator(".mod-filters")).toBeVisible();
  });

  test("filter buttons cover all statuses", async ({ page }) => {
    await expect(page.getByRole("button", { name: /todos/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /confirmados/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /pendientes/i })).toBeVisible();
    await expect(page.locator(".mod-filters").getByRole("button", { name: /baja/i })).toBeVisible();
  });

  test("search input is present", async ({ page }) => {
    await expect(page.locator('input[type="search"]')).toBeVisible();
  });

  test("CSV export button is present", async ({ page }) => {
    await expect(page.getByRole("button", { name: /exportar csv/i })).toBeVisible();
  });

  test("shows empty state or subscriber list", async ({ page }) => {
    const isEmpty = await page.locator("text=No hay suscriptores").isVisible();
    const hasList = await page.locator(".sub-list").isVisible();
    expect(isEmpty || hasList).toBe(true);
  });

  test("search input filters the visible list", async ({ page }) => {
    const searchInput = page.locator('input[type="search"]');
    await searchInput.fill("nonexistent-zzz@test.com");
    await expect(page.locator("text=No hay suscriptores")).toBeVisible({ timeout: 3000 });
  });
});
