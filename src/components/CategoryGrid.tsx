import Link from "next/link";
import Image from "next/image";
import { SectionHead } from "./SectionHead";

// Una sola foto compartida; cada tarjeta muestra un encuadre distinto
// vía la clase cat-crop-* (object-position / zoom en globals.css).
const CARDS = [
  { href: "/cuentos", title: "Cuentos", crop: "cat-crop-cuentos" },
  { href: "/escritos", title: "Escritos", crop: "cat-crop-escritos" },
  { href: "/club-de-lectura", title: "Clubs", crop: "cat-crop-clubs" },
];

export function CategoryGrid() {
  return (
    <section className="section">
      <div className="container">
        <SectionHead
          eyebrow="Tres lugares"
          titleHTML="Donde guardo lo que <em>escribo</em>, lo que <em>leo</em> y las <em>pelis</em> que me veo."
          link={{ href: "/cuentos", label: "Ver todo" }}
        />
        <div className="cat-grid">
          {CARDS.map((c) => (
            <Link key={c.title} href={c.href} className="cat-card">
              <Image
                src="/images/girasol.jpg"
                alt=""
                fill
                sizes="(min-width: 900px) 33vw, 100vw"
                className={`cat-photo ${c.crop}`}
              />
              <div className="cat-veil" aria-hidden="true" />
              <h3 className="cat-title">{c.title}</h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
