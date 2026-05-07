import Link from "next/link";
import { ImageSlot } from "./ImageSlot";
import { SectionHead } from "./SectionHead";
import { POSTS, type Post } from "@/lib/fixtures";

const FALLBACK_QUOTE =
  "«Había una ventana que daba al verano y otra que daba al miedo. Yo elegí la que tenía cortinas blancas, y aún así, soñé con la otra durante meses.»";

export function FeaturedStory({ post = POSTS.find((p) => p.featured) }: { post?: Post }) {
  if (!post) return null;
  const href = `/${post.type === "cuento" ? "cuentos" : "escritos"}/${post.slug}`;
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
            <span className="badge">{post.cat}</span>
            <ImageSlot
              src={post.heroSrc}
              alt={post.heroAlt}
              placeholder="Imagen del cuento destacado"
              style={{ position: "absolute", inset: 0 }}
            />
          </div>
          <div className="featured-body">
            <div className="featured-tag">
              {post.tag} · {post.readingMinutes} min de lectura
            </div>
            {post.titleHTML ? (
              <h2 dangerouslySetInnerHTML={{ __html: post.titleHTML }} />
            ) : (
              <h2>{post.title}</h2>
            )}
            <blockquote className="featured-quote">{FALLBACK_QUOTE}</blockquote>
            <p className="featured-excerpt">{post.excerpt}</p>
            <div className="byline">
              <div className="avatar">G</div>
              <div>
                <div className="who">GiraSun</div>
                <div className="meta">
                  {post.dateLabel} · {post.cat}
                </div>
              </div>
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
