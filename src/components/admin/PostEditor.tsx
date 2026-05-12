"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { TipTapEditor } from "./TipTapEditor";
import {
  saveDraftAction,
  publishDraftAction,
  type DraftActionResult,
  type PublishResult,
} from "@/app/actions/drafts";
import type { DraftFrontmatter, DraftType } from "@/lib/drafts";
import { useRouter } from "next/navigation";

const slugify = (s: string): string =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const SPANISH_MONTHS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

const formatSpanishDate = (iso: string): string => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  return `${parseInt(m[3], 10)} ${SPANISH_MONTHS[parseInt(m[2], 10) - 1]}, ${m[1]}`;
};

const DEFAULTS_BY_TYPE: Record<DraftType, { cat: string }> = {
  cuento: { cat: "Cuento" },
  escrito: { cat: "Escrito" },
};

const HelpIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: "block" }}
  >
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

export function PostEditor({
  id,
  type,
  initial,
}: {
  id?: string | null;
  type: DraftType;
  initial?: { frontmatter: DraftFrontmatter; body: string };
}) {
  const router = useRouter();
  const defaults = DEFAULTS_BY_TYPE[type];

  const [title, setTitle] = useState(initial?.frontmatter.title ?? "");
  const [titleHTML, setTitleHTML] = useState(initial?.frontmatter.titleHTML ?? "");
  const [slug, setSlug] = useState(initial?.frontmatter.slug ?? "");
  const [date, setDate] = useState(
    initial?.frontmatter.date ?? new Date().toISOString().split("T")[0],
  );
  const [excerpt, setExcerpt] = useState(initial?.frontmatter.excerpt ?? "");
  const [heroSrc, setHeroSrc] = useState(initial?.frontmatter.heroSrc ?? "");
  const [heroAlt, setHeroAlt] = useState(initial?.frontmatter.heroAlt ?? "");
  const [featured, setFeatured] = useState(initial?.frontmatter.featured ?? false);
  const [body, setBody] = useState(initial?.body ?? "");

  const calculateReadingMinutes = (text: string): number => {
    const words = text
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0).length;
    const mins = Math.round(words / 150);
    return Math.max(1, mins);
  };

  const handleSlugChange = (val: string) => {
    let next = val
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    next = next.replace(/\s+/g, "-");
    next = next.replace(/[^a-z0-9-]/g, "");
    next = next.replace(/-+/g, "-");
    if (next.startsWith("-")) next = next.slice(1);
    setSlug(next);
  };

  const [savePending, startSave] = useTransition();
  const [publishPending, startPublish] = useTransition();
  const [message, setMessage] = useState<
    { kind: "success"; text: string; href?: string } | { kind: "error"; text: string } | null
  >(null);

  const buildFrontmatter = (): DraftFrontmatter => ({
    type,
    title: title.trim(),
    titleHTML: titleHTML.trim() || undefined,
    slug: slug.trim() ? slugify(slug) : slugify(title),
    date,
    dateLabel: formatSpanishDate(date),
    cat: defaults.cat,
    excerpt: excerpt.trim(),
    heroSrc: heroSrc.trim() || undefined,
    heroAlt: heroAlt.trim(),
    readingMinutes: calculateReadingMinutes(body),
    featured: featured || undefined,
    eyebrow: initial?.frontmatter.eyebrow,
    tag: initial?.frontmatter.tag,
  });

  const onSave = () => {
    setMessage(null);
    const fm = buildFrontmatter();
    setSlug(fm.slug);
    startSave(async () => {
      const result: DraftActionResult = await saveDraftAction({
        id: id ?? undefined,
        frontmatter: fm,
        body,
      });
      if (result.ok) {
        setMessage({ kind: "success", text: "Borrador guardado." });
        router.push(indexHref);
        router.refresh();
      } else {
        setMessage({
          kind: "error",
          text: `No pude guardar: ${result.error}${result.detail ? ` — ${result.detail}` : ""}`,
        });
      }
    });
  };

  const onPublish = () => {
    setMessage(null);
    const fm = buildFrontmatter();
    startPublish(async () => {
      // 1. Save latest changes first
      const saveResult: DraftActionResult = await saveDraftAction({
        id: id ?? undefined,
        frontmatter: fm,
        body,
      });

      if (!saveResult.ok) {
        setMessage({
          kind: "error",
          text: `No pude guardar antes de publicar: ${saveResult.error}`,
        });
        return;
      }

      // 2. Publish using the ID (either the existing one or the one just created)
      const finalId = id || saveResult.id;
      const result: PublishResult = await publishDraftAction(finalId);

      if (result.ok) {
        setMessage({
          kind: "success",
          text: `¡Publicado con éxito!`,
        });
        router.push(indexHref);
        router.refresh();
      } else {
        setMessage({
          kind: "error",
          text: `No pude publicar: ${result.error}${result.detail ? ` — ${result.detail}` : ""}`,
        });
      }
    });
  };

  const indexHref = type === "cuento" ? "/admin/cuentos" : "/admin/escritos";
  const liveSegment = type === "cuento" ? "cuentos" : "escritos";

  return (
    <div className="post-editor">
      <header className="post-editor-head">
        <Link className="post-editor-back" href={indexHref}>
          ← Volver a la lista
        </Link>
        <div className="post-editor-actions">
          <button
            type="button"
            className="post-editor-btn ghost"
            disabled={savePending || publishPending}
            onClick={onSave}
          >
            {savePending ? "Guardando..." : "Guardar borrador"}
          </button>
          <button
            type="button"
            className="post-editor-btn"
            disabled={!id || publishPending || savePending}
            onClick={onPublish}
            title={!id ? "Guarda un borrador primero" : "Publicar"}
          >
            {publishPending ? "Publicando..." : "Publicar →"}
          </button>
        </div>
      </header>

      {message ? (
        <div className={`post-editor-message ${message.kind}`}>
          {message.text}{" "}
          {message.kind === "success" && message.href ? (
            <a href={message.href} target="_blank" rel="noreferrer">
              ver commit
            </a>
          ) : null}
          {message.kind === "success" && id && !message.href ? (
            <a href={`/${liveSegment}/${slug}`} target="_blank" rel="noreferrer">
              ver borrador en vivo (después de publicar)
            </a>
          ) : null}
        </div>
      ) : null}

      <div className="post-editor-grid">
        <aside className="post-editor-sidebar">
          <FormField label="Título">
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!id) setSlug(slugify(e.target.value));
              }}
              placeholder="La casa donde siempre es agosto"
            />
          </FormField>

          <FormField
            label="Título HTML (con énfasis italic)"
            hint="Usa <em>palabra</em> para una palabra en italic"
          >
            <input
              type="text"
              value={titleHTML}
              onChange={(e) => setTitleHTML(e.target.value)}
              placeholder="La casa donde <em>siempre</em> es agosto"
            />
          </FormField>

          <FormField label="Slug" hint="lowercase, números y guiones">
            <input
              type="text"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="casa-agosto"
            />
          </FormField>

          <FormField label="Fecha" hint={`Se muestra como: ${formatSpanishDate(date)}`}>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </FormField>

          <FormField label="Resumen">
            <textarea
              rows={3}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Una historia sobre las casas que recordamos antes de habitarlas..."
            />
          </FormField>

          <FormField label="Imagen (path en /public)">
            <input
              type="text"
              value={heroSrc}
              onChange={(e) => setHeroSrc(e.target.value)}
              placeholder="/images/cuentos/casa-agosto/hero.jpg"
            />
          </FormField>

          <FormField label="Alt de la imagen">
            <input
              type="text"
              value={heroAlt}
              onChange={(e) => setHeroAlt(e.target.value)}
              placeholder="Cocina de verano con luz lateral..."
            />
          </FormField>

          <FormField label="Destacado">
            <label style={{ fontSize: 13, color: "var(--ink-soft)" }}>
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                style={{ marginRight: 8 }}
              />
              Mostrar como destacado en el home y en los índices
            </label>
          </FormField>
        </aside>

        <div className="post-editor-main">
          <TipTapEditor initialMarkdown={initial?.body ?? ""} onChange={setBody} />
          <div
            style={{
              marginTop: 8,
              marginRight: 4,
              fontSize: 12,
              color: "var(--ink-muted)",
              textAlign: "right",
              fontStyle: "italic",
              display: "flex",
              justifyContent: "flex-end",
              gap: 12,
            }}
          >
            <span style={{ opacity: 0.7 }}>
              {
                body
                  .trim()
                  .split(/\s+/)
                  .filter((w) => w.length > 0).length
              }{" "}
              palabras
            </span>
            <span>
              {calculateReadingMinutes(body)}{" "}
              {calculateReadingMinutes(body) === 1 ? "minuto" : "minutos"} de lectura
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function FormField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="post-editor-field">
      <span className="post-editor-field-label">
        {label}
        {hint ? (
          <span className="post-editor-field-hint-trigger" data-hint={hint}>
            <HelpIcon />
          </span>
        ) : null}
      </span>
      {children}
    </label>
  );
}
