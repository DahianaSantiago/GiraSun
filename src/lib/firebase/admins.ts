// Admin allowlist. An email is admin if it appears in EITHER:
//   1. The ADMIN_EMAILS env var (comma-separated), set in Vercel project
//      env. Useful for the initial bootstrap — you don't need any Firestore
//      seed before someone can log in as admin.
//   2. The /admins/{email} Firestore collection (doc id = lowercased email).
//      Editable from the admin UI in Phase 9 (Configuración page).
//
// The union means env-var admins are non-removable without a redeploy
// (good for the founding admin), and Firestore admins are editable live.

import "server-only";
import { getServerDb } from "./server";

const envEmails = (): Set<string> => {
  const raw = process.env.ADMIN_EMAILS ?? "";
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  );
};

export function isEnvAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return envEmails().has(email.trim().toLowerCase());
}

export async function isFirestoreAdmin(email: string | null | undefined): Promise<boolean> {
  if (!email) return false;
  const id = email.trim().toLowerCase();
  const doc = await getServerDb().collection("admins").doc(id).get();
  return doc.exists;
}

export async function isAdmin(email: string | null | undefined): Promise<boolean> {
  if (!email) return false;
  if (isEnvAdmin(email)) return true;
  return isFirestoreAdmin(email);
}

export async function listFirestoreAdmins(): Promise<string[]> {
  const snap = await getServerDb().collection("admins").get();
  return snap.docs.map((d) => d.id);
}
