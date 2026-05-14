import { defineConfig, devices } from "@playwright/test";

// The test server runs on 3001 so it doesn't conflict with the dev server on 3000.
const BASE_URL = "http://localhost:3001";

// Env vars injected into the test Next.js server so it routes Auth + Firestore
// to the local emulators and recognises the test account as an admin.
const EMULATOR_ENV = {
  FIRESTORE_EMULATOR_HOST: "127.0.0.1:8080",
  FIREBASE_AUTH_EMULATOR_HOST: "127.0.0.1:9099",
  NEXT_PUBLIC_USE_FIREBASE_EMULATORS: "1",
  ADMIN_EMAILS: "test-admin@girasun.com",
  NEXT_PUBLIC_SITE_URL: BASE_URL,
};

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    // 1. Create admin session (runs once before admin tests)
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },

    // 2. Public tests — no authentication
    {
      name: "public",
      testMatch: /tests\/public\/.*/,
      use: { ...devices["Desktop Chrome"] },
    },

    // 3. Admin tests — depend on setup to have created the session file
    {
      name: "admin",
      testMatch: /tests\/admin\/.*/,
      use: {
        ...devices["Desktop Chrome"],
        storageState: "tests/.auth/admin.json",
      },
      dependencies: ["setup"],
    },
  ],

  webServer: {
    command: "next dev -p 3001",
    url: BASE_URL,
    // Reuse the existing server locally (if one is already on 3001); always
    // start fresh in CI.
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: EMULATOR_ENV,
  },
});
