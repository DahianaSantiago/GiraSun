import Link from "next/link";
import { SectionHead } from "./SectionHead";

const CARDS = [
  {
    href: "/cuentos",
    eyebrow: "01 — Narrativa",
    title: "Cuento cuentos",
    desc: "Hay cosas que me han sucedido que he logrado convertir en un cuento. Cuento como acto de transformación y soberanía de mi historia.",
    cta: "Leer los cuentos",
  },
  {
    href: "/escritos",
    eyebrow: "02 — Diario",
    title: "Escribo",
    desc: "Un diario abierto, conversaciones conmigo y con los otros. Lo que pasó, lo que sentí y lo que quise decir.",
    cta: "Entrar al diario",
  },
  {
    href: "/club-de-lectura",
    eyebrow: "LOS CLUBS",
    title: "Clubs",
    desc: "Hace 5 años me dio por crear un club de cine y un club de lectura. Acá pueden ver que hemos visto y que hemos leído.",
    cta: "Ver el archivo",
  },
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
              <div className="cat-content">
                <div className="cat-eyebrow">{c.eyebrow}</div>
                <h3>{c.title}</h3>
                <div className="rule" />
                <p>{c.desc}</p>
                <span className="cta">{c.cta}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
