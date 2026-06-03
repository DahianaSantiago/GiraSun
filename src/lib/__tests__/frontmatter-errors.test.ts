import { describe, it, expect } from "vitest";
import { z } from "zod";
import { friendlyIssue } from "../frontmatter-errors";

// A schema that mirrors the real frontmatter constraints closely enough to make
// Zod emit the same issue codes the action sees in production. This guards
// against Zod version drift (e.g. v4 renaming `invalid_string` → `invalid_format`).
const schema = z.object({
  title: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  excerpt: z.string().min(10),
  heroAlt: z.string().max(5),
  readingMinutes: z.number(),
});

function issueFor(value: unknown, path: string): z.core.$ZodIssue {
  const res = schema.safeParse(value);
  if (res.success) throw new Error("expected validation to fail");
  const issue = res.error.issues.find((i) => i.path.join(".") === path);
  if (!issue) throw new Error(`no issue produced for "${path}"`);
  return issue;
}

const base = {
  title: "Título",
  slug: "slug-ok",
  date: "2026-06-02",
  excerpt: "Un resumen suficientemente largo.",
  heroAlt: "alt",
  readingMinutes: 3,
};

describe("friendlyIssue", () => {
  it("required (min 1) field → 'es obligatorio'", () => {
    expect(friendlyIssue(issueFor({ ...base, title: "" }, "title"))).toBe(
      "El título es obligatorio.",
    );
  });

  it("invalid slug format → slug-specific message", () => {
    expect(friendlyIssue(issueFor({ ...base, slug: "Mal Slug!" }, "slug"))).toBe(
      "El slug solo puede tener minúsculas, números y guiones.",
    );
  });

  it("invalid date format → date-specific message", () => {
    expect(friendlyIssue(issueFor({ ...base, date: "02/06/2026" }, "date"))).toBe(
      "La fecha debe tener el formato AAAA-MM-DD.",
    );
  });

  it("too-short excerpt → content-oriented message (excerpt is auto-generated)", () => {
    const msg = friendlyIssue(issueFor({ ...base, excerpt: "corto" }, "excerpt"));
    expect(msg).toContain("contenido");
    expect(msg).toContain("se genera automáticamente");
  });

  it("too-long field → 'no puede superar los N caracteres'", () => {
    expect(friendlyIssue(issueFor({ ...base, heroAlt: "demasiado largo" }, "heroAlt"))).toBe(
      "El texto alternativo de la imagen no puede superar los 5 caracteres.",
    );
  });

  it("wrong type (missing number) → 'es obligatorio'", () => {
    expect(friendlyIssue(issueFor({ ...base, readingMinutes: undefined }, "readingMinutes"))).toBe(
      "El tiempo de lectura es obligatorio.",
    );
  });

  it("min > 1 → 'debe tener al menos N caracteres'", () => {
    const issue = {
      code: "too_small",
      minimum: 5,
      path: ["title"],
    } as unknown as z.core.$ZodIssue;
    expect(friendlyIssue(issue)).toBe("El título debe tener al menos 5 caracteres.");
  });

  it("unknown field falls back to a generic label", () => {
    const issue = {
      code: "too_small",
      minimum: 1,
      path: ["mystery"],
    } as unknown as z.core.$ZodIssue;
    expect(friendlyIssue(issue)).toBe("Un campo es obligatorio.");
  });
});
