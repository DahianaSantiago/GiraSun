// Reads MDX content from /content/{type}/*.mdx, parses frontmatter, validates
// it with Zod, and returns typed objects. Phase 8 (admin panel) will write to
// the same directory via Octokit, so this module is the canonical reader.

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
  eyebrow: z.string().min(1),
  /** Single-word eyebrow used inside cards, e.g. 'Cuento' or 'Escrito'. */
  cat: z.string().min(1),
  /** Display-form category label, e.g. 'Cuento cuentos' or 'Escribo'. */
  tag: z.string().min(1),
  excerpt: z.string().min(1),
  dek: z.string().optional(),
  heroSrc: z.string().optional(),
  heroAlt: z.string().min(1),
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
// Posts (cuentos + escritos)
// ---------------------------------------------------------------------------

export function getPostsByType(type: PostType): Post[] {
  const files = listMdxFiles(POST_DIRS[type]);
  const posts = files.map((file) => {
    const { body, ...frontmatter } = readMdx(file, PostFrontmatter);
    return { ...frontmatter, type, body };
  });
  return posts.filter((p) => p.status === "published").sort((a, b) => b.date.localeCompare(a.date));
}

export function findPost(type: PostType, slug: string): Post | undefined {
  return getPostsByType(type).find((p) => p.slug === slug);
}

export function getAllPosts(): Post[] {
  return [...getPostsByType("cuento"), ...getPostsByType("escrito")];
}

// ---------------------------------------------------------------------------
// Books (Club de lectura)
// ---------------------------------------------------------------------------

const slugFromFile = (file: string): string =>
  file
    .split("/")
    .pop()
    ?.replace(/\.mdx$/, "") ?? "";

export function getBooks(): Book[] {
  const files = listMdxFiles("club-de-lectura");
  return files
    .map((file) => {
      const { body: _body, ...frontmatter } = readMdx(file, BookFrontmatter);
      return { ...frontmatter, slug: slugFromFile(file) } as Book;
    })
    .sort((a, b) => a.num.localeCompare(b.num));
}

/** Slug = the .mdx filename without extension. */
export function findBookBySlug(slug: string): Book | undefined {
  return getBooks().find((b) => b.slug === slug);
}

// ---------------------------------------------------------------------------
// Films (CineClub)
// ---------------------------------------------------------------------------

export function getFilms(): Film[] {
  const files = listMdxFiles("cineclub");
  return files
    .map((file) => {
      const { body: _body, ...frontmatter } = readMdx(file, FilmFrontmatter);
      return { ...frontmatter, slug: slugFromFile(file) } as Film;
    })
    .sort((a, b) => b.num.localeCompare(a.num));
}

/** Slug = the .mdx filename without extension. */
export function findFilmBySlug(slug: string): Film | undefined {
  return getFilms().find((f) => f.slug === slug);
}
