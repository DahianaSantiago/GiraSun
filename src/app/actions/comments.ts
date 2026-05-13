"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/firebase/session";
import { isAdmin } from "@/lib/firebase/admins";
import {
  insertComment,
  setCommentHidden,
  deleteComment,
  COMMENT_MAX_LENGTH,
} from "@/lib/firebase/comments";

async function requireAdmin() {
  const session = await getSession();
  if (!session) throw new Error("not-authenticated");
  if (!(await isAdmin(session.email))) throw new Error("not-admin");
}

const Input = z.object({
  postType: z.enum(["cuento", "escrito"]),
  postSlug: z.string().min(1).max(200),
  body: z.string().trim().min(1).max(COMMENT_MAX_LENGTH),
});

export async function createCommentAction(input: {
  postType: "cuento" | "escrito";
  postSlug: string;
  body: string;
}) {
  const session = await getSession();
  if (!session) return { ok: false as const, error: "not-authenticated" };

  const parsed = Input.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: "invalid-input",
      detail: parsed.error.issues[0]?.message ?? "Validation failed",
    };
  }

  const comment = await insertComment({
    postType: parsed.data.postType,
    postSlug: parsed.data.postSlug,
    uid: session.uid,
    authorName: session.name ?? session.email ?? "Anónimo",
    authorPhotoURL: session.picture,
    body: parsed.data.body,
  });

  const segment = parsed.data.postType === "cuento" ? "cuentos" : "escritos";
  revalidatePath(`/${segment}/${parsed.data.postSlug}`);

  return { ok: true as const, comment };
}

export async function setCommentHiddenAction(id: string, hidden: boolean) {
  try {
    await requireAdmin();
    await setCommentHidden(id, hidden);
    revalidatePath("/admin/comentarios");
    return { ok: true as const };
  } catch (err) {
    return { ok: false as const, error: (err as Error).message };
  }
}

export async function deleteCommentAction(id: string) {
  try {
    await requireAdmin();
    await deleteComment(id);
    revalidatePath("/admin/comentarios");
    return { ok: true as const };
  } catch (err) {
    return { ok: false as const, error: (err as Error).message };
  }
}
