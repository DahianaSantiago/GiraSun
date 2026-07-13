import type { Metadata } from "next";
import { CineBlock } from "@/components/CineBlock";

export const metadata: Metadata = {
  title: "CineClub",
  description:
    "Las películas que vimos juntos en el CineClub. Un archivo de noches con luz parpadeante.",
  openGraph: {
    title: "CineClub · GiraSun",
    description: "Sesión continua — un archivo de noches con luz parpadeante.",
    url: "https://girasun.com/cineclub",
  },
};

export default function CineClubPage() {
  return (
    <>
      <section className="page-head">
        <div className="container">
          <div className="ornament">
            <span className="line" />
            Sesión continua
            <span className="line" />
          </div>
          <h1>
            Cine<em>Club</em>
          </h1>
          <p className="lede">
            Las películas se anuncian el día de la proyección. Aquí guardamos las que ya pasaron —
            29 ciclos, noventa noches con luz parpadeante.
          </p>
        </div>
      </section>
      <CineBlock
        intro={{
          eyebrow: "Archivo del CineClub",
          title: <>Todas las sesiones,&nbsp;una a una.</>,
          body: "El registro de lo que pusimos. Sin reseñas largas — solo el título, el año, la noche y un apunte breve.",
        }}
      />
    </>
  );
}
