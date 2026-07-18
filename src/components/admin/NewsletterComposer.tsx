"use client";

import { useState, useTransition } from "react";
import { TipTapEditor } from "./TipTapEditor";
import { sendNewsletterAction } from "@/app/actions/newsletter";
import type { NewsletterSend } from "@/lib/newsletter";
import { formatCommentDate } from "@/lib/format-date";

export function NewsletterComposer({
  confirmedCount,
  initialHistory,
}: {
  confirmedCount: number;
  initialHistory: NewsletterSend[];
}) {
  const [subject, setSubject] = useState("");
  const [bodyHTML, setBodyHTML] = useState("");
  const [history, setHistory] = useState(initialHistory);
  const [showConfirm, setShowConfirm] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const canSend = subject.trim().length > 0 && bodyHTML.trim().length > 0 && !pending;

  const handleSend = () => {
    startTransition(async () => {
      setShowConfirm(false);
      setResult(null);
      const res = await sendNewsletterAction({ subject: subject.trim(), bodyHTML });
      if (res.ok) {
        const label = res.skipped
          ? "Enviado (sin API key — solo registrado)."
          : `Carta enviada a ${res.send.recipientCount} suscriptor${res.send.recipientCount === 1 ? "" : "es"}.`;
        setResult(label);
        setHistory((prev) => [res.send, ...prev]);
        setSubject("");
        setBodyHTML("");
      } else {
        setResult(`Error: ${res.error}`);
      }
    });
  };

  return (
    <div>
      <section className="newsletter-composer">
        <h2 className="admin-page-h2">Nueva carta</h2>

        <div className="post-editor-field">
          <label className="post-editor-field-label" htmlFor="nl-subject">
            Asunto
          </label>
          <input
            id="nl-subject"
            type="text"
            placeholder="Una carta de mayo..."
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={pending}
          />
        </div>

        <div className="post-editor-field">
          <span className="post-editor-field-label">Cuerpo</span>
          <TipTapEditor placeholder="Escribe la carta aquí..." onChangeHTML={setBodyHTML} />
        </div>

        <div className="newsletter-send-bar">
          <span className="newsletter-recipient-hint">
            {confirmedCount} suscriptor{confirmedCount === 1 ? "" : "es"} confirmado
            {confirmedCount === 1 ? "" : "s"}
          </span>
          <button
            type="button"
            className="btn-primary"
            disabled={!canSend}
            onClick={() => setShowConfirm(true)}
          >
            Enviar carta
          </button>
        </div>

        {result && (
          <p
            className={["newsletter-result", result.startsWith("Error") && "is-error"]
              .filter(Boolean)
              .join(" ")}
          >
            {result}
          </p>
        )}
      </section>

      {history.length > 0 && (
        <section className="newsletter-history">
          <h2 className="admin-page-h2">Historial</h2>
          <div className="mod-list">
            {history.map((s) => (
              <details key={s.id} className="mod-card newsletter-history-item">
                <summary className="newsletter-history-summary">
                  <div className="mod-card-meta">
                    <span className="mod-author">{s.subject}</span>
                    <span className="mod-date">{formatCommentDate(s.sentAt)}</span>
                  </div>
                  <p className="mod-body" style={{ marginBottom: 0 }}>
                    {s.recipientCount} destinatario{s.recipientCount === 1 ? "" : "s"} · enviado por{" "}
                    {s.sentBy}
                  </p>
                </summary>
                <div
                  className="newsletter-history-body"
                  dangerouslySetInnerHTML={{ __html: s.bodyHTML }}
                />
              </details>
            ))}
          </div>
        </section>
      )}

      {showConfirm && (
        <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
          <div
            className="modal-panel"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="modal-title">¿Enviar esta carta?</h3>
            <p className="modal-body">
              Se enviará <strong>&ldquo;{subject}&rdquo;</strong> a{" "}
              <strong>
                {confirmedCount} suscriptor{confirmedCount === 1 ? "" : "es"}
              </strong>
              . Esta acción no se puede deshacer.
            </p>
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowConfirm(false)}>
                Cancelar
              </button>
              <button type="button" className="btn-primary" onClick={handleSend} disabled={pending}>
                {pending ? "Enviando…" : "Sí, enviar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
