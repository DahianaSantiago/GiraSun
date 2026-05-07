import "server-only";
import { getServerDb } from "./server";
import { Timestamp } from "firebase-admin/firestore";

export type PostType = "cuento" | "escrito";

const likeId = (postType: PostType, postSlug: string, uid: string) =>
  `${postType}_${postSlug}_${uid}`;

/** Total like count for a post. */
export async function getLikeCount(postType: PostType, postSlug: string): Promise<number> {
  const db = getServerDb();
  const snap = await db
    .collection("likes")
    .where("postType", "==", postType)
    .where("postSlug", "==", postSlug)
    .count()
    .get();
  return snap.data().count;
}

/** True if the user has already liked this post. */
export async function hasLiked(
  postType: PostType,
  postSlug: string,
  uid: string,
): Promise<boolean> {
  const db = getServerDb();
  const doc = await db
    .collection("likes")
    .doc(likeId(postType, postSlug, uid))
    .get();
  return doc.exists;
}

/** Idempotent toggle: like if not liked, unlike if already liked. Returns the resulting state. */
export async function toggleLike(
  postType: PostType,
  postSlug: string,
  uid: string,
): Promise<{ liked: boolean; count: number }> {
  const db = getServerDb();
  const ref = db.collection("likes").doc(likeId(postType, postSlug, uid));
  const doc = await ref.get();

  if (doc.exists) {
    await ref.delete();
  } else {
    await ref.set({
      postType,
      postSlug,
      uid,
      createdAt: Timestamp.now(),
    });
  }

  const count = await getLikeCount(postType, postSlug);
  return { liked: !doc.exists, count };
}
