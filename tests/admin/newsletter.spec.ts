import { expect, test } from "@playwright/test";

test.describe("newsletter composer", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/newsletter");
  });

  test("page renders without redirecting", async ({ page }) => {
    await expect(page).not.toHaveURL(/\/admin\/login/);
    await expect(page.locator(".admin-page")).toBeVisible();
  });

  test("subject input is present", async ({ page }) => {
    await expect(page.locator("#nl-subject")).toBeVisible();
  });

  test("TipTap editor is present", async ({ page }) => {
    await expect(page.locator(".tiptap-editor")).toBeVisible();
  });

  test("send button is disabled when subject and body are empty", async ({ page }) => {
    const sendBtn = page.getByRole("button", { name: /enviar carta/i });
    await expect(sendBtn).toBeDisabled();
  });

  test("send button remains disabled with only a subject", async ({ page }) => {
    await page.locator("#nl-subject").fill("Una carta de mayo");
    const sendBtn = page.getByRole("button", { name: /enviar carta/i });
    await expect(sendBtn).toBeDisabled();
  });

  test("send button enables once both subject and body are filled", async ({ page }) => {
    await page.locator("#nl-subject").fill("Una carta de mayo");
    // Click into the TipTap editor and type
    const editor = page.locator(".tiptap-editor .ProseMirror");
    await editor.click();
    await editor.type("Queridos lectores, bienvenidos a GiraSun.");

    const sendBtn = page.getByRole("button", { name: /enviar carta/i });
    await expect(sendBtn).toBeEnabled({ timeout: 3000 });
  });

  test("clicking send opens a confirmation modal", async ({ page }) => {
    await page.locator("#nl-subject").fill("Una carta de mayo");
    const editor = page.locator(".tiptap-editor .ProseMirror");
    await editor.click();
    await editor.type("Contenido de la carta.");

    await page.getByRole("button", { name: /enviar carta/i }).click();
    await expect(page.locator(".modal-panel")).toBeVisible({ timeout: 3000 });
    await expect(page.locator(".modal-title")).toContainText(/enviar/i);
  });

  test("confirmation modal can be cancelled", async ({ page }) => {
    await page.locator("#nl-subject").fill("Una carta de mayo");
    const editor = page.locator(".tiptap-editor .ProseMirror");
    await editor.click();
    await editor.type("Contenido de la carta.");

    await page.getByRole("button", { name: /enviar carta/i }).click();
    await page.getByRole("button", { name: /cancelar/i }).click();
    await expect(page.locator(".modal-panel")).not.toBeVisible({ timeout: 2000 });
  });
});
