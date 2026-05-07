"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/firebase/session";
import { isAdmin } from "@/lib/firebase/admins";
import { commitFiles, readFileFromRepo } from "@/lib/octokit";

async function requireAdmin(): Promise<{ email: string }> {
  const session = await getSession();
  if (!session) throw new Error("not-authenticated");
  if (!(await isAdmin(session.email))) throw new Error("not-admin");
  return { email: session.email };
}

const slugify = (s: string): string =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const BookInput = z.object({
  num: z.string().regex(/^\d{2}$/, "Use two digits like '07'"),
  title: z.string().trim().min(1).max(200),
  author: z.string().trim().min(1).max(120),
  status: z.enum(["now", "next", "done"]),
  cover: z.enum(["warm", "sage", "blush"]),
  addedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

const FilmInput = z.object({
  num: z.string().regex(/^\d{2}$/, "Use two digits like '13'"),
  title: z.string().trim().min(1).max(200),
  director: z.string().trim().min(1).max(120),
  year: z.number().int().min(1880).max(2100),
  date: z.string().trim().min(1).max(40),
  sessionDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  note: z.string().trim().min(1).max(200),
  cover: z.enum(["warm", "sage", "blush"]),
});

const yamlString = (v: string): string => JSON.stringify(v);

export type CommitResult =
  | { ok: true; path: string; commit: string; url: string }
  | { ok: false; error: string; detail?: string };

export async function addBookAction(input: z.input<typeof BookInput>): Promise<CommitResult> {
  try {
    await requireAdmin();
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }

  const parsed = BookInput.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "invalid-input", detail: parsed.error.issues[0]?.message };
  }

  const slug = `${parsed.data.num}-${slugify(parsed.data.title)}`;
  const path = `content/club-de-lectura/${slug}.mdx`;

  const existing = await readFileFromRepo(path);
  if (existing) {
    return { ok: false, error: "already-exists", detail: `${path} already exists in the repo` };
  }

  const fm = parsed.data;
  const mdx =
    "---\n" +
    `num: ${yamlString(fm.num)}\n` +
    `title: ${yamlString(fm.title)}\n` +
    `author: ${yamlString(fm.author)}\n` +
    `status: ${yamlString(fm.status)}\n` +
    `cover: ${yamlString(fm.cover)}\n` +
    `addedAt: ${yamlString(fm.addedAt)}\n` +
    "---\n";

  const result = await commitFiles({
    files: [{ path, content: mdx }],
    message: `feat(content): add book '${fm.title}' to club-de-lectura`,
  });

  revalidatePath("/admin/club-de-lectura");
  revalidatePath("/club-de-lectura");
  revalidatePath("/");
  return { ok: true, path, commit: result.commit, url: result.html_url };
}

export async function addFilmAction(input: z.input<typeof FilmInput>): Promise<CommitResult> {
  try {
    await requireAdmin();
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }

  const parsed = FilmInput.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "invalid-input", detail: parsed.error.issues[0]?.message };
  }

  const slug = `${parsed.data.num}-${slugify(parsed.data.title)}`;
  const path = `content/cineclub/${slug}.mdx`;

  const existing = await readFileFromRepo(path);
  if (existing) {
    return { ok: false, error: "already-exists", detail: `${path} already exists in the repo` };
  }

  const fm = parsed.data;
  const lines = [
    "---",
    `num: ${yamlString(fm.num)}`,
    `title: ${yamlString(fm.title)}`,
    `director: ${yamlString(fm.director)}`,
    `year: ${fm.year}`,
    `date: ${yamlString(fm.date)}`,
  ];
  if (fm.sessionDate) lines.push(`sessionDate: ${yamlString(fm.sessionDate)}`);
  lines.push(`note: ${yamlString(fm.note)}`);
  lines.push(`cover: ${yamlString(fm.cover)}`);
  lines.push("---", "");

  const result = await commitFiles({
    files: [{ path, content: lines.join("\n") }],
    message: `feat(content): add film '${fm.title}' to cineclub`,
  });

  revalidatePath("/admin/cineclub");
  revalidatePath("/cineclub");
  revalidatePath("/");
  return { ok: true, path, commit: result.commit, url: result.html_url };
}
