"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/firebase/session";
import { isAdmin } from "@/lib/firebase/admins";
import { saveDraft, publishDraft, deleteDraft, type DraftFrontmatter } from "@/lib/drafts";

async function requireAdmin(): Promise<{ email: string }> {
  const session = await getSession();
  if (!session) throw new Error("not-authenticated");
  if (!(await isAdmin(session.email))) throw new Error("not-admin");
  return { email: session.email };
}

const FrontmatterInput = z.object({
  type: z.enum(["cuento", "escrito"]),
  title: z.string().trim().min(1).max(200),
  titleHTML: z
    .string()
    .trim()
    .max(400)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "slug must be lowercase, digits and hyphens only"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD"),
  dateLabel: z.string().trim().min(1).max(60),
  eyebrow: z.string().trim().min(1).max(40),
  cat: z.string().trim().min(1).max(40),
  tag: z.string().trim().min(1).max(60),
  excerpt: z.string().trim().min(10).max(800),
  dek: z
    .string()
    .trim()
    .max(400)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  heroSrc: z
    .string()
    .trim()
    .max(400)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  heroAlt: z.string().trim().min(1).max(200),
  readingMinutes: z.number().int().min(1).max(99),
  featured: z.boolean().optional(),
  sections: z.array(z.string().min(1).max(120)).max(20).optional(),
});

export type DraftActionResult =
  | { ok: true; id: string }
  | { ok: false; error: string; detail?: string };

export async function saveDraftAction(input: {
  id?: string;
  frontmatter: DraftFrontmatter;
  body: string;
}): Promise<DraftActionResult> {
  let session: { email: string };
  try {
    session = await requireAdmin();
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }

  const parsed = FrontmatterInput.safeParse(input.frontmatter);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const field = issue?.path.join(".") ?? "unknown";
    return {
      ok: false,
      error: "invalid-frontmatter",
      detail: `Campo '${field}': ${issue?.message ?? "valor inválido"}`,
    };
  }

  const draft = await saveDraft({
    id: input.id,
    authorEmail: session.email,
    frontmatter: parsed.data,
    body: input.body,
  });

  revalidatePath(`/admin/${draft.type === "cuento" ? "cuentos" : "escritos"}`);
  return { ok: true, id: draft.id };
}

export type PublishResult =
  | { ok: true; commit: string; url: string; path: string }
  | { ok: false; error: string; detail?: string };

export async function publishDraftAction(id: string): Promise<PublishResult> {
  try {
    await requireAdmin();
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }

  try {
    const result = await publishDraft(id);
    revalidatePath("/admin");
    revalidatePath("/admin/cuentos");
    revalidatePath("/admin/escritos");
    revalidatePath("/cuentos");
    revalidatePath("/escritos");
    return { ok: true, ...result };
  } catch (err) {
    console.error("[publish] failed:", err);
    return { ok: false, error: "publish-failed", detail: (err as Error).message };
  }
}

export async function deleteDraftAction(id: string): Promise<DraftActionResult> {
  try {
    await requireAdmin();
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
  await deleteDraft(id);
  revalidatePath("/admin/cuentos");
  revalidatePath("/admin/escritos");
  return { ok: true, id };
}
