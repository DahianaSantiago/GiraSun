import Link from "next/link";
import { ImageSlot } from "./ImageSlot";
import { SectionHead } from "./SectionHead";

const QUILL_ICON = (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const PEN_ICON = (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z" />
  </svg>
);

const BOOK_ICON = (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const CARDS = [
  {
    href: "/cuentos",
    icon: QUILL_ICON,
    eyebrow: "01 — Narrativa",
    title: "Cuento cuentos",
    desc: "Escritos personales con narrativa de cuento. Mundos pequeños, personajes que respiran, finales que se quedan.",
    cta: "Leer los cuentos",
    placeholder: "Foto Cuentos",
  },
  {
    href: "/escritos",
    icon: PEN_ICON,
    eyebrow: "02 — Diario",
    title: "Escribo",
    desc: "Anotaciones del cuaderno. Lugar y tiempo reales. Un diario abierto: lo que pasó, lo que sentí, lo que quise decir.",
    cta: "Entrar al diario",
    placeholder: "Foto Escritos",
  },
  {
    href: "/club-de-lectura",
    icon: BOOK_ICON,
    eyebrow: "03 — Lecturas",
    title: "Club de lectura",
    desc: "Punto de encuentro y archivo. Lo que leemos, lo que leeremos, las conversaciones que dejamos al margen.",
    cta: "Ver el archivo",
    placeholder: "Foto Club",
  },
];

export function CategoryGrid() {
  return (
    <section className="section">
      <div className="container">
        <SectionHead
          eyebrow="Tres lugares"
          titleHTML="Donde guardo lo que <em>escribo</em>, lo que <em>leo</em>, y lo que invento."
          link={{ href: "/cuentos", label: "Ver todo" }}
        />
        <div className="cat-grid">
          {CARDS.map((c) => (
            <Link key={c.title} href={c.href} className="cat-card">
              <ImageSlot placeholder={c.placeholder} style={{ position: "absolute", inset: 0 }} />
              <div className="cat-bg-filter" />
              <div className="cat-content">
                <div className="ico">{c.icon}</div>
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
