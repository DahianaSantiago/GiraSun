import Link from "next/link";
import { getFilms, getFilmsStats, type Film } from "@/lib/content";

const DEFAULT_INTRO = {
  eyebrow: "Cine Club",
  title: (
    <>
      Lo que hemos visto
      <br />
      en el CineClub.
    </>
  ),
  body: "Cada 15 días nos reunimos en un bar de Medellín llamado Pa' Bravo Yo (Cris, si lees esto, gracias por ser hogar para el CineClub): vemos pelis, tomamos pola y al final hacemos un círculo de palabra en torno a la peli.",
};

export async function CineBlock({
  films,
  intro,
  background = "var(--bg)",
  viewAllHref,
}: {
  films?: Film[];
  intro?: typeof DEFAULT_INTRO;
  background?: string;
  viewAllHref?: string;
}) {
  const [list, stats] = await Promise.all([
    films ? Promise.resolve(films) : getFilms(),
    getFilmsStats(),
  ]);
  const resolvedIntro = intro ?? DEFAULT_INTRO;
  const pill = `${stats.total} películas · ${stats.cycles} ciclos`;

  return (
    <section className="reading-block" style={{ background }}>
      <div className="container">
        <div className="reading-grid">
          <div className="reading-side">
            <div className="section-eyebrow">{resolvedIntro.eyebrow}</div>
            <h3>{resolvedIntro.title}</h3>
            <p>{resolvedIntro.body}</p>
            <div className="pill">{pill}</div>
          </div>
          <div className="reading-list-col">
            <div className="reading-list">
              {list.map((f) => (
                <article className="reading-row" key={f.num}>
                  <div className="num">{f.num}</div>
                  <div className={`cover ${f.cover}`} style={{ fontStyle: "italic" }}>
                    {f.title.slice(0, 18)}
                  </div>
                  <div className="info">
                    <div className="cycle-label">{f.ciclo}</div>
                    <h4 className="title">
                      {f.title}{" "}
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 13,
                          color: "var(--ink-muted)",
                          letterSpacing: "0.04em",
                        }}
                      >
                        · {f.year}
                      </span>
                    </h4>
                    <div className="author">
                      {f.director} — <em style={{ color: "var(--ink-muted)" }}>{f.note}</em>
                    </div>
                  </div>
                  <div className="status dated">{f.date}</div>
                </article>
              ))}
            </div>
            {viewAllHref ? (
              <Link href={viewAllHref} className="reading-view-all">
                Ver todas las películas
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
