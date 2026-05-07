import Link from "next/link";
import type { ReactNode } from "react";
import { ImageSlot } from "./ImageSlot";
import type { Post } from "@/lib/content";

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const HEART_ICON = (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);
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
}: {
  post: Post;
  body: ReactNode;
  next?: { href: string; title: string };
}) {
  const indexHref = post.type === "cuento" ? "/cuentos" : "/escritos";
  const indexLabel = post.type === "cuento" ? "los cuentos" : "los escritos";
  const tocLabel = post.type === "cuento" ? "En este cuento" : "En este escrito";

  return (
    <div className="container">
      <div className="detail-grid">
        <aside className="detail-side">
          <Link className="back" href={indexHref}>
            ← Volver a {indexLabel}
          </Link>
          <div className="cat">
            {post.tag} · {post.readingMinutes} min de lectura
          </div>
          {post.titleHTML ? (
            <h1 dangerouslySetInnerHTML={{ __html: post.titleHTML }} />
          ) : (
            <h1>{post.title}</h1>
          )}
          <div className="ornament">·</div>
          {post.dek ? <p className="dek">{post.dek}</p> : null}

          <div className="byline">
            <div className="avatar">G</div>
            <div>
              <div className="who">GiraSun</div>
              <div className="meta">
                {post.dateLabel} · {post.cat}
              </div>
            </div>
          </div>

          {/* Action row — Phase 5 wires the like/share/save logic.
              Rendered as visual chips for now, no handlers attached. */}
          <div className="actions" style={{ display: "flex", gap: 8, marginBottom: 36 }}>
            <button type="button" aria-label="Me gusta" disabled style={{ opacity: 0.7 }}>
              {HEART_ICON}
            </button>
            <button type="button" aria-label="Compartir" disabled style={{ opacity: 0.7 }}>
              {SHARE_ICON}
            </button>
            <button type="button" aria-label="Guardar" disabled style={{ opacity: 0.7 }}>
              {SAVE_ICON}
            </button>
            <button type="button" aria-label="Email" disabled style={{ opacity: 0.7 }}>
              {EMAIL_ICON}
            </button>
          </div>

          <div className="toc">
            <div className="toc-head">{tocLabel}</div>
            <div className="toc-rule" />
            <ol>
              {post.sections.map((s) => (
                <li key={s}>
                  <a href={`#${slugify(s)}`}>{s}</a>
                </li>
              ))}
            </ol>
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
