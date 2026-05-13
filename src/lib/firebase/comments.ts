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

/** Admin read: all comments (hidden + visible), newest first. */
export async function listAllComments(): Promise<Comment[]> {
  const db = getServerDb();
  const snap = await db.collection("comments").orderBy("createdAt", "desc").limit(500).get();
  return snap.docs.map((d) => fromDoc(d.id, d.data()));
}

export async function setCommentHidden(id: string, hidden: boolean): Promise<void> {
  await getServerDb().collection("comments").doc(id).update({ hidden });
}

export async function deleteComment(id: string): Promise<void> {
  await getServerDb().collection("comments").doc(id).delete();
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

export { formatCommentDate } from "@/lib/format-date";
