import type { Metadata } from "next";
import { ImageSlot } from "@/components/ImageSlot";

export const metadata: Metadata = {
  title: "Sobre mí",
  description:
    "Soy Dahiana Santiago. Escribo desde una mesa que mira al sur. Tengo más cuadernos que paciencia, y casi siempre un libro a medias.",
  openGraph: {
    title: "Sobre mí · GiraSun",
    description: "Escribo desde una mesa que mira al sur. Casi siempre un libro a medias.",
    url: "https://girasun.com/sobre-mi",
  },
};

export default function SobreMiPage() {
  return (
    <>
      <section className="page-head">
        <div className="container">
          <div className="ornament">
            <span className="line" />
            Sobre quien escribe
            <span className="line" />
          </div>
          <h1>
            Sobre <em>mí</em>
          </h1>
          <p className="lede">
            Una mesa que mira al sur, dos plantas que sobreviven a mi olvido, y un cuaderno abierto
            casi siempre.
          </p>
        </div>
      </section>

      <section className="section section-tight" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="about-strip">
            <div className="photo">
              <ImageSlot placeholder="Retrato" style={{ position: "absolute", inset: 0 }} />
            </div>
            <div>
              <div className="long-prose">
                <p>
                  Soy Dahiana Santiago. Escribo desde Medellín, casi siempre por la mañana — la luz
                  de las seis se porta bien con las palabras. GiraSun nació como un cuaderno privado
                  y, sin querer, terminó siendo público. Lo dejo así porque hay frases que
                  encuentran su sitio cuando alguien las lee despacio.
                </p>
                <p>
                  Aquí guardo cuentos cortos, anotaciones del diario, lo que leemos en el club, y
                  las películas del CineClub que ya pasaron. No me interesan los algoritmos. Me
                  interesa que vuelvas alguna noche y encuentres algo que te haga compañía.
                </p>
                <h2>Qué vas a encontrar</h2>
                <p>
                  Cuentos personales con narrativa de cuento. Anotaciones del diario, sin edulcorar.
                  Una estantería viva con lo que leo y lo que vendrá. Y, una vez al mes, una carta
                  breve para quien la quiera abrir.
                </p>
                <h2>Cómo escribirme</h2>
                <p>
                  Si algo te detuvo, te tocó, o te recordó a alguien — escríbeme a{" "}
                  <a
                    href="mailto:hola@girasun.com"
                    style={{ color: "var(--accent-ink)", borderBottom: "1px solid var(--accent)" }}
                  >
                    hola@girasun.com
                  </a>
                  . Leo todos los correos. Contesto los que puedo, despacio.
                </p>
              </div>
              <div className="sig">— GiraSun</div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
