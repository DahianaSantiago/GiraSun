"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addFilmAction, type CommitResult } from "@/app/actions/library";

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

export function AddFilmForm({ existingCount }: { existingCount: number }) {
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);
  const [num, setNum] = useState(String(existingCount + 1).padStart(2, "0"));
  const [title, setTitle] = useState("");
  const [director, setDirector] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [sessionDate, setSessionDate] = useState(today);
  const [note, setNote] = useState("");
  const [cover, setCover] = useState<"warm" | "sage" | "blush">("warm");
  const [ciclo, setCiclo] = useState("");
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<
    { kind: "success"; text: string } | { kind: "error"; text: string } | null
  >(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const result: CommitResult = await addFilmAction({
        num,
        title,
        director,
        year,
        date: formatSpanishDate(sessionDate),
        sessionDate,
        note,
        cover,
        ciclo,
      });
      if (result.ok) {
        router.push("/admin/cineclub");
        router.refresh();
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
      {message ? <div className={`post-editor-message ${message.kind}`}>{message.text}</div> : null}

      <div className="library-form-grid">
        <Field label="Núm. (00)">
          <input
            type="text"
            value={num}
            onChange={(e) => setNum(e.target.value)}
            placeholder="13"
            required
          />
        </Field>
        <Field label="Título">
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </Field>
        <Field label="Ciclo">
          <input
            type="text"
            value={ciclo}
            onChange={(e) => setCiclo(e.target.value)}
            placeholder="01 — Ciclo Kubrick"
            required
          />
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
          <select value={cover} onChange={(e) => setCover(e.target.value as typeof cover)}>
            <option value="warm">Warm</option>
            <option value="sage">Sage</option>
            <option value="blush">Blush</option>
          </select>
        </Field>
        <Field label="Apunte (una línea)">
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="El desierto, el rojo, el silencio."
            required
          />
        </Field>
      </div>
      <button type="submit" className="post-editor-btn" disabled={pending}>
        {pending ? "Agregando..." : "Agregar sesión →"}
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
