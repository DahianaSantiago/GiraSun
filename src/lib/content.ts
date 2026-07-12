import { getServerDb } from "./firebase/server";
import { Timestamp } from "firebase-admin/firestore";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

const CONTENT_ROOT = path.resolve(process.cwd(), "content");

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const PostFrontmatter = z.object({
  title: z.string().min(1),
  /** Optional title with HTML emphasis on a single word. */
  titleHTML: z.string().optional(),
  slug: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD"),
  /** Spanish-formatted date for cards / bylines, e.g. '5 mayo, 2026'. */
  dateLabel: z.string().min(1),
  eyebrow: z.string().optional(),
  /** Single-word eyebrow used inside cards, e.g. 'Cuento' or 'Escrito'. */
  cat: z.string().min(1),
  /** Display-form category label, e.g. 'Cuento cuentos' or 'Escribo'. */
  tag: z.string().optional(),
  excerpt: z.string().min(1),
  dek: z.string().optional(),
  heroSrc: z.string().optional(),
  heroAlt: z.string().min(1),
  heroFilter: z.string().optional(),
  readingMinutes: z.number().int().positive(),
  featured: z.boolean().optional(),
  status: z.enum(["draft", "published"]).default("published"),
  sections: z.array(z.string()).default([]),
});

const BookFrontmatter = z.object({
  num: z.string().min(1),
  title: z.string().min(1),
  author: z.string().min(1),
  status: z.enum(["now", "next", "done"]),
  cover: z.enum(["warm", "sage", "blush"]),
  /** Optional date the book was added to the shelf, used for ordering. */
  addedAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

const FilmFrontmatter = z.object({
  num: z.string().min(1),
  title: z.string().min(1),
  director: z.string().min(1),
  year: z.number().int(),
  /** Spanish-formatted session date, e.g. '2 mayo 2026'. */
  date: z.string().min(1),
  /** ISO date used for ordering. */
  sessionDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  note: z.string().min(1),
  cover: z.enum(["warm", "sage", "blush"]),
  /** Ciclo temático al que pertenece la película, e.g. '01 — Ciclo Kubrick'. */
  ciclo: z.string().min(1),
});

export type PostType = "cuento" | "escrito";
export type Tone = "warm" | "sage" | "blush";

export type Post = z.infer<typeof PostFrontmatter> & {
  type: PostType;
  /** Raw MDX body (frontmatter stripped) — pass to MDXRemote. */
  body: string;
};

export type Book = z.infer<typeof BookFrontmatter> & { slug: string };
export type Film = z.infer<typeof FilmFrontmatter> & { slug: string };

export const STATUS_LABELS: Record<Book["status"], string> = {
  now: "Leyendo",
  next: "Próximo",
  done: "Terminado",
};

// ---------------------------------------------------------------------------
// Filesystem helpers
// ---------------------------------------------------------------------------

const POST_DIRS: Record<PostType, string> = {
  cuento: "cuentos",
  escrito: "escritos",
};

function listMdxFiles(dir: string): string[] {
  const full = path.join(CONTENT_ROOT, dir);
  if (!fs.existsSync(full)) return [];
  return fs
    .readdirSync(full)
    .filter((name) => name.endsWith(".mdx"))
    .map((name) => path.join(full, name));
}

function readMdx<T extends Record<string, unknown>>(
  filePath: string,
  schema: z.ZodType<T>,
): T & { body: string } {
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    throw new Error(
      `Invalid frontmatter in ${path.relative(process.cwd(), filePath)}: ${parsed.error.message}`,
    );
  }
  return { ...parsed.data, body: content };
}

// ---------------------------------------------------------------------------
// Posts (cuentos + escritos) - Now from Firestore
// ---------------------------------------------------------------------------

export async function getPostsByType(type: PostType): Promise<Post[]> {
  const db = getServerDb();
  const snap = await db
    .collection("posts")
    .where("type", "==", type)
    .where("status", "==", "published")
    .orderBy("date", "desc")
    .get();

  return snap.docs.map((doc) => {
    const d = doc.data();
    return {
      title: d.title,
      titleHTML: d.titleHTML,
      slug: d.slug,
      date: d.date,
      dateLabel: d.dateLabel,
      eyebrow: d.eyebrow,
      cat: d.cat,
      tag: d.tag,
      excerpt: d.excerpt,
      dek: d.dek,
      heroSrc: d.heroSrc,
      heroAlt: d.heroAlt,
      heroFilter: d.heroFilter,
      readingMinutes: Number(d.readingMinutes),
      featured: d.featured,
      status: d.status,
      sections: d.sections || [],
      type: d.type as PostType,
      body: d.body,
    } as Post;
  });
}

export async function findPost(type: PostType, slug: string): Promise<Post | undefined> {
  const db = getServerDb();
  const docId = `${type}_${slug}`;
  const doc = await db.collection("posts").doc(docId).get();

  let d;
  if (!doc.exists) {
    const snap = await db
      .collection("posts")
      .where("type", "==", type)
      .where("slug", "==", slug)
      .limit(1)
      .get();
    if (snap.empty) return undefined;
    d = snap.docs[0].data();
  } else {
    d = doc.data()!;
  }

  return {
    title: d.title,
    titleHTML: d.titleHTML,
    slug: d.slug,
    date: d.date,
    dateLabel: d.dateLabel,
    eyebrow: d.eyebrow,
    cat: d.cat,
    tag: d.tag,
    excerpt: d.excerpt,
    dek: d.dek,
    heroSrc: d.heroSrc,
    heroAlt: d.heroAlt,
    heroFilter: d.heroFilter,
    readingMinutes: Number(d.readingMinutes),
    featured: d.featured,
    status: d.status,
    sections: d.sections || [],
    type: d.type as PostType,
    body: d.body,
  } as Post;
}

export async function getAllPosts(): Promise<Post[]> {
  const [cuentos, escritos] = await Promise.all([
    getPostsByType("cuento"),
    getPostsByType("escrito"),
  ]);
  return [...cuentos, ...escritos].sort((a, b) => b.date.localeCompare(a.date));
}

// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Books (Club de lectura)
// ---------------------------------------------------------------------------

export async function getBooks(): Promise<Book[]> {
  const db = getServerDb();
  const snap = await db.collection("books").orderBy("num", "asc").get();
  return snap.docs.map((doc) => {
    const data = doc.data();
    return {
      num: data.num,
      title: data.title,
      author: data.author,
      status: data.status,
      cover: data.cover,
      addedAt: data.addedAt,
      slug: doc.id,
    } as Book;
  });
}

/** Slug = the document ID. */
export async function findBookBySlug(slug: string): Promise<Book | undefined> {
  const doc = await getServerDb().collection("books").doc(slug).get();
  if (!doc.exists) return undefined;
  const data = doc.data()!;
  return {
    num: data.num,
    title: data.title,
    author: data.author,
    status: data.status,
    cover: data.cover,
    addedAt: data.addedAt,
    slug: doc.id,
  } as Book;
}

/** Most recent `updatedAt` across the whole books collection. */
export async function getBooksLastUpdated(): Promise<Date | undefined> {
  const snap = await getServerDb().collection("books").orderBy("updatedAt", "desc").limit(1).get();
  const ts = snap.docs[0]?.data().updatedAt;
  return ts?.toDate ? ts.toDate() : undefined;
}

// ---------------------------------------------------------------------------
// Films (CineClub)
// ---------------------------------------------------------------------------

export async function getFilms(): Promise<Film[]> {
  const db = getServerDb();
  const snap = await db.collection("films").orderBy("num", "desc").get();
  return snap.docs.map((doc) => {
    const data = doc.data();
    return {
      num: data.num,
      title: data.title,
      director: data.director,
      year: data.year,
      date: data.date,
      sessionDate: data.sessionDate,
      note: data.note,
      cover: data.cover,
      ciclo: data.ciclo,
      slug: doc.id,
    } as Film;
  });
}

/** Slug = the document ID. */
export async function findFilmBySlug(slug: string): Promise<Film | undefined> {
  const doc = await getServerDb().collection("films").doc(slug).get();
  if (!doc.exists) return undefined;
  const data = doc.data()!;
  return {
    num: data.num,
    title: data.title,
    director: data.director,
    year: data.year,
    date: data.date,
    sessionDate: data.sessionDate,
    note: data.note,
    cover: data.cover,
    ciclo: data.ciclo,
    slug: doc.id,
  } as Film;
}
