import { expect, test } from "@playwright/test";

test.describe("admin dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin");
  });

  test("loads without redirecting to login", async ({ page }) => {
    await expect(page).not.toHaveURL(/\/admin\/login/);
  });

  test("sidebar navigation is visible", async ({ page }) => {
    await expect(page.locator(".admin-sidebar")).toBeVisible();
  });

  test("sidebar links to all main admin sections", async ({ page }) => {
    const sidebar = page.locator(".admin-sidebar");
    await expect(sidebar.getByRole("link", { name: /cuentos/i })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: /escritos/i })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: /comentarios/i })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: /suscriptores/i })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: /newsletter/i })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: /configuración/i })).toBeVisible();
  });

  test("dashboard page renders a heading", async ({ page }) => {
    await expect(page.locator(".admin-page-head")).toBeVisible();
  });
});
