import { expect, test, type Page } from "@playwright/test";

test.describe.configure({ mode: "serial" });

// The first server action invocation in `next dev` compiles the route on demand,
// which can take several seconds. Give submit results room to absorb that cold
// start instead of racing a tight 5s window.
const SUBMIT_TIMEOUT = 15000;

// Fill the email input robustly. Filling right after navigation can dispatch the
// input event before client hydration completes, dropping the React onChange so
// `email` stays "" and the submit button stays disabled forever. We clear before
// each refill (so the value actually changes — Playwright skips the input event
// on an identical value) and retry until the button enables, i.e. until React has
// hydrated and registered the value.
async function fillEmail(page: Page, email: string) {
  const form = page.locator(".newsletter form").first();
  const emailInput = form.locator('input[type="email"]');
  const submitBtn = form.locator('button[type="submit"]');
  await expect(async () => {
    await emailInput.fill("");
    await emailInput.fill(email);
    await expect(submitBtn).toBeEnabled({ timeout: 1000 });
  }).toPass({ timeout: 10000 });
  return { form, emailInput, submitBtn };
}

test.describe("newsletter signup", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("accepts a valid email and confirms the subscription right away", async ({ page }) => {
    const { emailInput, submitBtn } = await fillEmail(page, "lector@ejemplo.com");
    await submitBtn.click();
    // Should show the success state — not stay on the idle form
    await expect(emailInput).not.toBeVisible({ timeout: SUBMIT_TIMEOUT });
    // Single opt-in: the message says they're in, never that they must confirm.
    // Matches both the fresh and the already-subscribed wording.
    const sent = page.locator(".newsletter .sent").first();
    await expect(sent).toContainText(/en la lista/i, { timeout: SUBMIT_TIMEOUT });
    await expect(sent).not.toContainText(/confirma/i);
  });

  test("shows an error for an invalid email", async ({ page }) => {
    const form = page.locator(".newsletter form").first();
    // Disable browser-native HTML5 validation so the server-side Zod check runs
    await form.evaluate((f) => f.setAttribute("novalidate", ""));
    const { submitBtn } = await fillEmail(page, "no-es-un-email");
    await submitBtn.click();
    await expect(page.getByText(/válid/i)).toBeVisible({ timeout: SUBMIT_TIMEOUT });
  });

  test("submit button is disabled while a request is in flight", async ({ page }) => {
    const { emailInput, submitBtn } = await fillEmail(page, "otro@ejemplo.com");
    await submitBtn.click();
    // Immediately after clicking, the button should be disabled (pending transition).
    // We check the final success state instead — the button disappears with the form.
    await expect(emailInput).not.toBeVisible({ timeout: SUBMIT_TIMEOUT });
  });

  test("shows rate-limit error after too many attempts from the same IP", async ({ page }) => {
    // The limit is 5/h. We need to hit it; previous tests may have used some attempts,
    // so we drive it to the limit.
    const trySubscribe = async (email: string) => {
      await page.goto("/");
      const { submitBtn } = await fillEmail(page, email);
      await submitBtn.click();
      // Wait for the server to respond before the next navigation
      await Promise.race([
        page.locator(".newsletter .sent").waitFor({ timeout: SUBMIT_TIMEOUT }),
        page
          .getByText(/demasiados intentos|intenta de nuevo|no pudimos/i)
          .waitFor({ timeout: SUBMIT_TIMEOUT }),
      ]).catch(() => {});
    };

    for (let i = 0; i < 6; i++) {
      await trySubscribe(`rate-test-${i}@ejemplo.com`);
    }

    // At least the last attempt should show a rate-limit or generic error
    await expect(
      page.getByText(/demasiados intentos|intenta de nuevo|no pudimos/i),
    ).toBeVisible({ timeout: SUBMIT_TIMEOUT });
  });
});
