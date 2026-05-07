"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ImageSlot } from "./ImageSlot";
import type { Post, PostType } from "@/lib/fixtures";

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

export function PostIndex({
  posts,
  pageHead,
  decoPlaceholder,
}: {
  posts: Post[];
  pageHead: { eyebrow: string; titleHTML: string; lede: string };
  decoPlaceholder: string;
}) {
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
          <div className="deco">
            <ImageSlot placeholder={decoPlaceholder} style={{ position: "absolute", inset: 0 }} />
          </div>
          <div className="ornament">
            <span className="line" />
            {pageHead.eyebrow}
            <span className="line" />
          </div>
          <h1 dangerouslySetInnerHTML={{ __html: pageHead.titleHTML }} />
          <p className="lede">{pageHead.lede}</p>
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
                    <div className="thumb" style={{ aspectRatio: "4/3" }}>
                      <span className="featured-pill">Destacado</span>
                      <ImageSlot
                        src={featured.heroSrc}
                        alt={featured.heroAlt}
                        placeholder="Foto destacada"
                        style={{ position: "absolute", inset: 0 }}
                      />
                    </div>
                    <div className="body">
                      <div className="cat">{featured.tag}</div>
                      <h3>{featured.title}</h3>
                      <p className="excerpt">{featured.excerpt}</p>
                      <div className="by">
                        <span>GiraSun</span>
                        <span className="dot" />
                        <span>{featured.dateLabel}</span>
                        <span className="dot" />
                        <span>{featured.readingMinutes} min</span>
                      </div>
                    </div>
                  </Link>
                ) : null}
                <div className="stories-side">
                  {secondary.map((p) => (
                    <Link key={p.slug} href={hrefFor(p.type, p.slug)} className="story-row">
                      <div className="thumb">
                        <ImageSlot
                          src={p.heroSrc}
                          alt={p.heroAlt}
                          placeholder="Imagen"
                          style={{ position: "absolute", inset: 0 }}
                        />
                      </div>
                      <div className="body">
                        <div className="cat">{p.tag}</div>
                        <h3 style={{ fontSize: 22 }}>{p.title}</h3>
                        <p className="excerpt">{p.excerpt}</p>
                        <div className="by" style={{ marginTop: "auto" }}>
                          <span>{p.dateLabel}</span>
                          <span className="dot" />
                          <span>{p.readingMinutes} min</span>
                        </div>
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
                        <div className="thumb">
                          <ImageSlot
                            src={p.heroSrc}
                            alt={p.heroAlt}
                            placeholder="Imagen"
                            style={{ position: "absolute", inset: 0 }}
                          />
                        </div>
                        <div className="body">
                          <div className="cat">{p.tag}</div>
                          <h3>{p.title}</h3>
                          <p className="excerpt">{p.excerpt}</p>
                          <div className="by">
                            <span>{p.dateLabel}</span>
                            <span className="dot" />
                            <span>{p.readingMinutes} min</span>
                          </div>
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
