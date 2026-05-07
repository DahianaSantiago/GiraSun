"use client";

import { useState, useTransition } from "react";
import { updateBookAction, type CommitResult } from "@/app/actions/library";
import type { Book } from "@/lib/content";

export function EditBookForm({ slug, initial }: { slug: string; initial: Book }) {
  const [num, setNum] = useState(initial.num);
  const [title, setTitle] = useState(initial.title);
  const [author, setAuthor] = useState(initial.author);
  const [status, setStatus] = useState<Book["status"]>(initial.status);
  const [cover, setCover] = useState<Book["cover"]>(initial.cover);
  const [addedAt, setAddedAt] = useState(initial.addedAt ?? new Date().toISOString().slice(0, 10));
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<
    { kind: "success"; text: string; href: string } | { kind: "error"; text: string } | null
  >(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const result: CommitResult = await updateBookAction(slug, {
        num,
        title,
        author,
        status,
        cover,
        addedAt,
      });
      if (result.ok) {
        setMessage({
          kind: "success",
          text: `Cambios guardados. Commit ${result.commit.slice(0, 7)}.`,
          href: result.url,
        });
      } else {
        setMessage({
          kind: "error",
          text: `${result.error}${result.detail ? ` — ${result.detail}` : ""}`,
        });
      }
    });
  };

  return (
    <form className="library-form" onSubmit={onSubmit}>
      {message ? (
        <div className={`post-editor-message ${message.kind}`}>
          {message.text}{" "}
          {message.kind === "success" ? (
            <a href={message.href} target="_blank" rel="noreferrer">
              ver commit
            </a>
          ) : null}
        </div>
      ) : null}

      <div className="library-form-grid">
        <Field label="Núm.">
          <input value={num} onChange={(e) => setNum(e.target.value)} required />
        </Field>
        <Field label="Título">
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </Field>
        <Field label="Autor">
          <input value={author} onChange={(e) => setAuthor(e.target.value)} required />
        </Field>
        <Field label="Estado">
          <select value={status} onChange={(e) => setStatus(e.target.value as Book["status"])}>
            <option value="now">Leyendo</option>
            <option value="next">Próximo</option>
            <option value="done">Terminado</option>
          </select>
        </Field>
        <Field label="Cover">
          <select value={cover} onChange={(e) => setCover(e.target.value as Book["cover"])}>
            <option value="warm">Warm</option>
            <option value="sage">Sage</option>
            <option value="blush">Blush</option>
          </select>
        </Field>
        <Field label="Fecha">
          <input
            type="date"
            value={addedAt}
            onChange={(e) => setAddedAt(e.target.value)}
            required
          />
        </Field>
      </div>
      <button type="submit" className="post-editor-btn" disabled={pending}>
        {pending ? "Guardando..." : "Guardar cambios →"}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="post-editor-field">
      <span className="post-editor-field-label">{label}</span>
      {children}
    </label>
  );
}
