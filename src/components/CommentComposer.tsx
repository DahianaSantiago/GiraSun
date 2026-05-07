"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useAuth } from "./auth/AuthProvider";
import { createCommentAction } from "@/app/actions/comments";

const MAX_LENGTH = 2000;

export function CommentComposer({
  postType,
  postSlug,
}: {
  postType: "cuento" | "escrito";
  postSlug: string;
}) {
  const { user, promptSignIn } = useAuth();
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return promptSignIn();
    setError(null);
    startTransition(async () => {
      const result = await createCommentAction({ postType, postSlug, body });
      if (result.ok) {
        setBody("");
      } else {
        setError(
          result.error === "not-authenticated"
            ? "Tu sesión expiró. Vuelve a iniciar sesión."
            : "No pude publicar tu comentario. Intenta de nuevo.",
        );
      }
    });
  };

  const initial = (user?.displayName ?? user?.email ?? "T")[0].toUpperCase();

  return (
    <form className="comment-form" onSubmit={onSubmit} style={{ marginBottom: 32 }}>
      <div className="av">
        {user?.photoURL ? (
          <Image src={user.photoURL} alt="" width={36} height={36} />
        ) : (
          <span>{initial}</span>
        )}
      </div>
      <div>
        {user ? (
          <textarea
            placeholder="Comparte lo que sentiste..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={MAX_LENGTH}
            disabled={pending}
            aria-label="Tu comentario"
          />
        ) : (
          <button type="button" className="signin-prompt" onClick={() => promptSignIn()}>
            Inicia sesión para comentar
          </button>
        )}
        {error ? (
          <div style={{ fontSize: 12, color: "var(--accent-ink)", marginTop: 6 }}>{error}</div>
        ) : null}
        <div className="row">
          <div className="hint">
            {user
              ? `${body.length} / ${MAX_LENGTH}`
              : "Solo se usa tu cuenta para mostrar tu nombre."}
          </div>
          {user ? (
            <button type="submit" className="post" disabled={pending || body.trim().length === 0}>
              {pending ? "Publicando..." : "Publicar"}
            </button>
          ) : null}
        </div>
      </div>
    </form>
  );
}
