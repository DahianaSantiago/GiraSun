"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/firebase/session";
import { toggleLike, type PostType } from "@/lib/firebase/likes";

const Input = z.object({
  postType: z.enum(["cuento", "escrito"]),
  postSlug: z.string().min(1).max(200),
});

export async function toggleLikeAction(input: { postType: PostType; postSlug: string }) {
  const session = await getSession();
  if (!session) {
    return { ok: false as const, error: "not-authenticated" };
  }

  const parsed = Input.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "invalid-input" };
  }

  const { liked, count } = await toggleLike(
    parsed.data.postType,
    parsed.data.postSlug,
    session.uid,
  );

  // Revalidate the post detail page so the like count refreshes for SSR clients,
  // y también el listado, que muestra los corazones de cada tarjeta.
  const segment = parsed.data.postType === "cuento" ? "cuentos" : "escritos";
  revalidatePath(`/${segment}/${parsed.data.postSlug}`);
  revalidatePath(`/${segment}`);

  return { ok: true as const, liked, count };
}
