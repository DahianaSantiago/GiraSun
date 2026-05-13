"use server";

import { getServerDb } from "@/lib/firebase/server";
import { getSession } from "@/lib/firebase/session";
import { isAdmin, isEnvAdmin } from "@/lib/firebase/admins";

async function requireAdmin() {
  const session = await getSession();
  if (!session) throw new Error("not-authenticated");
  if (!(await isAdmin(session.email))) throw new Error("not-admin");
}

export async function addAdminAction(email: string) {
  try {
    await requireAdmin();
    const id = email.trim().toLowerCase();
    if (!id || !id.includes("@")) return { ok: false as const, error: "invalid-email" };
    await getServerDb().collection("admins").doc(id).set({ addedAt: new Date().toISOString() });
    return { ok: true as const };
  } catch (err) {
    return { ok: false as const, error: (err as Error).message };
  }
}

export async function removeAdminAction(email: string) {
  try {
    await requireAdmin();
    const id = email.trim().toLowerCase();
    if (isEnvAdmin(id)) {
      return { ok: false as const, error: "env-admin" };
    }
    await getServerDb().collection("admins").doc(id).delete();
    return { ok: true as const };
  } catch (err) {
    return { ok: false as const, error: (err as Error).message };
  }
}
