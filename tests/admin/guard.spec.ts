// Tests the auth guard on /admin routes.
// These tests deliberately bypass the admin storageState so they run unauthenticated.
import { expect, test } from "@playwright/test";

// Override the project-level storageState for this file — no session.
test.use({ storageState: { cookies: [], origins: [] } });

const PROTECTED_ROUTES = [
  "/admin",
  "/admin/cuentos",
  "/admin/escritos",
  "/admin/comentarios",
  "/admin/suscriptores",
  "/admin/newsletter",
  "/admin/configuracion",
];

for (const route of PROTECTED_ROUTES) {
  test(`${route} redirects to /admin/login when not authenticated`, async ({ page }) => {
    await page.goto(route);
    await expect(page).toHaveURL(/\/admin\/login/, { timeout: 5000 });
  });
}

test("/admin/login is accessible without authentication", async ({ page }) => {
  await page.goto("/admin/login");
  await expect(page).not.toHaveURL(/\/admin\/login\?error/);
  await expect(page.locator("body")).toBeVisible();
});
