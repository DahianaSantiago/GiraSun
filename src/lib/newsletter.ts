// Newsletter subscriber lifecycle. All Firestore writes use the Admin SDK;
// the public form goes through a server action that calls into here.
//
// Single opt-in flow:
//   1. User submits email → status='confirmed', welcome email sent. Done —
//      there is no extra step for them to take.
//   2. User clicks an unsubscribe link → status='unsubscribed', unsubscribedAt set.
//
// 'pending' and confirmToken are legacy: they only appear on docs created under
// the old double opt-in flow. confirmSubscriber() still honours those tokens so
// confirm emails already sitting in inboxes keep working, but nothing mints new
// ones.
//
// Doc id is the lowercased email so a re-submission updates the same doc and
// we can never have two subscriptions for the same address.

import "server-only";
import { randomBytes } from "node:crypto";
import { Timestamp, FieldValue, type DocumentData } from "firebase-admin/firestore";
import { getServerDb } from "./firebase/server";

/** 'pending' is legacy — kept so docs from the old double opt-in flow still read. */
export type SubscriberStatus = "pending" | "confirmed" | "unsubscribed";

export type Subscriber = {
  email: string;
  status: SubscriberStatus;
  /** Legacy double opt-in token. Null on everything created since single opt-in. */
  confirmToken: string | null;
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
  confirmToken: data.confirmToken ?? null,
  unsubToken: data.unsubToken,
  source: data.source ?? "home",
  createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : 0,
  confirmedAt: data.confirmedAt instanceof Timestamp ? data.confirmedAt.toMillis() : null,
  unsubscribedAt: data.unsubscribedAt instanceof Timestamp ? data.unsubscribedAt.toMillis() : null,
});

/**
 * Subscribe an email immediately — no confirmation step. Returns the resulting
 * subscriber. Idempotent:
 *   - First time: creates a confirmed doc, returns 'created'.
 *   - Already confirmed: returns 'already-confirmed' with the existing doc untouched.
 *   - Previously unsubscribed, or legacy pending: confirms it now, returns 'resubscribed'.
 *
 * The unsubToken is preserved across re-subscriptions so unsubscribe links from
 * older letters keep working.
 */
export async function upsertConfirmedSubscriber(
  email: string,
  source = "home",
): Promise<{
  state: "created" | "already-confirmed" | "resubscribed";
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
    status: "confirmed",
    confirmToken: null,
    unsubToken: existing?.unsubToken ?? newToken(),
    source,
    createdAt: existing?.createdAt ?? Date.now(),
    confirmedAt: Date.now(),
    unsubscribedAt: null,
  };

  await ref.set(
    {
      email: next.email,
      status: next.status,
      unsubToken: next.unsubToken,
      source: next.source,
      // merge:false rewrites the doc, so createdAt has to be restated as a
      // Timestamp — writing the raw millis would read back as 0 and break the
      // createdAt ordering the admin list relies on.
      createdAt: existing?.createdAt
        ? Timestamp.fromMillis(existing.createdAt)
        : FieldValue.serverTimestamp(),
      confirmedAt: FieldValue.serverTimestamp(),
      unsubscribedAt: null,
    },
    { merge: false },
  );

  return { state: existing ? "resubscribed" : "created", subscriber: next };
}

/**
 * Legacy: confirm a pending subscriber via their confirmToken. Single opt-in no
 * longer mints these, but confirm emails sent before the switch still link here.
 */
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

/** Admin read: all subscribers sorted by createdAt desc, limit 1000. */
export async function listAllSubscribers(): Promise<Subscriber[]> {
  const db = getServerDb();
  const snap = await db.collection("subscribers").orderBy("createdAt", "desc").limit(1000).get();
  return snap.docs.map((d) => fromDoc(d.data()));
}

export type NewsletterSend = {
  id: string;
  subject: string;
  bodyHTML: string;
  sentAt: number;
  recipientCount: number;
  sentBy: string;
};

const sendFromDoc = (id: string, d: DocumentData): NewsletterSend => ({
  id,
  subject: d.subject,
  bodyHTML: d.bodyHTML ?? "",
  sentAt: d.sentAt instanceof Timestamp ? d.sentAt.toMillis() : 0,
  recipientCount: d.recipientCount ?? 0,
  sentBy: d.sentBy ?? "",
});

export async function recordNewsletterSend(input: {
  subject: string;
  bodyHTML: string;
  recipientCount: number;
  sentBy: string;
}): Promise<NewsletterSend> {
  const db = getServerDb();
  const ref = await db.collection("newsletter_sends").add({
    ...input,
    sentAt: Timestamp.now(),
  });
  const doc = await ref.get();
  return sendFromDoc(ref.id, doc.data() ?? {});
}

export async function listNewsletterSends(): Promise<NewsletterSend[]> {
  const db = getServerDb();
  const snap = await db.collection("newsletter_sends").orderBy("sentAt", "desc").limit(50).get();
  return snap.docs.map((d) => sendFromDoc(d.id, d.data()));
}

/** Admin force-unsubscribe by email. Idempotent. */
export async function adminUnsubscribe(email: string): Promise<void> {
  const id = docIdFor(email);
  await getServerDb()
    .collection("subscribers")
    .doc(id)
    .update({ status: "unsubscribed", unsubscribedAt: FieldValue.serverTimestamp() });
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
