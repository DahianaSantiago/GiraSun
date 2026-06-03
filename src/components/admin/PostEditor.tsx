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
import ImageUpload from "./ImageUpload";
import { IMAGE_FILTERS, type ImageFilterKey } from "@/lib/image-filters";
import { deriveExcerpt } from "@/lib/excerpt";

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

// Friendly Spanish copy for the error codes the actions return. Validation
// errors already arrive with a human-readable `detail`, so we surface that
// directly; the rest get a plain-language fallback.
const ERROR_MESSAGES: Record<string, string> = {
  "not-authenticated": "Tu sesión expiró. Vuelve a iniciar sesión e intenta de nuevo.",
  "not-admin": "Tu cuenta no tiene permisos de administrador.",
  "publish-failed": "No se pudo publicar. Revisa la conexión e intenta de nuevo.",
};

function describeError(result: { error: string; detail?: string }): string {
  if (result.detail) return result.detail;
  return ERROR_MESSAGES[result.error] ?? "Algo salió mal. Intenta de nuevo.";
}

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

const Chevron = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: "block", marginLeft: 6 }}
    aria-hidden="true"
  >
    <polyline points="6 9 12 15 18 9"></polyline>
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
  const [heroSrc, setHeroSrc] = useState(initial?.frontmatter.heroSrc ?? "");
  const [heroAlt, setHeroAlt] = useState(initial?.frontmatter.heroAlt ?? "");
  const [heroFilter, setHeroFilter] = useState<ImageFilterKey>(
    (initial?.frontmatter.heroFilter as ImageFilterKey) ?? "none",
  );
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
  // Track the draft id locally: a brand-new post has none until its first save,
  // after which we keep editing (and can publish) the same draft without leaving.
  const [currentId, setCurrentId] = useState<string | null>(id ?? null);
  const [menuOpen, setMenuOpen] = useState(false);

  const buildFrontmatter = (): DraftFrontmatter => ({
    type,
    title: title.trim(),
    titleHTML: titleHTML.trim() || undefined,
    slug: slug.trim() ? slugify(slug) : slugify(title),
    date,
    dateLabel: formatSpanishDate(date),
    cat: defaults.cat,
    excerpt: deriveExcerpt(body),
    heroSrc: heroSrc.trim() || undefined,
    heroAlt: heroAlt.trim(),
    heroFilter: heroFilter !== "none" ? heroFilter : undefined,
    readingMinutes: calculateReadingMinutes(body),
    featured: featured || undefined,
    eyebrow: initial?.frontmatter.eyebrow,
    tag: initial?.frontmatter.tag,
  });

  const indexHref = type === "cuento" ? "/admin/cuentos" : "/admin/escritos";
  const liveSegment = type === "cuento" ? "cuentos" : "escritos";

  // Persist the current form as a draft, reusing the existing id (or creating a
  // new one). Returns the action result so each menu action can decide where to go.
  const persistDraft = async (): Promise<DraftActionResult> => {
    const fm = buildFrontmatter();
    setSlug(fm.slug);
    return saveDraftAction({ id: currentId ?? undefined, frontmatter: fm, body });
  };

  // 1. Guardar y salir — save, then go back to the list.
  const saveAndExit = () => {
    setMenuOpen(false);
    setMessage(null);
    startSave(async () => {
      const result = await persistDraft();
      if (result.ok) {
        router.push(indexHref);
        router.refresh();
      } else {
        setMessage({ kind: "error", text: `No pude guardar. ${describeError(result)}` });
      }
    });
  };

  // 2. Guardar borrador — save and stay in the editor with a success message.
  const saveDraftStay = () => {
    setMenuOpen(false);
    setMessage(null);
    startSave(async () => {
      const wasNew = !currentId;
      const result = await persistDraft();
      if (result.ok) {
        setCurrentId(result.id);
        // Keep the URL in sync so a refresh lands on this draft's editor, without
        // a client navigation that would unmount the editor and drop the message.
        if (wasNew) {
          window.history.replaceState(null, "", `${indexHref}/${result.id}/edit`);
        }
        setMessage({ kind: "success", text: "Borrador guardado." });
      } else {
        setMessage({ kind: "error", text: `No pude guardar. ${describeError(result)}` });
      }
    });
  };

  // 3. Guardar y publicar — save, then publish (the previous publish flow).
  const saveAndPublish = () => {
    setMenuOpen(false);
    setMessage(null);
    startPublish(async () => {
      const saveResult = await persistDraft();
      if (!saveResult.ok) {
        setMessage({
          kind: "error",
          text: `No pude guardar antes de publicar. ${describeError(saveResult)}`,
        });
        return;
      }
      setCurrentId(saveResult.id);
      const result: PublishResult = await publishDraftAction(saveResult.id);
      if (result.ok) {
        setMessage({ kind: "success", text: "¡Publicado con éxito!" });
        router.push(indexHref);
        router.refresh();
      } else {
        setMessage({ kind: "error", text: `No pude publicar. ${describeError(result)}` });
      }
    });
  };

  const busy = savePending || publishPending;

  return (
    <div className="post-editor">
      <header className="post-editor-head">
        <Link className="post-editor-back" href={indexHref}>
          ← Volver a la lista
        </Link>
        <div className="post-editor-actions">
          <div className="post-editor-save">
            <button
              type="button"
              className="post-editor-btn"
              disabled={busy}
              onClick={() => setMenuOpen((o) => !o)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              {publishPending ? "Publicando..." : savePending ? "Guardando..." : "Guardar"}
              <Chevron />
            </button>
            {menuOpen ? (
              <>
                <button
                  type="button"
                  className="post-editor-save-backdrop"
                  aria-label="Cerrar menú"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="post-editor-save-menu" role="menu">
                  <button type="button" role="menuitem" onClick={saveAndExit}>
                    <span>Guardar y salir</span>
                    <small>Vuelve a la lista</small>
                  </button>
                  <button type="button" role="menuitem" onClick={saveDraftStay}>
                    <span>Guardar borrador</span>
                    <small>Sigue editando aquí</small>
                  </button>
                  <button type="button" role="menuitem" onClick={saveAndPublish}>
                    <span>Guardar y publicar</span>
                    <small>Publica el cambio</small>
                  </button>
                </div>
              </>
            ) : null}
          </div>
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
          {message.kind === "success" && currentId && !message.href ? (
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

          <FormField
            label="Resumen"
            hint="Se genera solo: las primeras 20 palabras del texto. Se actualiza al guardar."
            as="div"
          >
            <p className="post-editor-excerpt-preview" data-testid="excerpt-preview">
              {deriveExcerpt(body) || (
                <span style={{ color: "var(--ink-muted)", fontStyle: "italic" }}>
                  Empieza a escribir el cuento y el resumen aparecerá aquí.
                </span>
              )}
            </p>
          </FormField>

          <FormField label="Imagen Destacada" as="div">
            <ImageUpload
              currentSrc={heroSrc}
              currentAlt={heroAlt}
              onImageChange={(url, alt) => {
                setHeroSrc(url);
                setHeroAlt(alt);
              }}
              onClear={() => {
                setHeroSrc("");
                setHeroAlt("");
                setHeroFilter("none");
              }}
              filterCss={heroFilter !== "none" ? IMAGE_FILTERS[heroFilter].css : undefined}
              pathPrefix={type === "cuento" ? "cuentos" : "escritos"}
              slug={slug || slugify(title)}
            />
          </FormField>

          {heroSrc && (
            <FormField label="Filtro de imagen" as="div">
              <div className="filter-picker">
                {(
                  Object.entries(IMAGE_FILTERS) as [
                    ImageFilterKey,
                    { label: string; css: string },
                  ][]
                ).map(([key, { label, css }]) => (
                  <button
                    key={key}
                    type="button"
                    className={["filter-swatch", heroFilter === key && "active"]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => setHeroFilter(key)}
                    title={label}
                  >
                    {heroSrc ? (
                      <div className="filter-swatch-preview">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={heroSrc}
                          alt=""
                          style={{ filter: css === "none" ? undefined : css }}
                        />
                      </div>
                    ) : (
                      <div
                        className="filter-swatch-preview"
                        style={{
                          background:
                            key === "none"
                              ? "var(--surface-2)"
                              : key === "sepia"
                                ? "oklch(0.75 0.06 70)"
                                : key === "ash"
                                  ? "oklch(0.55 0 0)"
                                  : key === "haze"
                                    ? "oklch(0.88 0.02 200)"
                                    : "oklch(0.35 0 0)",
                        }}
                      />
                    )}
                    <span className="filter-swatch-label">{label}</span>
                  </button>
                ))}
              </div>
            </FormField>
          )}

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
  as: Tag = "label",
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  as?: "label" | "div";
}) {
  return (
    <Tag className="post-editor-field">
      <span className="post-editor-field-label">
        {label}
        {hint ? (
          <span className="post-editor-field-hint-trigger" data-hint={hint}>
            <HelpIcon />
          </span>
        ) : null}
      </span>
      {children}
    </Tag>
  );
}
