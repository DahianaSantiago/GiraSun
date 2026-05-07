// Firebase Admin SDK init. Server-only — never import from a Client Component.
// Used in server actions, route handlers, and middleware that need privileged
// Firestore writes (newsletter signup, admin allowlist check, comment moderation,
// admin Octokit publish flow).
//
// Credentials come from env vars (set in Vercel project env + .env.local):
//
//   FIREBASE_ADMIN_PROJECT_ID
//   FIREBASE_ADMIN_CLIENT_EMAIL
//   FIREBASE_ADMIN_PRIVATE_KEY
//
// In dev with emulators, set FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 and
// FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099 — the Admin SDK auto-detects
// these and routes accordingly. (No code change needed.)

import "server-only";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let _app: App | null = null;

function getAdminApp(): App {
  if (_app) return _app;
  if (getApps().length) {
    _app = getApps()[0];
    return _app;
  }

  const usingEmulator =
    !!process.env.FIRESTORE_EMULATOR_HOST || !!process.env.FIREBASE_AUTH_EMULATOR_HOST;

  if (usingEmulator) {
    // No real credentials needed for emulator — just a project id.
    _app = initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "girasun-emulator",
    });
    return _app;
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase Admin credentials missing. Set FIREBASE_ADMIN_PROJECT_ID / FIREBASE_ADMIN_CLIENT_EMAIL / FIREBASE_ADMIN_PRIVATE_KEY in Vercel project env and .env.local.",
    );
  }

  _app = initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
  return _app;
}

export function getServerAuth(): Auth {
  return getAuth(getAdminApp());
}

export function getServerDb(): Firestore {
  return getFirestore(getAdminApp());
}
