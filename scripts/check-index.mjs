import { initializeApp, cert } from "firebase-admin/app";
import fs from "node:fs";

const env = {};
for (const line of fs
  .readFileSync("/Users/mrjunos/Documents/Girasun/site/.env.local", "utf8")
  .split("\n")) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) {
    let v = m[2];
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    env[m[1]] = v;
  }
}

const app = initializeApp({
  credential: cert({
    projectId: env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n"),
  }),
  projectId: env.FIREBASE_ADMIN_PROJECT_ID,
});

const { access_token } = await app.options.credential.getAccessToken();
const res = await fetch(
  `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_ADMIN_PROJECT_ID}/databases/(default)/collectionGroups/drafts/indexes`,
  { headers: { Authorization: `Bearer ${access_token}` } },
);
const data = await res.json();
for (const idx of data.indexes ?? []) {
  console.log(
    idx.state,
    "→",
    idx.fields.map((f) => `${f.fieldPath}:${f.order || f.arrayConfig}`).join(", "),
  );
}
