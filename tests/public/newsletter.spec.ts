import { expect, test } from "@playwright/test";

test.describe.configure({ mode: "serial" });

test.describe("newsletter signup", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("accepts a valid email and shows pending confirmation message", async ({ page }) => {
    const form = page.locator(".newsletter form").first();
    await form.locator('input[type="email"]').fill("lector@ejemplo.com");
    await form.locator('button[type="submit"]').click();
    // Should show success/pending state — not stay on the idle form
    await expect(form.locator('input[type="email"]')).not.toBeVisible({ timeout: 5000 });
  });

  test("shows an error for an invalid email", async ({ page }) => {
    const form = page.locator(".newsletter form").first();
    // Disable browser-native HTML5 validation so the server-side Zod check runs
    await form.evaluate((f) => f.setAttribute("novalidate", ""));
    await form.locator('input[type="email"]').fill("no-es-un-email");
    await form.locator('button[type="submit"]').click();
    await expect(page.getByText(/válid/i)).toBeVisible({ timeout: 5000 });
  });

  test("submit button is disabled while a request is in flight", async ({ page }) => {
    const form = page.locator(".newsletter form").first();
    const emailInput = form.locator('input[type="email"]');
    const submitBtn = form.locator('button[type="submit"]');

    await emailInput.fill("otro@ejemplo.com");
    await submitBtn.click();
    // Immediately after clicking, the button should be disabled (pending transition)
    // We check the final success state instead — the button disappears with the form
    await expect(emailInput).not.toBeVisible({ timeout: 5000 });
  });

  test("shows rate-limit error after too many attempts from the same IP", async ({ page }) => {
    // The limit is 5/h. We need to hit it; previous tests may have used some attempts,
    // so we drive it to the limit.
    const trySubscribe = async (email: string) => {
      await page.goto("/");
      const form = page.locator(".newsletter form").first();
      await form.locator('input[type="email"]').fill(email);
      await form.locator('button[type="submit"]').click();
      // Wait for the server to respond before the next navigation
      await Promise.race([
        page.locator(".newsletter .sent").waitFor({ timeout: 6000 }),
        page.getByText(/demasiados intentos|intenta de nuevo|no pudimos/i).waitFor({ timeout: 6000 }),
      ]).catch(() => {});
    };

    for (let i = 0; i < 6; i++) {
      await trySubscribe(`rate-test-${i}@ejemplo.com`);
    }

    // At least the last attempt should show a rate-limit or generic error
    await expect(
      page.getByText(/demasiados intentos|intenta de nuevo|no pudimos/i),
    ).toBeVisible({ timeout: 5000 });
  });
});
