"use client";

import { useLike } from "./LikeProvider";
import { HeartIcon } from "./HeartIcon";

/**
 * Botón de me gusta. El estado vive en <LikeProvider> para que las dos
 * apariciones del botón dentro de un mismo post (arriba y al final del texto)
 * cuenten lo mismo.
 */
export function LikeButton() {
  const { count, liked, pending, toggle } = useLike();

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      title={liked ? "Quitar me gusta" : "Me gusta"}
      aria-pressed={liked}
      className={liked ? "on" : ""}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "0 12px",
        height: 36,
        minWidth: 36,
        borderRadius: 999,
        border: "1px solid var(--rule)",
        background: liked ? "var(--accent)" : "var(--bg)",
        color: liked ? "oklch(0.2 0.02 60)" : "var(--ink-soft)",
        cursor: pending ? "wait" : "pointer",
        transition: "background 0.15s, color 0.15s, border-color 0.15s",
      }}
    >
      <HeartIcon filled={liked} />
      <span style={{ fontSize: 12, fontVariantNumeric: "tabular-nums" }}>{count}</span>
    </button>
  );
}
