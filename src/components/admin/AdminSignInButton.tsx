"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

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

export function AdminSignInButton({ from }: { from: string }) {
  const { user, loading, signIn } = useAuth();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  // If the user finishes signing in (e.g., after the popup closes), bounce
  // them through to the destination. The /admin/login route re-checks admin
  // status server-side and only routes them past if they qualify.
  useEffect(() => {
    if (!loading && user) {
      startTransition(() => router.replace(from));
    }
  }, [loading, user, from, router]);

  return (
    <button
      type="button"
      onClick={() => signIn()}
      disabled={pending}
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
      {pending ? "Entrando..." : "Continuar con Google"}
    </button>
  );
}
