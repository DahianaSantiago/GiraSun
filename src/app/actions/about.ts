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

const AboutHomeInput = z.object({
  title: z.string().trim().min(1).max(300),
  body: z.string().trim().min(1).max(2000),
  photoSrc: z.string().trim().max(2000),
  photoAlt: z.string().trim().max(300),
});

const AboutPageInput = z.object({
  title: z.string().trim().min(1).max(200),
  lede: z.string().trim().min(1).max(500),
  bodyHTML: z.string().trim().min(1).max(50000),
  body: z.string().trim().min(1).max(50000),
  photoSrc: z.string().trim().max(2000),
  photoAlt: z.string().trim().max(300),
});

export type CommitResult = { ok: true } | { ok: false; error: string; detail?: string };

const revalidateAbout = () => {
  revalidatePath("/");
  revalidatePath("/sobre-mi");
  revalidatePath("/admin/sobre-mi");
};

export async function saveAboutHomeAction(
  input: z.input<typeof AboutHomeInput>,
): Promise<CommitResult> {
  try {
    await requireAdmin();
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }

  const parsed = AboutHomeInput.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "invalid-input", detail: parsed.error.issues[0]?.message };
  }

  await getServerDb()
    .collection("settings")
    .doc("about-home")
    .set({
      ...parsed.data,
      updatedAt: new Date(),
    });

  revalidateAbout();
  return { ok: true };
}

export async function saveAboutPageAction(
  input: z.input<typeof AboutPageInput>,
): Promise<CommitResult> {
  try {
    await requireAdmin();
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }

  const parsed = AboutPageInput.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "invalid-input", detail: parsed.error.issues[0]?.message };
  }

  await getServerDb()
    .collection("settings")
    .doc("about-page")
    .set({
      ...parsed.data,
      updatedAt: new Date(),
    });

  revalidateAbout();
  return { ok: true };
}
