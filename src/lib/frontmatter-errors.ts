import type { z } from "zod";

// Human-readable Spanish labels for each frontmatter field, used to turn raw Zod
// issues into messages an author can actually act on.
export const FIELD_LABELS: Record<string, string> = {
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
export function friendlyIssue(issue: z.core.$ZodIssue): string {
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
