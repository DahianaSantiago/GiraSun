// Admin draft storage. Drafts live in Firestore /drafts/{id} with all the
// frontmatter fields plus the markdown body. Publishing reads the draft,
// serializes to MDX, commits to the repo, marks the draft as published.

import "server-only";
import { Timestamp, type DocumentData } from "firebase-admin/firestore";
import { getServerDb } from "./firebase/server";
import { commitFiles } from "./octokit";

export type DraftType = "cuento" | "escrito";

export type DraftFrontmatter = {
  type: DraftType;
  title: string;
  titleHTML?: string;
  slug: string;
  date: string; // YYYY-MM-DD
  dateLabel: string; // '5 mayo, 2026'
  eyebrow: string;
  cat: string;
  tag: string;
  excerpt: string;
  dek?: string;
  heroSrc?: string;
  heroAlt: string;
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
  eyebrow: d.eyebrow,
  cat: d.cat,
  tag: d.tag,
  excerpt: d.excerpt,
  dek: d.dek ?? undefined,
  heroSrc: d.heroSrc ?? undefined,
  heroAlt: d.heroAlt,
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
    .collection("drafts")
    .where("type", "==", type)
    .orderBy("updatedAt", "desc")
    .limit(50)
    .get();
  return snap.docs.map((d) => fromDoc(d.id, d.data()));
}

export async function getDraft(id: string): Promise<Draft | null> {
  const doc = await getServerDb().collection("drafts").doc(id).get();
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
    await db.collection("drafts").doc(input.id).set(data, { merge: true });
    const doc = await db.collection("drafts").doc(input.id).get();
    return fromDoc(input.id, doc.data() ?? {});
  }

  const ref = await db.collection("drafts").add({ ...data, createdAt: now });
  const doc = await ref.get();
  return fromDoc(ref.id, doc.data() ?? {});
}

/** Convert a Draft into the YAML frontmatter + body string we'll commit. */
function serializeMdx(d: DraftFrontmatter, body: string): string {
  const lines: string[] = ["---"];
  const yamlField = (key: string, value: unknown) => {
    if (value === undefined || value === null) return;
    if (typeof value === "boolean") {
      lines.push(`${key}: ${value}`);
      return;
    }
    if (typeof value === "number") {
      lines.push(`${key}: ${value}`);
      return;
    }
    if (Array.isArray(value)) {
      if (!value.length) return;
      lines.push(`${key}:`);
      value.forEach((v) => lines.push(`  - ${JSON.stringify(String(v))}`));
      return;
    }
    lines.push(`${key}: ${JSON.stringify(String(value))}`);
  };

  yamlField("title", d.title);
  if (d.titleHTML) yamlField("titleHTML", d.titleHTML);
  yamlField("slug", d.slug);
  yamlField("date", d.date);
  yamlField("dateLabel", d.dateLabel);
  yamlField("eyebrow", d.eyebrow);
  yamlField("cat", d.cat);
  yamlField("tag", d.tag);
  yamlField("excerpt", d.excerpt);
  if (d.dek) yamlField("dek", d.dek);
  if (d.heroSrc) yamlField("heroSrc", d.heroSrc);
  yamlField("heroAlt", d.heroAlt);
  yamlField("readingMinutes", d.readingMinutes);
  if (d.featured) yamlField("featured", true);
  yamlField("status", "published");
  if (d.sections?.length) yamlField("sections", d.sections);

  lines.push("---", "", body.trimStart());
  return lines.join("\n");
}

const contentDirFor = (type: DraftType): string =>
  type === "cuento" ? "content/cuentos" : "content/escritos";

/** Publish a draft: commit the MDX file to GitHub and mark the draft as published. */
export async function publishDraft(
  id: string,
): Promise<{ commit: string; url: string; path: string }> {
  const draft = await getDraft(id);
  if (!draft) throw new Error("Draft not found");

  const path = `${contentDirFor(draft.type)}/${draft.slug}.mdx`;
  const mdx = serializeMdx(draft, draft.body);

  const result = await commitFiles({
    files: [{ path, content: mdx }],
    message: `feat(content): publish ${draft.type} '${draft.title}' (admin)`,
  });

  await getServerDb().collection("drafts").doc(id).update({
    status: "published",
    publishedAt: Timestamp.now(),
    publishedCommit: result.commit,
  });

  return { commit: result.commit, url: result.html_url, path };
}

export async function deleteDraft(id: string): Promise<void> {
  await getServerDb().collection("drafts").doc(id).delete();
}
