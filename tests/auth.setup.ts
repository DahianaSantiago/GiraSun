// Creates a test admin session so the admin project tests start already logged in.
//
// Flow:
//   1. Create (or sign in to) a test user in the Firebase Auth emulator.
//   2. Exchange the resulting idToken for a session cookie via POST /api/session.
//   3. Save the browser context (cookies) to tests/.auth/admin.json.
//
// The test user email must be listed in ADMIN_EMAILS (set in playwright.config.ts
// webServer.env) so the server treats it as admin without Firestore seeding.

import { test as setup } from "@playwright/test";
import path from "node:path";

const AUTH_EMULATOR = `http://${process.env.FIREBASE_AUTH_EMULATOR_HOST ?? "127.0.0.1:9399"}`;
const TEST_EMAIL = "test-admin@girasun.com";
const TEST_PASSWORD = "Test-Password-GiraSun!";
const SESSION_FILE = path.join(__dirname, ".auth/admin.json");

async function getIdToken(): Promise<string> {
  // Try sign-in first — the user may already exist from a previous run.
  const signInRes = await fetch(
    `${AUTH_EMULATOR}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=test`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD, returnSecureToken: true }),
    },
  );

  if (signInRes.ok) {
    const { idToken } = (await signInRes.json()) as { idToken: string };
    return idToken;
  }

  // First run — create the test account.
  const signUpRes = await fetch(
    `${AUTH_EMULATOR}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=test`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD, returnSecureToken: true }),
    },
  );

  if (!signUpRes.ok) {
    throw new Error(`[auth.setup] Failed to create test user: ${await signUpRes.text()}`);
  }

  const { idToken } = (await signUpRes.json()) as { idToken: string };
  return idToken;
}

setup("create admin session", async ({ page }) => {
  const idToken = await getIdToken();

  // Exchange the Firebase idToken for a Next.js session cookie.
  const res = await page.request.post("/api/session", {
    data: { idToken },
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok()) {
    throw new Error(`[auth.setup] Session creation failed (${res.status()}): ${await res.text()}`);
  }

  // Persist the session cookie so admin tests don't need to log in.
  await page.context().storageState({ path: SESSION_FILE });
});
