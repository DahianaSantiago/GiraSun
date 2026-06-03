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
  eyebrow: z
    .string()
    .trim()
    .max(40)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  cat: z.string().trim().min(1).max(40),
  tag: z
    .string()
    .trim()
    .max(60)
    .optional()
    .or(z.literal("").transform(() => undefined)),
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
  heroAlt: z.string().trim().max(200),
  heroFilter: z
    .enum(["none", "sepia", "ash", "haze", "shadow"])
    .optional()
    .or(z.literal("").transform(() => undefined)),
  readingMinutes: z.number().int().min(1).max(99),
  featured: z.boolean().optional(),
  sections: z.array(z.string().min(1).max(120)).max(20).optional(),
});

// Human-readable Spanish labels for each frontmatter field, used to turn raw Zod
// issues into messages an author can actually act on.
const FIELD_LABELS: Record<string, string> = {
  title: "El título",
  titleHTML: "El título con formato",
  slug: "El slug (la URL)",
  date: "La fecha",
  dateLabel: "La fecha",
  eyebrow: "El eyebrow",
  cat: "La categoría",
  tag: "El tag",
  excerpt: "El resumen",
  dek: "La bajada",
  heroSrc: "La imagen destacada",
  heroAlt: "El texto alternativo de la imagen",
  heroFilter: "El filtro de imagen",
  readingMinutes: "El tiempo de lectura",
};

/** Turns a Zod issue into a friendly, actionable Spanish message. */
function friendlyIssue(issue: z.core.$ZodIssue): string {
  const field = issue.path.join(".");
  const label = FIELD_LABELS[field] ?? "Un campo";

  // The resumen is auto-generated from the story body, so phrase its errors
  // around the content rather than a field the author can no longer edit.
  if (field === "excerpt") {
    return "El cuento necesita algo más de contenido (el resumen se genera automáticamente a partir del texto).";
  }

  switch (issue.code) {
    case "too_small": {
      const min = Number((issue as { minimum?: number }).minimum ?? 0);
      return min <= 1
        ? `${label} es obligatorio.`
        : `${label} debe tener al menos ${min} caracteres.`;
    }
    case "too_big": {
      const max = Number((issue as { maximum?: number }).maximum ?? 0);
      return `${label} no puede superar los ${max} caracteres.`;
    }
    case "invalid_type":
      return `${label} es obligatorio.`;
    case "invalid_format":
      return field === "slug"
        ? "El slug solo puede tener minúsculas, números y guiones."
        : field === "date" || field === "dateLabel"
          ? "La fecha debe tener el formato AAAA-MM-DD."
          : `${label} tiene un formato inválido.`;
    default:
      return `${label} tiene un valor inválido.`;
  }
}

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
    return {
      ok: false,
      error: "invalid-frontmatter",
      detail: issue ? friendlyIssue(issue) : "Hay un campo con un valor inválido.",
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
