import { BOOKS, STATUS_LABELS, type Book } from "@/lib/fixtures";

const DEFAULT_INTRO = {
  eyebrow: "Estantería viva",
  title: (
    <>
      Lo que estoy leyendo
      <br />
      ahora mismo.
    </>
  ),
  body: "Un registro honesto del club. Lo que tengo abierto sobre la mesa, lo que viene después, y las cosas que ya cerré pero siguen volviendo.",
  pill: "Actualizado el 3 mayo",
};

export function ReadingBlock({
  books = BOOKS,
  intro = DEFAULT_INTRO,
  background = "var(--bg-soft)",
}: {
  books?: Book[];
  intro?: typeof DEFAULT_INTRO;
  background?: string;
}) {
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
          <div className="reading-list">
            {books.map((b) => (
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
        </div>
      </div>
    </section>
  );
}
