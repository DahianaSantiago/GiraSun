import { initializeApp, cert, applicationDefault } from "firebase-admin/app";
import fs from "node:fs";
import path from "node:path";

const credential = cert("/tmp/girasun-firebase-admin.json");
const app = initializeApp({ credential, projectId: "girasun-app" });

// firebase-admin's credential provider returns OAuth tokens for Cloud APIs.
const { access_token: accessToken } = await app.options.credential.getAccessToken();

const projectId = "girasun-app";
const databaseId = "(default)";

const indexesPath = path.resolve(process.cwd(), "firestore.indexes.json");
const { indexes } = JSON.parse(fs.readFileSync(indexesPath, "utf8"));

console.log(`Posting ${indexes.length} indexes for ${projectId}...`);

for (const idx of indexes) {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${encodeURIComponent(
    databaseId,
  )}/collectionGroups/${idx.collectionGroup}/indexes`;

  const body = {
    queryScope: idx.queryScope,
    fields: idx.fields.map((f) => ({
      fieldPath: f.fieldPath,
      ...(f.order ? { order: f.order } : {}),
      ...(f.arrayConfig ? { arrayConfig: f.arrayConfig } : {}),
    })),
  };

  const fieldsLabel = idx.fields.map((f) => `${f.fieldPath}:${f.order || f.arrayConfig}`).join(",");

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (res.ok) {
    const data = await res.json();
    console.log(`  ✓ ${idx.collectionGroup} [${fieldsLabel}] queued (op ${data.name})`);
    continue;
  }

  const errBody = await res.json().catch(() => ({}));
  const message = errBody?.error?.message || (await res.text());

  if (message.includes("ALREADY_EXISTS") || message.includes("already exists")) {
    console.log(`  • ${idx.collectionGroup} [${fieldsLabel}] already exists (skipped)`);
  } else {
    console.error(`  ✗ ${idx.collectionGroup}: ${message}`);
    process.exit(1);
  }
}

console.log("Done.");
