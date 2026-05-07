import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
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

initializeApp({
  credential: cert({
    projectId: env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n"),
  }),
  projectId: env.FIREBASE_ADMIN_PROJECT_ID,
});

const db = getFirestore();
console.log("Running: drafts.where(type=cuento).orderBy(updatedAt desc).limit(50).get()");
try {
  const snap = await db
    .collection("drafts")
    .where("type", "==", "cuento")
    .orderBy("updatedAt", "desc")
    .limit(50)
    .get();
  console.log(`OK: ${snap.size} docs`);
} catch (err) {
  console.error("FAILED:", err);
}
