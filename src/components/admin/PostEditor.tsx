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

const slugify = (s: string): string =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

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

const DEFAULTS_BY_TYPE: Record<DraftType, { eyebrow: string; cat: string; tag: string }> = {
  cuento: { eyebrow: "Cuento", cat: "Cuento", tag: "Cuento cuentos" },
  escrito: { eyebrow: "Escrito", cat: "Escrito", tag: "Escribo" },
};

export function PostEditor({
  type,
  initial,
}: {
  type: DraftType;
  initial?: { id: string; frontmatter: DraftFrontmatter; body: string };
}) {
  const defaults = DEFAULTS_BY_TYPE[type];
  const today = new Date().toISOString().slice(0, 10);

  const [id, setId] = useState<string | null>(initial?.id ?? null);
  const [title, setTitle] = useState(initial?.frontmatter.title ?? "");
  const [titleHTML, setTitleHTML] = useState(initial?.frontmatter.titleHTML ?? "");
  const [slug, setSlug] = useState(initial?.frontmatter.slug ?? "");
  const [date, setDate] = useState(initial?.frontmatter.date ?? today);
  const [eyebrow, setEyebrow] = useState(initial?.frontmatter.eyebrow ?? defaults.eyebrow);
  const [cat, setCat] = useState(initial?.frontmatter.cat ?? defaults.cat);
  const [tag, setTag] = useState(initial?.frontmatter.tag ?? defaults.tag);
  const [excerpt, setExcerpt] = useState(initial?.frontmatter.excerpt ?? "");
  const [dek, setDek] = useState(initial?.frontmatter.dek ?? "");
  const [heroSrc, setHeroSrc] = useState(initial?.frontmatter.heroSrc ?? "");
  const [heroAlt, setHeroAlt] = useState(initial?.frontmatter.heroAlt ?? "");
  const [readingMinutes, setReadingMinutes] = useState(initial?.frontmatter.readingMinutes ?? 5);
  const [featured, setFeatured] = useState(initial?.frontmatter.featured ?? false);
  const [sectionsRaw, setSectionsRaw] = useState((initial?.frontmatter.sections ?? []).join("\n"));
  const [body, setBody] = useState(initial?.body ?? "");

  const [savePending, startSave] = useTransition();
  const [publishPending, startPublish] = useTransition();
  const [message, setMessage] = useState<
    { kind: "success"; text: string; href?: string } | { kind: "error"; text: string } | null
  >(null);

  const buildFrontmatter = (): DraftFrontmatter => ({
    type,
    title: title.trim(),
    titleHTML: titleHTML.trim() || undefined,
    slug: slug.trim() || slugify(title),
    date,
    dateLabel: formatSpanishDate(date),
    eyebrow: eyebrow.trim(),
    cat: cat.trim(),
    tag: tag.trim(),
    excerpt: excerpt.trim(),
    dek: dek.trim() || undefined,
    heroSrc: heroSrc.trim() || undefined,
    heroAlt: heroAlt.trim(),
    readingMinutes,
    featured: featured || undefined,
    sections: sectionsRaw
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
  });

  const onSave = () => {
    setMessage(null);
    const fm = buildFrontmatter();
    if (!fm.slug) fm.slug = slugify(fm.title);
    startSave(async () => {
      const result: DraftActionResult = await saveDraftAction({
        id: id ?? undefined,
        frontmatter: fm,
        body,
      });
      if (result.ok) {
        setId(result.id);
        setMessage({ kind: "success", text: "Borrador guardado." });
      } else {
        setMessage({
          kind: "error",
          text: `No pude guardar: ${result.error}${result.detail ? ` — ${result.detail}` : ""}`,
        });
      }
    });
  };

  const onPublish = () => {
    if (!id) {
      setMessage({ kind: "error", text: "Guarda un borrador primero." });
      return;
    }
    setMessage(null);
    startPublish(async () => {
      const result: PublishResult = await publishDraftAction(id);
      if (result.ok) {
        setMessage({
          kind: "success",
          text: `Publicado. Vercel está reconstruyendo. Commit ${result.commit.slice(0, 7)}.`,
          href: result.url,
        });
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
            <>
              {" "}
              <a href={`/${liveSegment}/${slug}`} target="_blank" rel="noreferrer">
                ver borrador en vivo (después de publicar)
              </a>
            </>
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
              onChange={(e) => setSlug(slugify(e.target.value))}
              placeholder="casa-agosto"
            />
          </FormField>

          <FormField
            label="Fecha (YYYY-MM-DD)"
            hint={`Se muestra como: ${formatSpanishDate(date)}`}
          >
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </FormField>

          <FormField label="Excerpt" hint="Aparece en las listas y en el OG">
            <textarea
              rows={3}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Una historia sobre las casas que recordamos antes de habitarlas..."
            />
          </FormField>

          <FormField label="Dek (opcional)" hint="Línea italic en el panel del detail">
            <input
              type="text"
              value={dek}
              onChange={(e) => setDek(e.target.value)}
              placeholder="Una historia sobre las casas..."
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

          <FormField label="Minutos de lectura">
            <input
              type="number"
              min={1}
              max={99}
              value={readingMinutes}
              onChange={(e) => setReadingMinutes(parseInt(e.target.value, 10) || 1)}
            />
          </FormField>

          <FormField label="Eyebrow">
            <input type="text" value={eyebrow} onChange={(e) => setEyebrow(e.target.value)} />
          </FormField>

          <FormField label="Cat (single word)">
            <input type="text" value={cat} onChange={(e) => setCat(e.target.value)} />
          </FormField>

          <FormField label="Tag (display)">
            <input type="text" value={tag} onChange={(e) => setTag(e.target.value)} />
          </FormField>

          <FormField label="Secciones (TOC, una por línea)">
            <textarea
              rows={4}
              value={sectionsRaw}
              onChange={(e) => setSectionsRaw(e.target.value)}
              placeholder={"La ventana que daba al verano\nRecados en la harina"}
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
      <span className="post-editor-field-label">{label}</span>
      {children}
      {hint ? <span className="post-editor-field-hint">{hint}</span> : null}
    </label>
  );
}
