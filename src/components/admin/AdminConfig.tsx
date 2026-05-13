"use client";

import { useState, useTransition } from "react";
import { addAdminAction, removeAdminAction } from "@/app/actions/admins";

export function AdminConfig({
  firestoreAdmins,
  envAdmins,
}: {
  firestoreAdmins: string[];
  envAdmins: string[];
}) {
  const [admins, setAdmins] = useState(firestoreAdmins);
  const [newEmail, setNewEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleAdd = () => {
    const email = newEmail.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      setError("Introduce un email válido.");
      return;
    }
    if (admins.includes(email) || envAdmins.includes(email)) {
      setError("Este email ya es admin.");
      return;
    }
    setError(null);
    setAdmins((prev) => [...prev, email]);
    setNewEmail("");
    startTransition(async () => {
      const res = await addAdminAction(email);
      if (!res.ok) {
        setAdmins((prev) => prev.filter((a) => a !== email));
        setError(res.error ?? "Error al agregar.");
      }
    });
  };

  const handleRemove = (email: string) => {
    if (!confirm(`¿Quitar admin a ${email}?`)) return;
    setAdmins((prev) => prev.filter((a) => a !== email));
    startTransition(async () => {
      const res = await removeAdminAction(email);
      if (!res.ok) {
        setAdmins((prev) => [...prev, email].sort());
        setError(
          res.error === "env-admin"
            ? "Este admin está definido por variable de entorno y no se puede quitar desde aquí."
            : (res.error ?? "Error al quitar."),
        );
      }
    });
  };

  const allAdmins = [...new Set([...envAdmins, ...admins])].sort();

  return (
    <div style={{ opacity: pending ? 0.7 : 1, transition: "opacity 0.15s" }}>
      <section className="config-section">
        <h2 className="admin-page-h2">Admins activos</h2>
        {allAdmins.length === 0 ? (
          <p style={{ color: "var(--ink-muted)", fontStyle: "italic" }}>
            No hay admins configurados.
          </p>
        ) : (
          <ul className="admin-list">
            {allAdmins.map((email) => {
              const isEnv = envAdmins.includes(email);
              return (
                <li key={email} className="admin-list-item">
                  <span className="admin-list-email">{email}</span>
                  {isEnv ? (
                    <span className="status-pill done" title="Definido en ADMIN_EMAILS">
                      env
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="icon-btn danger"
                      title="Quitar admin"
                      onClick={() => handleRemove(email)}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="config-section">
        <h2 className="admin-page-h2">Agregar admin</h2>
        <div className="config-add-row">
          <input
            type="email"
            className="config-email-input"
            placeholder="email@ejemplo.com"
            value={newEmail}
            onChange={(e) => {
              setNewEmail(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
            }}
            disabled={pending}
          />
          <button
            type="button"
            className="btn-primary"
            onClick={handleAdd}
            disabled={pending || !newEmail.trim()}
          >
            Agregar
          </button>
        </div>
        {error && <p className="newsletter-result is-error">{error}</p>}
        <p className="config-hint">
          Los admins definidos por variable de entorno <code>ADMIN_EMAILS</code> no se pueden quitar
          desde aquí. Necesitan un redeploy.
        </p>
      </section>
    </div>
  );
}
