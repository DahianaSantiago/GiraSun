import type { Metadata } from "next";
import { ImageSlot } from "@/components/ImageSlot";
import { getAboutPage } from "@/lib/content";

export const metadata: Metadata = {
  title: "Sobre mí",
  description:
    "Soy Dahiana Santiago. Escribo desde una mesa que mira al sur. Tengo más cuadernos que paciencia, y casi siempre un libro a medias.",
  openGraph: {
    title: "Sobre mí · GiraSun",
    description: "Escribo desde una mesa que mira al sur. Casi siempre un libro a medias.",
    url: "/sobre-mi",
  },
};

export default async function SobreMiPage() {
  const about = await getAboutPage();

  return (
    <>
      <section className="page-head">
        <div className="container">
          <div className="ornament">
            <span className="line" />
            Sobre quien escribe
            <span className="line" />
          </div>
          {/* El título viene del admin y admite énfasis con <em>, igual que el
              titleHTML de los posts (contenido de confianza del Admin SDK). */}
          <h1 dangerouslySetInnerHTML={{ __html: about.title }} />
          <p className="lede">{about.lede}</p>
        </div>
      </section>

      <section className="section section-tight" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="about-strip">
            <div className="photo">
              <ImageSlot
                src={about.photoSrc || undefined}
                alt={about.photoAlt}
                placeholder="Retrato"
                style={{ position: "absolute", inset: 0 }}
              />
            </div>
            <div>
              {/* HTML generado por TipTap en el admin — mismo mecanismo de
                  confianza que el titleHTML de los posts (solo escribe el
                  Admin SDK tras requireAdmin). */}
              <div className="long-prose" dangerouslySetInnerHTML={{ __html: about.bodyHTML }} />
              <div className="sig">— GiraSun</div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
