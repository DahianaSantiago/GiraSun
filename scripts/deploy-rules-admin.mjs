import { initializeApp, cert } from "firebase-admin/app";
import { getSecurityRules } from "firebase-admin/security-rules";
import fs from "node:fs";
import path from "node:path";

const app = initializeApp({
  credential: cert("/tmp/girasun-firebase-admin.json"),
  projectId: "girasun-app",
});

const rulesPath = path.resolve(process.cwd(), "firestore.rules");
const rules = fs.readFileSync(rulesPath, "utf8");

console.log(`Releasing rules from ${rulesPath} (${rules.length} bytes)...`);

const sr = getSecurityRules(app);
const ruleset = await sr.releaseFirestoreRulesetFromSource(rules);
console.log("Released ruleset:", ruleset.name, "✓");
