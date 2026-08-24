import { expect, test } from "@playwright/test";

// The rest of the public project starts with the gate already marked as seen
// (see playwright.config.ts). These tests want the genuine first-visit state.
//
// The newsletter rate limit is keyed on x-forwarded-for and allows 5 subscribes
// per hour, and tests/public/newsletter.spec.ts deliberately exhausts that
// budget. Claiming a distinct IP keeps this file out of that bucket.
test.use({
  storageState: { cookies: [], origins: [] },
  extraHTTPHeaders: { "x-forwarded-for": "203.0.113.7" },
});

// The gate opens 8s into the first visit, and the first server action call in
// `next dev` compiles on demand. Both need room.
const GATE_TIMEOUT = 20000;
const SUBMIT_TIMEOUT = 15000;

const gate = "[data-testid='subscribe-gate']";

test.describe("first-visit subscribe gate", () => {
  test("opens on the first visit and stays closed after being dismissed", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(gate)).toBeVisible({ timeout: GATE_TIMEOUT });

    await page.getByRole("button", { name: "Ahora no, gracias" }).click();
    await expect(page.locator(gate)).toBeHidden();

    // A dismissal is remembered across navigations — it's a first-visit gate,
    // not a per-page one.
    await page.goto("/cuentos");
    await expect(page.locator(gate)).toBeHidden({ timeout: GATE_TIMEOUT });
  });

  test("subscribes from the gate and does not come back", async ({ page }) => {
    await page.goto("/");
    const dialog = page.locator(gate);
    await expect(dialog).toBeVisible({ timeout: GATE_TIMEOUT });

    const emailInput = dialog.locator('input[type="email"]');
    const submitBtn = dialog.locator('button[type="submit"]');
    await emailInput.fill("gate-lector@ejemplo.com");
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    await expect(dialog.locator(".gate-sent")).toContainText(/en la lista/i, {
      timeout: SUBMIT_TIMEOUT,
    });
    // It closes itself once the thank-you has landed.
    await expect(dialog).toBeHidden({ timeout: GATE_TIMEOUT });

    await page.goto("/escritos");
    await expect(page.locator(gate)).toBeHidden({ timeout: GATE_TIMEOUT });
  });

  test("Escape closes the gate", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(gate)).toBeVisible({ timeout: GATE_TIMEOUT });
    await page.keyboard.press("Escape");
    await expect(page.locator(gate)).toBeHidden();
  });
});
