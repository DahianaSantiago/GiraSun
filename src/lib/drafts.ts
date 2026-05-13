import "server-only";
import { Timestamp, type DocumentData } from "firebase-admin/firestore";
import { getServerDb } from "./firebase/server";

export type DraftType = "cuento" | "escrito";

export type DraftFrontmatter = {
  type: DraftType;
  title: string;
  titleHTML?: string;
  slug: string;
  date: string; // YYYY-MM-DD
  dateLabel: string; // '5 mayo, 2026'
  eyebrow?: string;
  cat: string;
  tag?: string;
  excerpt: string;
  dek?: string;
  heroSrc?: string;
  heroAlt: string;
  heroFilter?: string;
  readingMinutes: number;
  featured?: boolean;
  sections?: string[];
};

export type Draft = DraftFrontmatter & {
  id: string;
  body: string;
  status: "draft" | "published";
  authorEmail: string;
  createdAt: number;
  updatedAt: number;
  publishedAt: number | null;
  publishedCommit: string | null;
};

const fromDoc = (id: string, d: DocumentData): Draft => ({
  id,
  type: d.type,
  title: d.title,
  titleHTML: d.titleHTML ?? undefined,
  slug: d.slug,
  date: d.date,
  dateLabel: d.dateLabel,
  eyebrow: d.eyebrow ?? "",
  cat: d.cat,
  tag: d.tag ?? "",
  excerpt: d.excerpt,
  dek: d.dek ?? undefined,
  heroSrc: d.heroSrc ?? undefined,
  heroAlt: d.heroAlt,
  heroFilter: d.heroFilter ?? undefined,
  readingMinutes: d.readingMinutes,
  featured: d.featured ?? false,
  sections: d.sections ?? [],
  body: d.body ?? "",
  status: d.status ?? "draft",
  authorEmail: d.authorEmail ?? "",
  createdAt: d.createdAt instanceof Timestamp ? d.createdAt.toMillis() : 0,
  updatedAt: d.updatedAt instanceof Timestamp ? d.updatedAt.toMillis() : 0,
  publishedAt: d.publishedAt instanceof Timestamp ? d.publishedAt.toMillis() : null,
  publishedCommit: d.publishedCommit ?? null,
});

export async function listDrafts(type: DraftType): Promise<Draft[]> {
  const db = getServerDb();
  const snap = await db
    .collection("posts")
    .where("type", "==", type)
    .orderBy("updatedAt", "desc")
    .limit(50)
    .get();
  return snap.docs.map((d) => fromDoc(d.id, d.data()));
}

export async function getDraft(id: string): Promise<Draft | null> {
  const doc = await getServerDb().collection("posts").doc(id).get();
  return doc.exists ? fromDoc(doc.id, doc.data() ?? {}) : null;
}

export async function saveDraft(input: {
  id?: string;
  authorEmail: string;
  frontmatter: DraftFrontmatter;
  body: string;
}): Promise<Draft> {
  const db = getServerDb();
  const now = Timestamp.now();

  const data = {
    ...input.frontmatter,
    body: input.body,
    authorEmail: input.authorEmail,
    status: "draft",
    updatedAt: now,
  };

  if (input.id) {
    await db.collection("posts").doc(input.id).set(data, { merge: true });
    const doc = await db.collection("posts").doc(input.id).get();
    return fromDoc(input.id, doc.data() ?? {});
  }

  // Use slug-based ID for posts to avoid duplicates and make it predictable
  const docId = `${input.frontmatter.type}_${input.frontmatter.slug}`;
  await db
    .collection("posts")
    .doc(docId)
    .set({ ...data, createdAt: now });
  const doc = await db.collection("posts").doc(docId).get();
  return fromDoc(docId, doc.data() ?? {});
}

/** Publish a draft: mark it as published in Firestore. No more Octokit/GitHub commits. */
export async function publishDraft(
  id: string,
): Promise<{ commit: string; url: string; path: string }> {
  const draft = await getDraft(id);
  if (!draft) throw new Error("Draft not found");

  await getServerDb().collection("posts").doc(id).update({
    status: "published",
    publishedAt: Timestamp.now(),
  });

  return {
    commit: "firestore-direct",
    url: `/cuentos/${draft.slug}`,
    path: `posts/${id}`,
  };
}

export async function deleteDraft(id: string): Promise<void> {
  await getServerDb().collection("posts").doc(id).delete();
}
