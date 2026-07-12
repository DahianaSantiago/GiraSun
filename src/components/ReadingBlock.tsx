import Link from "next/link";
import { getBooks, STATUS_LABELS, type Book } from "@/lib/content";

const DEFAULT_INTRO = {
  eyebrow: "Club De Lectura",
  title: <>Lo que hemos leído en el CDL.</>,
  body: "Cada 15 días nos reunimos en un cafe de Medellín para leer, comer pizza, tomar cafe y ser felices. Esto es lo que hemos leído en el club.",
  pill: "Actualizado el 3 mayo",
};

export async function ReadingBlock({
  books,
  intro = DEFAULT_INTRO,
  background = "var(--bg-soft)",
  viewAllHref,
}: {
  books?: Book[];
  intro?: typeof DEFAULT_INTRO;
  background?: string;
  viewAllHref?: string;
}) {
  const list = books ?? (await getBooks());
  return (
    <section className="reading-block" style={{ background }}>
      <div className="container">
        <div className="reading-grid">
          <div className="reading-side">
            <div className="section-eyebrow">{intro.eyebrow}</div>
            <h3>{intro.title}</h3>
            <p>{intro.body}</p>
            <div className="pill">{intro.pill}</div>
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
