import Link from "next/link";
import { ImageSlot } from "./ImageSlot";

type HeroVariant = "split" | "centered" | "fullbleed";

const EYEBROW = "Diario personal";
const QUOTE =
  "Tú eres un girasol, pero cuando caminas te vuelves sol, y entonces yo, sin remedio, me convierto en girasol.";

export function Hero({
  variant = "split",
  imageSrc,
  imageAlt = "Foto principal — girasol / mano / cuaderno",
}: {
  variant?: HeroVariant;
  imageSrc?: string;
  imageAlt?: string;
}) {
  if (variant === "centered") {
    return (
      <section className="hero hero-photo-bg" style={{ textAlign: "center" }}>
        <ImageSlot
          src={imageSrc}
          alt={imageAlt}
          placeholder="Foto principal — girasol / paisaje"
          className="hero-bg-slot"
          shape="rect"
          priority
        />
        <div className="hero-bg-filter" />
        <div className="container" style={{ padding: "62px 0", position: "relative", zIndex: 2 }}>
          <div className="hero-eyebrow" style={{ justifyContent: "center" }}>
            {EYEBROW}
          </div>
          <h1 className="hero-title" style={{ margin: "0 auto 24px", maxWidth: "14ch" }}>
            Gira<em>Sun</em>
          </h1>
          <p className="hero-quote" style={{ margin: "0 auto" }}>
            {QUOTE}
          </p>
        </div>
      </section>
    );
  }

  if (variant === "fullbleed") {
    return (
      <section className="hero hero-photo-bg" style={{ minHeight: 680, position: "relative" }}>
        <ImageSlot
          src={imageSrc}
          alt={imageAlt}
          placeholder={imageAlt}
          style={{ position: "absolute", inset: 0, opacity: 0.55 }}
        />
        <div className="hero-bg-filter" />
        <div
          className="container"
          style={{ position: "relative", padding: "160px 0 130px", maxWidth: 820, zIndex: 2 }}
        >
          <div className="hero-eyebrow">{EYEBROW}</div>
          <h1 className="hero-title">
            Gira<em>Sun</em>
          </h1>
          <p className="hero-quote">{QUOTE}</p>
          <div>
            <Link className="hero-cta" href="/cuentos">
              Leer los cuentos →
            </Link>
            <Link className="hero-cta-ghost" href="/sobre-mi">
              Sobre mí
            </Link>
          </div>
        </div>
      </section>
    );
  }

  // split (default) — title left, photo right
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-inner">
          <div>
            <div className="hero-eyebrow">{EYEBROW}</div>
            <h1 className="hero-title">
              Gira<em>Sun</em>
            </h1>
            <p className="hero-quote">{QUOTE}</p>
            <div>
              <Link className="hero-cta" href="/cuentos">
                Leer los cuentos →
              </Link>
              <Link className="hero-cta-ghost" href="/sobre-mi">
                Sobre mí
              </Link>
            </div>
            <div className="hero-meta">
              <span>Cuentos</span>
              <span>Escritos</span>
              <span>Club de lectura</span>
            </div>
          </div>
          <div className="hero-visual">
            <ImageSlot src={imageSrc} alt={imageAlt} placeholder={imageAlt} radius={6} priority />
          </div>
        </div>
      </div>
    </section>
  );
}
