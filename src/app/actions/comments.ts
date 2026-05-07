"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/firebase/session";
import { insertComment, COMMENT_MAX_LENGTH } from "@/lib/firebase/comments";

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
