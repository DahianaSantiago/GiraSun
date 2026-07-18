import Link from "next/link";
import { getBooks, getBooksLastUpdated, STATUS_LABELS, type Book } from "@/lib/content";

const DEFAULT_INTRO = {
  eyebrow: "Club De Lectura",
  title: <>Lo que hemos leído en el CDL.</>,
  body: "Cada 15 días nos reunimos en un cafe de Medellín para leer, comer pizza, tomar cafe y ser felices. Esto es lo que hemos leído en el club.",
  pill: "Actualizado el 3 mayo",
};

const MESES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

function formatLastUpdated(date: Date): string {
  return `Actualizado el ${date.getDate()} de ${MESES[date.getMonth()]} del ${date.getFullYear()}`;
}

export async function ReadingBlock({
  books,
  intro,
  background = "var(--bg-card-warm)",
  viewAllHref,
}: {
  books?: Book[];
  intro?: typeof DEFAULT_INTRO;
  background?: string;
  viewAllHref?: string;
}) {
  const [list, lastUpdated] = await Promise.all([
    books ? Promise.resolve(books) : getBooks(),
    intro ? Promise.resolve(undefined) : getBooksLastUpdated(),
  ]);
  const resolvedIntro =
    intro ??
    (lastUpdated ? { ...DEFAULT_INTRO, pill: formatLastUpdated(lastUpdated) } : DEFAULT_INTRO);

  return (
    <section className="reading-block" style={{ background }}>
      <div className="container">
        <div className="reading-grid">
          <div className="reading-side">
            <div className="section-eyebrow">{resolvedIntro.eyebrow}</div>
            <h3>{resolvedIntro.title}</h3>
            <p>{resolvedIntro.body}</p>
            <div className="pill">{resolvedIntro.pill}</div>
          </div>
          <div className="reading-list-col">
            <div className="reading-list">
              {list.map((b) => (
                <article className="reading-row" key={b.num}>
                  <div className="num">{b.num}</div>
                  <div className={`cover ${b.cover}`}>{b.title.slice(0, 18)}</div>
                  <div className="info">
                    <h4 className="title">{b.title}</h4>
                    <div className="author">{b.author}</div>
                  </div>
                  <div className={`status ${b.status}`}>{STATUS_LABELS[b.status]}</div>
                </article>
              ))}
            </div>
            {viewAllHref ? (
              <Link href={viewAllHref} className="reading-view-all">
                Ver todos los libros
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
