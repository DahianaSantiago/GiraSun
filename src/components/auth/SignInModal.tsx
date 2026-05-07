"use client";

import { useEffect } from "react";
import { useAuth } from "./AuthProvider";

const GOOGLE_LOGO = (
  <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"
    />
    <path
      fill="#34A853"
      d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.83.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.32A9 9 0 0 0 9 18z"
    />
    <path
      fill="#FBBC05"
      d="M3.97 10.72A5.41 5.41 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.96H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.04l3.01-2.32z"
    />
    <path
      fill="#EA4335"
      d="M9 3.58c1.32 0 2.5.45 3.44 1.34l2.58-2.58A9 9 0 0 0 .96 4.96l3.01 2.32C4.68 5.16 6.66 3.58 9 3.58z"
    />
  </svg>
);

/**
 * Global sign-in modal. Rendered once near the root of the public layout —
 * any component can call \\\`promptSignIn()\\\` from useAuth() to open it.
 */
export function SignInModal() {
  const { signInPromptOpen, closeSignInPrompt, signIn } = useAuth();

  useEffect(() => {
    if (!signInPromptOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSignInPrompt();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [signInPromptOpen, closeSignInPrompt]);

  if (!signInPromptOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="signin-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "color-mix(in oklab, var(--ink) 60%, transparent)",
        display: "grid",
        placeItems: "center",
        padding: 22,
      }}
      onClick={closeSignInPrompt}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--bg)",
          borderRadius: "var(--radius-l)",
          padding: "44px 40px 36px",
          maxWidth: 420,
          width: "100%",
          boxShadow: "0 30px 60px -20px oklch(0.15 0.02 70 / 0.4)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 11,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: "var(--ink-muted)",
            marginBottom: 14,
          }}
        >
          Continúa la conversación
        </div>
        <h2
          id="signin-title"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 400,
            fontSize: 30,
            lineHeight: 1.15,
            margin: "0 0 12px",
            letterSpacing: "-0.015em",
          }}
        >
          Inicia sesión para <em style={{ color: "var(--accent-ink)" }}>dejar tu marca</em>.
        </h2>
        <p
          style={{
            fontSize: 14,
            lineHeight: 1.6,
            color: "var(--ink-soft)",
            margin: "0 0 28px",
          }}
        >
          Solo usamos tu cuenta de Google para que tu nombre aparezca al lado del comentario o del
          like. Sin newsletters automáticos, sin nada más.
        </p>
        <button
          type="button"
          onClick={() => signIn()}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 22px",
            borderRadius: 999,
            background: "var(--ink)",
            color: "oklch(0.96 0.01 85)",
            border: 0,
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 500,
            letterSpacing: "0.02em",
          }}
        >
          {GOOGLE_LOGO}
          Continuar con Google
        </button>
        <button
          type="button"
          onClick={closeSignInPrompt}
          style={{
            display: "block",
            margin: "20px auto 0",
            background: "transparent",
            border: 0,
            color: "var(--ink-muted)",
            fontSize: 12,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
