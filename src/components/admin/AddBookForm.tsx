"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addBookAction, type CommitResult } from "@/app/actions/library";

const NEXT_NUM = (count: number): string => String(count + 1).padStart(2, "0");

export function AddBookForm({ existingCount }: { existingCount: number }) {
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);
  const [num, setNum] = useState(NEXT_NUM(existingCount));
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [status, setStatus] = useState<"now" | "next" | "done">("next");
  const [cover, setCover] = useState<"warm" | "sage" | "blush">("warm");
  const [addedAt, setAddedAt] = useState(today);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<
    { kind: "success"; text: string } | { kind: "error"; text: string } | null
  >(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const result: CommitResult = await addBookAction({
        num,
        title,
        author,
        status,
        cover,
        addedAt,
      });
      if (result.ok) {
        router.push("/admin/club-de-lectura");
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
            placeholder="07"
            required
          />
        </Field>
        <Field label="Título">
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </Field>
        <Field label="Autor">
          <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} required />
        </Field>
        <Field label="Estado">
          <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
            <option value="now">Leyendo</option>
            <option value="next">Próximo</option>
            <option value="done">Terminado</option>
          </select>
        </Field>
        <Field label="Cover">
          <select value={cover} onChange={(e) => setCover(e.target.value as typeof cover)}>
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
        {pending ? "Agregando..." : "Agregar al estante →"}
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
