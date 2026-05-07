// Newsletter subscriber lifecycle. All Firestore writes use the Admin SDK;
// the public form goes through a server action that calls into here.
//
// Double opt-in flow:
//   1. User submits email → status='pending', confirmToken minted, email sent.
//   2. User clicks the confirm link → status='confirmed', confirmedAt set.
//   3. User clicks an unsubscribe link → status='unsubscribed', unsubscribedAt set.
//
// Doc id is the lowercased email so a re-submission updates the same doc and
// we can never have two pending subscriptions for the same address.

import "server-only";
import { randomBytes } from "node:crypto";
import { Timestamp, FieldValue, type DocumentData } from "firebase-admin/firestore";
import { getServerDb } from "./firebase/server";

export type SubscriberStatus = "pending" | "confirmed" | "unsubscribed";

export type Subscriber = {
  email: string;
  status: SubscriberStatus;
  confirmToken: string;
  unsubToken: string;
  source: string;
  createdAt: number;
  confirmedAt: number | null;
  unsubscribedAt: number | null;
};

const TOKEN_BYTES = 24;

const docIdFor = (email: string): string => email.trim().toLowerCase();

const newToken = (): string => randomBytes(TOKEN_BYTES).toString("hex");

const fromDoc = (data: DocumentData): Subscriber => ({
  email: data.email,
  status: data.status,
  confirmToken: data.confirmToken,
  unsubToken: data.unsubToken,
  source: data.source ?? "home",
  createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : 0,
  confirmedAt: data.confirmedAt instanceof Timestamp ? data.confirmedAt.toMillis() : null,
  unsubscribedAt: data.unsubscribedAt instanceof Timestamp ? data.unsubscribedAt.toMillis() : null,
});

/**
 * Create or refresh a pending subscriber for the given email. Returns the
 * resulting subscriber (existing if already confirmed). Idempotent:
 *   - First time: creates pending doc, returns 'created'.
 *   - Pending re-submission: rotates the confirmToken (new email link), returns 'pending'.
 *   - Already confirmed: returns 'already-confirmed' with the existing doc.
 *   - Previously unsubscribed: re-opens as pending, fresh tokens.
 */
export async function upsertPendingSubscriber(
  email: string,
  source = "home",
): Promise<{
  state: "created" | "pending" | "already-confirmed" | "reopened";
  subscriber: Subscriber;
}> {
  const db = getServerDb();
  const id = docIdFor(email);
  const ref = db.collection("subscribers").doc(id);
  const snap = await ref.get();
  const existing = snap.exists ? fromDoc(snap.data() ?? {}) : null;

  if (existing?.status === "confirmed") {
    return { state: "already-confirmed", subscriber: existing };
  }

  const next: Subscriber = {
    email: id,
    status: "pending",
    confirmToken: newToken(),
    unsubToken: existing?.unsubToken ?? newToken(),
    source,
    createdAt: existing?.createdAt ?? Date.now(),
    confirmedAt: null,
    unsubscribedAt: null,
  };

  await ref.set(
    {
      email: next.email,
      status: next.status,
      confirmToken: next.confirmToken,
      unsubToken: next.unsubToken,
      source: next.source,
      createdAt: existing ? existing.createdAt : FieldValue.serverTimestamp(),
      confirmedAt: null,
      unsubscribedAt: null,
    },
    { merge: false },
  );

  if (!existing) return { state: "created", subscriber: next };
  if (existing.status === "unsubscribed") return { state: "reopened", subscriber: next };
  return { state: "pending", subscriber: next };
}

/** Confirm a pending subscriber via their confirmToken. */
export async function confirmSubscriber(
  token: string,
): Promise<
  | { ok: true; email: string }
  | { ok: false; reason: "not-found" | "already-confirmed" | "unsubscribed" }
> {
  const db = getServerDb();
  const snap = await db.collection("subscribers").where("confirmToken", "==", token).limit(1).get();
  if (snap.empty) return { ok: false, reason: "not-found" };

  const doc = snap.docs[0];
  const data = fromDoc(doc.data());
  if (data.status === "confirmed") return { ok: false, reason: "already-confirmed" };
  if (data.status === "unsubscribed") return { ok: false, reason: "unsubscribed" };

  await doc.ref.update({
    status: "confirmed",
    confirmedAt: FieldValue.serverTimestamp(),
  });
  return { ok: true, email: data.email };
}

/** Unsubscribe via unsubToken. Idempotent. */
export async function unsubscribeByToken(
  token: string,
): Promise<{ ok: true; email: string } | { ok: false; reason: "not-found" }> {
  const db = getServerDb();
  const snap = await db.collection("subscribers").where("unsubToken", "==", token).limit(1).get();
  if (snap.empty) return { ok: false, reason: "not-found" };

  const doc = snap.docs[0];
  const data = fromDoc(doc.data());
  if (data.status !== "unsubscribed") {
    await doc.ref.update({
      status: "unsubscribed",
      unsubscribedAt: FieldValue.serverTimestamp(),
    });
  }
  return { ok: true, email: data.email };
}
