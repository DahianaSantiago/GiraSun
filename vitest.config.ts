import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Minimal config so unit tests can resolve the `@/` path alias and run under a
// plain Node environment (the lib helpers are pure — no DOM needed).
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
  },
});
