// Set up local git hooks via simple-git-hooks.
// Skipped in CI (Vercel, GitHub Actions, etc.) where the build sandbox
// may not allow writes to .git/hooks/ — and where local hooks are useless anyway.
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

if (process.env.CI) {
  process.exit(0);
}

const binName = "simple-git-hooks" + (process.platform === "win32" ? ".cmd" : "");
const bin = path.resolve(process.cwd(), "node_modules", ".bin", binName);

if (!existsSync(bin)) {
  console.warn(`[setup-hooks] ${bin} not found — skipping hook setup.`);
  process.exit(0);
}

execFileSync(bin, [], { stdio: "inherit" });
