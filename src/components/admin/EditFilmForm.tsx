"use client";

import { useState, useTransition } from "react";
import { updateFilmAction, type CommitResult } from "@/app/actions/library";
import type { Film } from "@/lib/content";

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
  return `${parseInt(m[3], 10)} ${SPANISH_MONTHS[parseInt(m[2], 10) - 1]} ${m[1]}`;
};

export function EditFilmForm({ slug, initial }: { slug: string; initial: Film }) {
  const [num, setNum] = useState(initial.num);
  const [title, setTitle] = useState(initial.title);
  const [director, setDirector] = useState(initial.director);
  const [year, setYear] = useState(initial.year);
  const [sessionDate, setSessionDate] = useState(
    initial.sessionDate ?? new Date().toISOString().slice(0, 10),
  );
  const [note, setNote] = useState(initial.note);
  const [cover, setCover] = useState<Film["cover"]>(initial.cover);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<
    { kind: "success"; text: string; href: string } | { kind: "error"; text: string } | null
  >(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const result: CommitResult = await updateFilmAction(slug, {
        num,
        title,
        director,
        year,
        date: formatSpanishDate(sessionDate),
        sessionDate,
        note,
        cover,
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
          <input type="text" value={num} onChange={(e) => setNum(e.target.value)} required />
        </Field>
        <Field label="Título">
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </Field>
        <Field label="Director">
          <input
            type="text"
            value={director}
            onChange={(e) => setDirector(e.target.value)}
            required
          />
        </Field>
        <Field label="Año">
          <input
            type="number"
            value={year}
            min={1880}
            max={2100}
            onChange={(e) => setYear(parseInt(e.target.value, 10) || year)}
          />
        </Field>
        <Field label="Fecha de sesión">
          <input type="date" value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} />
        </Field>
        <Field label="Cover">
          <select value={cover} onChange={(e) => setCover(e.target.value as Film["cover"])}>
            <option value="warm">Warm</option>
            <option value="sage">Sage</option>
            <option value="blush">Blush</option>
          </select>
        </Field>
        <Field label="Apunte">
          <input type="text" value={note} onChange={(e) => setNote(e.target.value)} required />
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
