"use client";

import { useEffect, useRef, useState } from "react";

const SHARE_ICON = (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98" />
  </svg>
);

const CHECK_ICON = (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path d="M4 12.5 9 17.5 20 6.5" />
  </svg>
);

/**
 * Botón de compartir de cuentos y escritos.
 *
 * En el celular abre la hoja de compartir del sistema (WhatsApp, notas,
 * mensajes). En el escritorio, donde casi ningún navegador implementa
 * navigator.share, copia el enlace al portapapeles y lo dice — que es lo que
 * la persona iba a hacer a mano de todos modos.
 *
 * La URL se lee de window.location en el momento del clic, así el enlace
 * compartido es exactamente el que la persona está viendo.
 */
export function ShareButton({ title, text }: { title: string; text?: string }) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const flash = (setter: (v: boolean) => void) => {
    setter(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setter(false), 2200);
  };

  const copyToClipboard = async (url: string) => {
    // El API de portapapeles necesita contexto seguro; en local por http no
    // existe, así que queda el textarea como último recurso.
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      return true;
    }
    const field = document.createElement("textarea");
    field.value = url;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(field);
    return ok;
  };

  const onClick = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (err) {
        // Cerrar la hoja de compartir lanza AbortError: es una cancelación, no
        // un fallo, y no debe caer al portapapeles ni avisar nada.
        if (err instanceof DOMException && err.name === "AbortError") return;
      }
    }

    try {
      flash((await copyToClipboard(url)) ? setCopied : setFailed);
    } catch {
      flash(setFailed);
    }
  };

  const label = copied ? "Enlace copiado" : failed ? "No se pudo copiar" : "Compartir";

  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "0 12px",
        height: 36,
        minWidth: 36,
        borderRadius: 999,
        border: "1px solid var(--rule)",
        background: "var(--bg)",
        color: copied ? "var(--accent-ink)" : "var(--ink-soft)",
        cursor: "pointer",
        transition: "color 0.15s, border-color 0.15s",
      }}
    >
      {copied ? CHECK_ICON : SHARE_ICON}
      {copied || failed ? <span style={{ fontSize: 12 }}>{label}</span> : null}
      {/* Aviso para lectores de pantalla; el proyecto no tiene una clase
          sr-only, así que se oculta aquí mismo. */}
      <span
        aria-live="polite"
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          overflow: "hidden",
          clip: "rect(0 0 0 0)",
        }}
      >
        {copied ? "Enlace copiado" : ""}
      </span>
    </button>
  );
}
