"use client";

import { useState, useTransition } from "react";
import { useAuth } from "./auth/AuthProvider";
import { toggleLikeAction } from "@/app/actions/likes";

export function LikeButton({
  postType,
  postSlug,
  initialCount,
  initialLiked,
}: {
  postType: "cuento" | "escrito";
  postSlug: string;
  initialCount: number;
  initialLiked: boolean;
}) {
  const { user, promptSignIn } = useAuth();
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(initialLiked);
  const [pending, startTransition] = useTransition();

  const onClick = () => {
    if (!user) {
      promptSignIn();
      return;
    }
    // Optimistic update.
    const nextLiked = !liked;
    setLiked(nextLiked);
    setCount((c) => c + (nextLiked ? 1 : -1));

    startTransition(async () => {
      const result = await toggleLikeAction({ postType, postSlug });
      if (!result.ok) {
        // Revert on failure.
        setLiked(liked);
        setCount(initialCount);
        return;
      }
      // Sync with the authoritative server count.
      setLiked(result.liked);
      setCount(result.count);
    });
  };

  return (
    <button
      type="button"
      onClick={onClick}
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
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill={liked ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      <span style={{ fontSize: 12, fontVariantNumeric: "tabular-nums" }}>{count}</span>
    </button>
  );
}
