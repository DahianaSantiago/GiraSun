"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TipTapEditor } from "./TipTapEditor";
import ImageUpload from "./ImageUpload";
import { saveAboutHomeAction, saveAboutPageAction, type CommitResult } from "@/app/actions/about";
import type { AboutHome, AboutPage } from "@/lib/content";

type Message = { kind: "success"; text: string } | { kind: "error"; text: string } | null;

const describeError = (result: { error: string; detail?: string }): string =>
  `${result.error}${result.detail ? ` — ${result.detail}` : ""}`;

/** Retrato 4:5, igual que el hueco `.about-strip .photo` donde se muestra. */
const PHOTO_ASPECT = 4 / 5;

export function AboutEditor({ home, page }: { home: AboutHome; page: AboutPage }) {
  const router = useRouter();

  // --- Portada (Sobre quien escribe) ---------------------------------------
  const [homeTitle, setHomeTitle] = useState(home.title);
  const [homeBody, setHomeBody] = useState(home.body);
  const [homePhotoSrc, setHomePhotoSrc] = useState(home.photoSrc);
  const [homePhotoAlt, setHomePhotoAlt] = useState(home.photoAlt);
  const [homePending, startHomeSave] = useTransition();
  const [homeMessage, setHomeMessage] = useState<Message>(null);

  const onSubmitHome = (e: React.FormEvent) => {
    e.preventDefault();
    setHomeMessage(null);
    startHomeSave(async () => {
      const result: CommitResult = await saveAboutHomeAction({
        title: homeTitle,
        body: homeBody,
        photoSrc: homePhotoSrc,
        photoAlt: homePhotoAlt,
      });
      if (result.ok) {
        setHomeMessage({ kind: "success", text: "Portada guardada." });
        router.refresh();
      } else {
        setHomeMessage({ kind: "error", text: describeError(result) });
      }
    });
  };

  // --- Página Sobre mí ------------------------------------------------------
  const [pageTitle, setPageTitle] = useState(page.title);
  const [pageLede, setPageLede] = useState(page.lede);
  const [pageBody, setPageBody] = useState(page.body);
  const [pageBodyHTML, setPageBodyHTML] = useState(page.bodyHTML);
  const [pagePhotoSrc, setPagePhotoSrc] = useState(page.photoSrc);
  const [pagePhotoAlt, setPagePhotoAlt] = useState(page.photoAlt);
  const [pagePending, startPageSave] = useTransition();
  const [pageMessage, setPageMessage] = useState<Message>(null);

  const onSubmitPage = (e: React.FormEvent) => {
    e.preventDefault();
    setPageMessage(null);
    startPageSave(async () => {
      const result: CommitResult = await saveAboutPageAction({
        title: pageTitle,
        lede: pageLede,
        bodyHTML: pageBodyHTML,
        body: pageBody,
        photoSrc: pagePhotoSrc,
        photoAlt: pagePhotoAlt,
      });
      if (result.ok) {
        setPageMessage({ kind: "success", text: "Página guardada." });
        router.refresh();
      } else {
        setPageMessage({ kind: "error", text: describeError(result) });
      }
    });
  };

  return (
    <>
      <section className="admin-page-section" style={{ marginTop: 0, borderTop: 0, paddingTop: 0 }}>
        <h2 className="admin-page-h2">Portada — Sobre quien escribe</h2>
        <form className="library-form" onSubmit={onSubmitHome}>
          {homeMessage ? (
            <div className={`post-editor-message ${homeMessage.kind}`}>{homeMessage.text}</div>
          ) : null}

          <Field label="Título">
            <textarea
              rows={2}
              value={homeTitle}
              onChange={(e) => setHomeTitle(e.target.value)}
              required
            />
          </Field>
          <Field label="Párrafo">
            <textarea
              rows={4}
              value={homeBody}
              onChange={(e) => setHomeBody(e.target.value)}
              required
            />
          </Field>
          <Field label="Foto (retrato)" as="div">
            <ImageUpload
              currentSrc={homePhotoSrc}
              currentAlt={homePhotoAlt}
              aspectRatio={PHOTO_ASPECT}
              onImageChange={(url, alt) => {
                setHomePhotoSrc(url);
                setHomePhotoAlt(alt);
              }}
              onClear={() => {
                setHomePhotoSrc("");
                setHomePhotoAlt("");
              }}
              pathPrefix="about"
              slug="retrato"
            />
          </Field>

          <button type="submit" className="post-editor-btn" disabled={homePending}>
            {homePending ? "Guardando..." : "Guardar portada →"}
          </button>
        </form>
      </section>

      <section className="admin-page-section">
        <h2 className="admin-page-h2">Página Sobre mí</h2>
        <form className="library-form" onSubmit={onSubmitPage}>
          {pageMessage ? (
            <div className={`post-editor-message ${pageMessage.kind}`}>{pageMessage.text}</div>
          ) : null}

          <div className="library-form-grid">
            <Field label="Título">
              <input
                type="text"
                value={pageTitle}
                onChange={(e) => setPageTitle(e.target.value)}
                required
              />
            </Field>
            <Field label="Lede">
              <input
                type="text"
                value={pageLede}
                onChange={(e) => setPageLede(e.target.value)}
                required
              />
            </Field>
          </div>
          <p style={{ fontSize: 12, color: "var(--ink-muted)", margin: "-8px 0 0" }}>
            En el título puedes usar <code>&lt;em&gt;palabra&lt;/em&gt;</code> para una palabra en
            italic.
          </p>

          <Field label="Cuerpo" as="div">
            <TipTapEditor
              initialMarkdown={page.body}
              onChange={setPageBody}
              onChangeHTML={setPageBodyHTML}
            />
          </Field>

          <Field label="Foto (retrato)" as="div">
            <ImageUpload
              currentSrc={pagePhotoSrc}
              currentAlt={pagePhotoAlt}
              aspectRatio={PHOTO_ASPECT}
              onImageChange={(url, alt) => {
                setPagePhotoSrc(url);
                setPagePhotoAlt(alt);
              }}
              onClear={() => {
                setPagePhotoSrc("");
                setPagePhotoAlt("");
              }}
              pathPrefix="about"
              slug="retrato"
            />
          </Field>

          <button type="submit" className="post-editor-btn" disabled={pagePending}>
            {pagePending ? "Guardando..." : "Guardar página →"}
          </button>
        </form>
      </section>
    </>
  );
}

function Field({
  label,
  children,
  as: Tag = "label",
}: {
  label: string;
  children: React.ReactNode;
  as?: "label" | "div";
}) {
  return (
    <Tag className="post-editor-field">
      <span className="post-editor-field-label">{label}</span>
      {children}
    </Tag>
  );
}
