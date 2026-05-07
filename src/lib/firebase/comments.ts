import "server-only";
import { Timestamp, type DocumentData } from "firebase-admin/firestore";
import { getServerDb } from "./server";

export type PostType = "cuento" | "escrito";

export type Comment = {
  id: string;
  postType: PostType;
  postSlug: string;
  uid: string;
  authorName: string;
  authorPhotoURL: string | null;
  body: string;
  createdAt: number; // ms epoch
  hidden: boolean;
};

export const COMMENT_MAX_LENGTH = 2000;

const fromDoc = (id: string, data: DocumentData): Comment => ({
  id,
  postType: data.postType,
  postSlug: data.postSlug,
  uid: data.uid,
  authorName: data.authorName,
  authorPhotoURL: data.authorPhotoURL ?? null,
  body: data.body,
  createdAt:
    data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : Number(data.createdAt) || 0,
  hidden: !!data.hidden,
});

/** Public-facing read: only comments where hidden=false, newest first. */
export async function listVisibleComments(
  postType: PostType,
  postSlug: string,
): Promise<Comment[]> {
  const db = getServerDb();
  const snap = await db
    .collection("comments")
    .where("postType", "==", postType)
    .where("postSlug", "==", postSlug)
    .where("hidden", "==", false)
    .orderBy("createdAt", "desc")
    .limit(200)
    .get();
  return snap.docs.map((d) => fromDoc(d.id, d.data()));
}

/** Server insert. Validation should already have run by the time we get here. */
export async function insertComment(input: {
  postType: PostType;
  postSlug: string;
  uid: string;
  authorName: string;
  authorPhotoURL: string | null;
  body: string;
}): Promise<Comment> {
  const db = getServerDb();
  const ref = await db.collection("comments").add({
    postType: input.postType,
    postSlug: input.postSlug,
    uid: input.uid,
    authorName: input.authorName,
    authorPhotoURL: input.authorPhotoURL,
    body: input.body,
    createdAt: Timestamp.now(),
    hidden: false,
  });
  const doc = await ref.get();
  return fromDoc(ref.id, doc.data() ?? {});
}

const SPANISH_MONTHS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

/** Format a ms-epoch as "5 mayo, 2026" or "Hace un momento" for very-fresh stamps. */
export function formatCommentDate(ms: number): string {
  const now = Date.now();
  const ageMs = now - ms;
  if (ageMs < 1000 * 60) return "Hace un momento";
  if (ageMs < 1000 * 60 * 60) {
    const m = Math.floor(ageMs / (1000 * 60));
    return `Hace ${m} min`;
  }
  const d = new Date(ms);
  return `${d.getDate()} ${SPANISH_MONTHS[d.getMonth()]}, ${d.getFullYear()}`;
}
