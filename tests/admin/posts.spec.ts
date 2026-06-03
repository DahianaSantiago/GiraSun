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

    test("save draft button is present and enabled", async ({ page }) => {
      const saveBtn = page.getByRole("button", { name: /guardar borrador/i });
      await expect(saveBtn).toBeVisible();
      await expect(saveBtn).toBeEnabled();
    });

    test("publish button is disabled before saving (no id yet)", async ({ page }) => {
      const publishBtn = page.getByRole("button", { name: /publicar/i });
      await expect(publishBtn).toBeDisabled();
    });

    // TODO: Chrome's CDP strips the Cookie header in route.continue() (forbidden header),
    // so the server action POST never sees the session cookie. Needs a proper fix.
    test.skip("saving a draft navigates back to the list", async ({ page }) => {
      await page.getByLabel("Título", { exact: true }).fill("Cuento de prueba E2E");
      await page.locator("textarea").fill("Un resumen breve del cuento.");

      const saveBtn = page.getByRole("button", { name: /guardar borrador/i });
      await saveBtn.click();

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
