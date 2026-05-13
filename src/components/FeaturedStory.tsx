import Link from "next/link";
import { ImageSlot } from "./ImageSlot";
import { SectionHead } from "./SectionHead";
import { getAllPosts, type Post } from "@/lib/content";
import { resolveFilter } from "@/lib/image-filters";

const FALLBACK_QUOTE =
  "«Había una ventana que daba al verano y otra que daba al miedo. Yo elegí la que tenía cortinas blancas, y aún así, soñé con la otra durante meses.»";

export async function FeaturedStory({ post }: { post?: Post }) {
  const allPosts = await getAllPosts();
  const featured = post ?? allPosts.find((p) => p.featured);
  if (!featured) return null;

  const href = `/${featured.type === "cuento" ? "cuentos" : "escritos"}/${featured.slug}`;
  return (
    <section className="section section-tight" style={{ paddingTop: 0 }}>
      <div className="container">
        <SectionHead
          eyebrow="Lo último que escribí"
          title="Featured · de la semana"
          link={{ href, label: "Leer el cuento" }}
        />
        <div className="featured">
          <div className="featured-img">
            <ImageSlot
              src={featured.heroSrc}
              alt={featured.heroAlt}
              placeholder="Imagen del cuento destacado"
              style={{ position: "absolute", inset: 0 }}
              filter={resolveFilter(featured.heroFilter)}
            />
          </div>
          <div className="featured-body">
            <div className="featured-tag">{featured.readingMinutes} min de lectura</div>
            {featured.titleHTML ? (
              <h2 dangerouslySetInnerHTML={{ __html: featured.titleHTML }} />
            ) : (
              <h2>{featured.title}</h2>
            )}
            <blockquote className="featured-quote">{FALLBACK_QUOTE}</blockquote>
            <p className="featured-excerpt">{featured.excerpt}</p>
            <div
              style={{
                fontSize: 11,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--ink-muted)",
              }}
            >
              {featured.dateLabel} · {featured.cat}
            </div>
            <div style={{ marginTop: 24 }}>
              <Link
                className="hero-cta"
                href={href}
                style={{ background: "var(--ink)", color: "oklch(0.96 0.01 85)" }}
              >
                Continuar leyendo →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
