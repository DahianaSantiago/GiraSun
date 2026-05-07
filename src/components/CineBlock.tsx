import { getFilms, type Film } from "@/lib/content";

const DEFAULT_INTRO = {
  eyebrow: "Sesión continua",
  title: (
    <>
      Lo que vimos juntos
      <br />
      en el CineClub.
    </>
  ),
  body: "Las películas se anuncian el día de la proyección. Aquí guardamos las que ya pasaron — un archivo de noches con luz parpadeante.",
  pill: "12 sesiones · desde 2025",
};

export function CineBlock({
  films,
  intro = DEFAULT_INTRO,
  background = "var(--bg)",
}: {
  films?: Film[];
  intro?: typeof DEFAULT_INTRO;
  background?: string;
}) {
  const list = films ?? getFilms();
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
            {list.map((f) => (
              <article className="reading-row" key={f.num}>
                <div className="num">{f.num}</div>
                <div className={`cover ${f.cover}`} style={{ fontStyle: "italic" }}>
                  {f.title.slice(0, 18)}
                </div>
                <div className="info">
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
        </div>
      </div>
    </section>
  );
}
