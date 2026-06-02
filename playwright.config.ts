import { defineConfig, devices } from "@playwright/test";

// The test server runs on 3001 so it doesn't conflict with the dev server on 3000.
const BASE_URL = "http://localhost:3001";

// Dedicated emulator ports for tests — avoids collisions with other Firebase
// projects (e.g. brewbooks-mvp) that may be running on the default 9099/8080.
const AUTH_EMULATOR_HOST = "127.0.0.1:9399";
const FIRESTORE_EMULATOR_HOST = "127.0.0.1:8380";

// "demo-girasun" uses Firebase's special "demo-*" prefix, which tells
// firebase-tools to never contact live Firebase services — no auth, no network.
// The Admin SDK uses the same ID so token aud claims match.
const TEST_PROJECT_ID = "demo-girasun";

const EMULATOR_ENV = {
  FIRESTORE_EMULATOR_HOST,
  FIREBASE_AUTH_EMULATOR_HOST: AUTH_EMULATOR_HOST,
  NEXT_PUBLIC_USE_FIREBASE_EMULATORS: "1",
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: TEST_PROJECT_ID,
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
    { name: "setup", testMatch: /auth\.setup\.ts/, use: { ...devices["Desktop Chrome"] } },
    { name: "public", testMatch: /tests\/public\/.*/, use: { ...devices["Desktop Chrome"] } },
    {
      name: "admin",
      testMatch: /tests\/admin\/.*/,
      use: { ...devices["Desktop Chrome"], storageState: "tests/.auth/admin.json" },
      dependencies: ["setup"],
    },
  ],

  webServer: [
    {
      // Start the Firebase emulators on dedicated test ports before the app.
      command: `firebase --config firebase.test.json emulators:start --only auth,firestore --project ${TEST_PROJECT_ID}`,
      url: `http://${AUTH_EMULATOR_HOST}/`,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
    {
      command: "next dev -p 3001",
      url: BASE_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: EMULATOR_ENV,
    },
  ],
});
