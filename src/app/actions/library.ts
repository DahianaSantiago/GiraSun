"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/firebase/session";
import { isAdmin } from "@/lib/firebase/admins";
import { getServerDb } from "@/lib/firebase/server";

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
  ciclo: z.string().trim().min(1).max(80),
});

export type CommitResult = { ok: true } | { ok: false; error: string; detail?: string };

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
  const db = getServerDb();
  const docRef = db.collection("books").doc(slug);

  const existing = await docRef.get();
  if (existing.exists) {
    return { ok: false, error: "already-exists", detail: `Book with slug ${slug} already exists` };
  }

  await docRef.set({
    ...parsed.data,
    updatedAt: new Date(),
  });

  revalidatePath("/admin/club-de-lectura");
  revalidatePath("/club-de-lectura");
  revalidatePath("/");
  return { ok: true };
}

export async function updateBookAction(
  slug: string,
  input: z.input<typeof BookInput>,
): Promise<CommitResult> {
  try {
    await requireAdmin();
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }

  const parsed = BookInput.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "invalid-input", detail: parsed.error.issues[0]?.message };
  }

  await getServerDb()
    .collection("books")
    .doc(slug)
    .set({
      ...parsed.data,
      updatedAt: new Date(),
    });

  revalidatePath("/admin/club-de-lectura");
  revalidatePath("/club-de-lectura");
  revalidatePath("/");
  return { ok: true };
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
  const db = getServerDb();
  const docRef = db.collection("films").doc(slug);

  const existing = await docRef.get();
  if (existing.exists) {
    return { ok: false, error: "already-exists", detail: `Film with slug ${slug} already exists` };
  }

  await docRef.set({
    ...parsed.data,
    updatedAt: new Date(),
  });

  revalidatePath("/admin/cineclub");
  revalidatePath("/cineclub");
  revalidatePath("/");
  return { ok: true };
}

export async function updateFilmAction(
  slug: string,
  input: z.input<typeof FilmInput>,
): Promise<CommitResult> {
  try {
    await requireAdmin();
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }

  const parsed = FilmInput.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "invalid-input", detail: parsed.error.issues[0]?.message };
  }

  await getServerDb()
    .collection("films")
    .doc(slug)
    .set({
      ...parsed.data,
      updatedAt: new Date(),
    });

  revalidatePath("/admin/cineclub");
  revalidatePath("/cineclub");
  revalidatePath("/");
  return { ok: true };
}
