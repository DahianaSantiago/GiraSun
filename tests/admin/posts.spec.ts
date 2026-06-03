import { expect, test } from "@playwright/test";

test.describe("admin post editor — cuentos", () => {
  test("cuentos index renders", async ({ page }) => {
    await page.goto("/admin/cuentos");
    await expect(page).not.toHaveURL(/\/admin\/login/);
    await expect(page.locator(".admin-page")).toBeVisible();
  });

  test("new cuento button is present", async ({ page }) => {
    await page.goto("/admin/cuentos");
    await expect(
      page.locator("main, .admin-page").getByRole("link", { name: /nuevo/i }),
    ).toBeVisible();
  });

  test.describe("new cuento form", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/admin/cuentos/new");
    });

    test("renders the editor without redirecting", async ({ page }) => {
      await expect(page).not.toHaveURL(/\/admin\/login/);
      await expect(page.locator(".post-editor")).toBeVisible();
    });

    test("title input is present and accepts text", async ({ page }) => {
      const titleInput = page.getByLabel("Título", { exact: true });
      await expect(titleInput).toBeVisible();
      await titleInput.fill("El jardín de las memorias");
      await expect(titleInput).toHaveValue("El jardín de las memorias");
    });

    test("slug auto-fills from title", async ({ page }) => {
      const titleInput = page.getByLabel("Título", { exact: true });
      const slugField = page.locator('input[placeholder="casa-agosto"]');
      await expect(slugField).toBeVisible();

      await titleInput.fill("El jardín de las memorias");
      await expect(slugField).toHaveValue(/jardin-de-las-memorias/);
    });

    test("excerpt is auto-generated (read-only preview present)", async ({ page }) => {
      await expect(page.getByTestId("excerpt-preview")).toBeVisible();
    });

    test("save dropdown is present and enabled", async ({ page }) => {
      const saveBtn = page.getByRole("button", { name: /^guardar$/i });
      await expect(saveBtn).toBeVisible();
      await expect(saveBtn).toBeEnabled();
    });

    test("save dropdown opens with the three options", async ({ page }) => {
      await page.getByRole("button", { name: /^guardar$/i }).click();
      const menu = page.getByRole("menu");
      await expect(menu.getByRole("menuitem", { name: /guardar y salir/i })).toBeVisible();
      await expect(menu.getByRole("menuitem", { name: /guardar borrador/i })).toBeVisible();
      await expect(menu.getByRole("menuitem", { name: /guardar y publicar/i })).toBeVisible();
    });

    test("no standalone publish button exists outside the menu", async ({ page }) => {
      // Publishing now lives inside the Save dropdown; there should be no separate
      // top-level Publicar button while the menu is closed.
      await expect(page.getByRole("button", { name: /publicar/i })).toHaveCount(0);
    });

    test("save dropdown closes when clicking outside", async ({ page }) => {
      await page.getByRole("button", { name: /^guardar$/i }).click();
      await expect(page.getByRole("menu")).toBeVisible();
      await page.getByRole("button", { name: /cerrar menú/i }).click();
      await expect(page.getByRole("menu")).toHaveCount(0);
    });

    // TODO: Chrome's CDP strips the Cookie header in route.continue() (forbidden header),
    // so the server action POST never sees the session cookie. Needs a proper fix.
    test.skip("'guardar y salir' navigates back to the list", async ({ page }) => {
      await page.getByLabel("Título", { exact: true }).fill("Cuento de prueba E2E");

      await page.getByRole("button", { name: /^guardar$/i }).click();
      await page.getByRole("menuitem", { name: /guardar y salir/i }).click();

      await expect(page).toHaveURL(/\/admin\/cuentos$/, { timeout: 10_000 });
    });
  });
});

test.describe("admin post editor — escritos", () => {
  test("escritos index renders", async ({ page }) => {
    await page.goto("/admin/escritos");
    await expect(page).not.toHaveURL(/\/admin\/login/);
    await expect(page.locator(".admin-page")).toBeVisible();
  });

  test("new escrito form renders", async ({ page }) => {
    await page.goto("/admin/escritos/new");
    await expect(page.locator(".post-editor")).toBeVisible();
  });
});
