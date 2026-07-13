import { expect, test, type Page } from "@playwright/test";

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

// Shared helpers for the delete-related describe blocks below.
const FIRESTORE_BASE = `http://${process.env.FIRESTORE_EMULATOR_HOST ?? "127.0.0.1:8380"}`;
const firestoreDocUrl = (id: string) =>
  `${FIRESTORE_BASE}/v1/projects/demo-girasun/databases/(default)/documents/posts/${id}`;
const EMULATOR_HEADERS = { Authorization: "Bearer owner" };

// The delete button asks for confirmation with window.confirm and reports failures
// with window.alert. Accepting both blindly hides a failed delete behind the poll
// timeout below, so collect the alerts and let the assertions report them.
function acceptConfirmCollectingAlerts(page: Page): string[] {
  const alerts: string[] = [];
  page.on("dialog", (dialog) => {
    if (dialog.type() === "alert") alerts.push(dialog.message());
    void dialog.accept();
  });
  return alerts;
}

test.describe("admin post list — delete draft", () => {
  const docUrl = firestoreDocUrl;
  const TITLE = "Borrador para eliminar";
  const DOC_ID = "cuento_borrador-para-eliminar";
  const ADMIN_HEADERS = EMULATOR_HEADERS;

  // Seed a draft straight into the Firestore emulator so it shows up in the list.
  test.beforeEach(async ({ request }) => {
    await request.delete(docUrl(DOC_ID), { headers: ADMIN_HEADERS }).catch(() => {});
    const res = await request.patch(docUrl(DOC_ID), {
      headers: ADMIN_HEADERS,
      data: {
        fields: {
          type: { stringValue: "cuento" },
          title: { stringValue: TITLE },
          slug: { stringValue: "borrador-para-eliminar" },
          status: { stringValue: "draft" },
          body: { stringValue: "Contenido de prueba." },
          updatedAt: { timestampValue: "2026-06-02T00:00:00Z" },
        },
      },
    });
    expect(res.ok()).toBeTruthy();
  });

  test.afterEach(async ({ request }) => {
    await request.delete(docUrl(DOC_ID), { headers: ADMIN_HEADERS }).catch(() => {});
  });

  test("each post row shows a delete button", async ({ page }) => {
    await page.goto("/admin/cuentos");
    const row = page.locator("tr", { hasText: TITLE });
    await expect(row).toBeVisible();
    await expect(
      row.getByRole("button", { name: new RegExp(`eliminar ${TITLE}`, "i") }),
    ).toBeVisible();
  });

  test("clicking delete (and confirming) removes the draft", async ({ page, request }) => {
    const alerts = acceptConfirmCollectingAlerts(page);
    await page.goto("/admin/cuentos");

    const row = page.locator("tr", { hasText: TITLE });
    await expect(row).toBeVisible();

    await row.getByRole("button", { name: new RegExp(`eliminar ${TITLE}`, "i") }).click();

    // The button → server action → Firestore: the seeded doc should be gone.
    await expect
      .poll(
        async () =>
          alerts[0] ?? (await request.get(docUrl(DOC_ID), { headers: ADMIN_HEADERS })).status(),
        { timeout: 10_000 },
      )
      .toBe(404);

    // …and it's no longer in the (force-dynamic) list on a fresh load.
    await page.reload();
    await expect(page.locator("tr", { hasText: TITLE })).toHaveCount(0);
  });
});

test.describe("admin post list — delete published post (un-publish)", () => {
  const TITLE = "Publicado para eliminar";
  const SLUG = "publicado-para-eliminar";
  const DOC_ID = `cuento_${SLUG}`;

  test.beforeEach(async ({ request }) => {
    await request.delete(firestoreDocUrl(DOC_ID), { headers: EMULATOR_HEADERS }).catch(() => {});
    const res = await request.patch(firestoreDocUrl(DOC_ID), {
      headers: EMULATOR_HEADERS,
      data: {
        fields: {
          type: { stringValue: "cuento" },
          title: { stringValue: TITLE },
          slug: { stringValue: SLUG },
          status: { stringValue: "published" },
          date: { stringValue: "2026-06-04" },
          dateLabel: { stringValue: "4 junio, 2026" },
          cat: { stringValue: "Cuento" },
          heroAlt: { stringValue: "imagen decorativa" },
          excerpt: { stringValue: "Cuento de prueba para validar el flujo de eliminación." },
          readingMinutes: { integerValue: 1 },
          body: { stringValue: "Contenido de prueba." },
          publishedAt: { timestampValue: "2026-06-04T00:00:00Z" },
          updatedAt: { timestampValue: "2026-06-04T00:00:00Z" },
        },
      },
    });
    expect(res.ok()).toBeTruthy();
  });

  test.afterEach(async ({ request }) => {
    await request.delete(firestoreDocUrl(DOC_ID), { headers: EMULATOR_HEADERS }).catch(() => {});
  });

  test("delete button is visible on published posts", async ({ page }) => {
    await page.goto("/admin/cuentos");
    const row = page.locator("tr", { hasText: TITLE });
    await expect(row).toBeVisible();
    await expect(
      row.getByRole("button", { name: new RegExp(`eliminar ${TITLE}`, "i") }),
    ).toBeVisible();
  });

  test("deleting a published post removes it from Firestore, the admin list, and the public site", async ({
    page,
    request,
  }) => {
    const alerts = acceptConfirmCollectingAlerts(page);
    await page.goto("/admin/cuentos");

    const row = page.locator("tr", { hasText: TITLE });
    await expect(row).toBeVisible();
    await row.getByRole("button", { name: new RegExp(`eliminar ${TITLE}`, "i") }).click();

    // 1. Firestore doc must be gone.
    await expect
      .poll(
        async () =>
          alerts[0] ??
          (await request.get(firestoreDocUrl(DOC_ID), { headers: EMULATOR_HEADERS })).status(),
        { timeout: 10_000 },
      )
      .toBe(404);

    // 2. Admin list no longer shows the post after reload.
    await page.reload();
    await expect(page.locator("tr", { hasText: TITLE })).toHaveCount(0);

    // Steps 3 and 4 are a smoke test, not a guard against the stale-cache bug that
    // deleteDraftAction's revalidatePath calls exist to fix: this suite runs against
    // `next dev`, where pages are always rendered on demand and never cached. Only a
    // production build can serve a deleted post from the prerendered listing.

    // 3. Public listing page must not include the deleted post.
    await page.goto("/cuentos");
    await expect(page.locator("body")).not.toContainText(TITLE);

    // 4. Public detail page must return 404 (Next.js notFound()).
    const response = await page.goto(`/cuentos/${SLUG}`);
    expect(response?.status()).toBe(404);
  });
});
