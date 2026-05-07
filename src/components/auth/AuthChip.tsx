"use client";

import Image from "next/image";
import { useAuth } from "./AuthProvider";

const firstName = (
  display: string | null | undefined,
  email: string | null | undefined,
): string => {
  if (display) return display.split(/\s+/)[0];
  if (email) return email.split("@")[0];
  return "Tú";
};

export function AuthChip() {
  const { user, loading, signOut } = useAuth();

  if (loading || !user) return null;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        fontSize: 13,
        color: "var(--ink-soft)",
      }}
    >
      <span
        style={{
          width: 22,
          height: 22,
          borderRadius: 999,
          background: "var(--accent-soft)",
          display: "grid",
          placeItems: "center",
          color: "var(--accent-ink)",
          fontFamily: "var(--font-display)",
          fontSize: 13,
          overflow: "hidden",
        }}
      >
        {user.photoURL ? (
          <Image src={user.photoURL} alt="" width={22} height={22} />
        ) : (
          firstName(user.displayName, user.email)[0]
        )}
      </span>
      <button
        type="button"
        onClick={() => signOut()}
        title={`Cerrar sesión (${firstName(user.displayName, user.email)})`}
        style={{
          background: "transparent",
          border: 0,
          font: "inherit",
          fontSize: 11,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--ink-muted)",
          cursor: "pointer",
          padding: "4px 0",
        }}
      >
        Salir
      </button>
    </div>
  );
}
