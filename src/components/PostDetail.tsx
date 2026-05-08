import Link from "next/link";
import type { ReactNode } from "react";
import { ImageSlot } from "./ImageSlot";
import { LikeButton } from "./LikeButton";
import type { Post } from "@/lib/content";

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
const SAVE_ICON = (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);
const EMAIL_ICON = (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <path d="m22 6-10 7L2 6" />
  </svg>
);

export function PostDetail({
  post,
  body,
  next,
  likeCount,
  initialLiked,
}: {
  post: Post;
  body: ReactNode;
  next?: { href: string; title: string };
  likeCount: number;
  initialLiked: boolean;
}) {
  const indexHref = post.type === "cuento" ? "/cuentos" : "/escritos";
  const indexLabel = post.type === "cuento" ? "los cuentos" : "los escritos";

  return (
    <div className="container">
      <div className="detail-grid">
        <aside className="detail-side">
          <Link className="back" href={indexHref}>
            ← Volver a {indexLabel}
          </Link>
          <div className="cat">{post.readingMinutes} min de lectura</div>
          {post.titleHTML ? (
            <h1 dangerouslySetInnerHTML={{ __html: post.titleHTML }} />
          ) : (
            <h1>{post.title}</h1>
          )}
          <div
            className="byline"
            style={{ justifyContent: "flex-start", paddingLeft: 0, paddingRight: 0 }}
          >
            <div
              style={{
                fontSize: 11,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--ink-muted)",
              }}
            >
              {post.dateLabel} · {post.cat}
            </div>
          </div>

          {/* Action row — like wired to Firestore; share/save/email stay
              disabled until a future phase makes them meaningful. */}
          <div
            className="actions"
            style={{ display: "flex", gap: 8, marginBottom: 36, alignItems: "center" }}
          >
            <LikeButton
              postType={post.type}
              postSlug={post.slug}
              initialCount={likeCount}
              initialLiked={initialLiked}
            />
            <button type="button" aria-label="Compartir" disabled style={{ opacity: 0.6 }}>
              {SHARE_ICON}
            </button>
            <button type="button" aria-label="Guardar" disabled style={{ opacity: 0.6 }}>
              {SAVE_ICON}
            </button>
            <button type="button" aria-label="Email" disabled style={{ opacity: 0.6 }}>
              {EMAIL_ICON}
            </button>
          </div>
        </aside>

        <main className="detail-main">
          <div className="hero-photo">
            <ImageSlot
              src={post.heroSrc}
              alt={post.heroAlt}
              placeholder="Imagen del cuento"
              style={{ position: "absolute", inset: 0 }}
              priority
            />
          </div>
          <article className="prose">{body}</article>

          {next ? (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "40px 0 0",
                borderTop: "1px solid var(--rule)",
                marginTop: 60,
                gap: 24,
                flexWrap: "wrap",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: "var(--ink-muted)",
                  }}
                >
                  Siguiente
                </div>
                <Link
                  href={next.href}
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 28,
                    marginTop: 6,
                    display: "block",
                  }}
                >
                  {next.title} →
                </Link>
              </div>
              <Link className="hero-cta" href={indexHref}>
                Ver todos los {post.type === "cuento" ? "cuentos" : "escritos"}
              </Link>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}
