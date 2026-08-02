"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { HeartIcon } from "./HeartIcon";
import type { Post, PostType } from "@/lib/content";

type FilterKey = "all" | "short" | "long";
const FILTERS: Array<{ key: FilterKey; label: string }> = [
  { key: "all", label: "Todos" },
  { key: "short", label: "Lecturas cortas" },
  { key: "long", label: "Lecturas largas" },
];

const matchesFilter = (post: Post, key: FilterKey): boolean => {
  if (key === "all") return true;
  if (key === "short") return post.readingMinutes <= 4;
  return post.readingMinutes >= 5;
};

const hrefFor = (type: PostType, slug: string) =>
  `/${type === "cuento" ? "cuentos" : "escritos"}/${slug}`;

/**
 * Pie de la tarjeta: fecha y categoría a la izquierda, corazones a la derecha.
 * El corazón es solo lectura — la tarjeta entera ya es un enlace, así que aquí
 * no cabe un botón.
 */
function CardMeta({ post, likes }: { post: Post; likes: number }) {
  return (
    <div className="card-meta">
      <span>
        {post.dateLabel} · {post.cat}
      </span>
      <span
        className="card-likes"
        title={`${likes} me gusta`}
        aria-label={`${likes} me gusta`}
        role="img"
      >
        <HeartIcon size={12} filled />
        <span>{likes}</span>
      </span>
    </div>
  );
}

/** Cuentos y escritos son solo texto: sin imagen decorativa ni miniaturas en las tarjetas. */
export function PostIndex({
  posts,
  pageHead,
  likeCounts,
}: {
  posts: Post[];
  pageHead: { eyebrow?: string; titleHTML: string; lede?: string };
  /** Me gusta por slug. Un post sin entrada cuenta como 0. */
  likeCounts: Record<string, number>;
}) {
  const likesOf = (post: Post) => likeCounts[post.slug] ?? 0;

  const [filter, setFilter] = useState<FilterKey>("all");
  const [sort, setSort] = useState<"recent" | "old" | "popular">("recent");

  const filtered = useMemo(() => {
    const list = posts.filter((p) => matchesFilter(p, filter));
    if (sort === "old") return [...list].sort((a, b) => a.date.localeCompare(b.date));
    return list;
  }, [posts, filter, sort]);

  const featured = filtered.find((p) => p.featured) ?? filtered[0];
  const rest = filtered.filter((p) => p.slug !== featured?.slug);
  const secondary = rest.slice(0, 4);
  const tertiary = rest.slice(2);

  return (
    <>
      <section className="page-head">
        <div className="container" style={{ position: "relative" }}>
          {pageHead.eyebrow ? (
            <div className="ornament">
              <span className="line" />
              {pageHead.eyebrow}
              <span className="line" />
            </div>
          ) : null}
          <h1 dangerouslySetInnerHTML={{ __html: pageHead.titleHTML }} />
          {pageHead.lede ? <p className="lede">{pageHead.lede}</p> : null}
        </div>
      </section>

      <section>
        <div className="container">
          <div className="filter-bar">
            <div className="filter-tabs">
              {FILTERS.map((t) => (
                <button
                  key={t.key}
                  className={filter === t.key ? "filter-tab on" : "filter-tab"}
                  onClick={() => setFilter(t.key)}
                  type="button"
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="filter-sort">
              <span>Ordenar por:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                aria-label="Ordenar por"
              >
                <option value="recent">Recientes</option>
                <option value="old">Antiguos</option>
                <option value="popular">Más leídos</option>
              </select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <p
              style={{
                textAlign: "center",
                padding: "60px 0",
                color: "var(--ink-muted)",
              }}
            >
              No hay textos en esta selección. Prueba otro filtro.
            </p>
          ) : (
            <>
              <div className="stories-grid">
                {featured ? (
                  <Link href={hrefFor(featured.type, featured.slug)} className="story-card feature">
                    <div className="body">
                      <span className="featured-pill inline">Destacado</span>
                      <div className="featured-tag">{featured.readingMinutes} min de lectura</div>
                      {featured.titleHTML ? (
                        <h3 dangerouslySetInnerHTML={{ __html: featured.titleHTML }} />
                      ) : (
                        <h3>{featured.title}</h3>
                      )}
                      <p className="featured-excerpt">{featured.excerpt}</p>
                      <CardMeta post={featured} likes={likesOf(featured)} />
                    </div>
                  </Link>
                ) : null}
                <div className="stories-side">
                  {secondary.map((p) => (
                    <Link key={p.slug} href={hrefFor(p.type, p.slug)} className="story-card">
                      <div className="body">
                        <div className="featured-tag">{p.readingMinutes} min de lectura</div>
                        {p.titleHTML ? (
                          <h3 dangerouslySetInnerHTML={{ __html: p.titleHTML }} />
                        ) : (
                          <h3>{p.title}</h3>
                        )}
                        <p className="featured-excerpt">{p.excerpt}</p>
                        <CardMeta post={p} likes={likesOf(p)} />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {tertiary.length > 0 ? (
                <>
                  <div className="divider-ornament">✿ Más lecturas ✿</div>
                  <div className="stories-tertiary">
                    {tertiary.map((p) => (
                      <Link key={p.slug} href={hrefFor(p.type, p.slug)} className="story-card">
                        <div className="body">
                          <div className="featured-tag">{p.readingMinutes} min de lectura</div>
                          {p.titleHTML ? (
                            <h3 dangerouslySetInnerHTML={{ __html: p.titleHTML }} />
                          ) : (
                            <h3>{p.title}</h3>
                          )}
                          <p className="featured-excerpt">{p.excerpt}</p>
                          <CardMeta post={p} likes={likesOf(p)} />
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              ) : null}
            </>
          )}
        </div>
      </section>
    </>
  );
}
