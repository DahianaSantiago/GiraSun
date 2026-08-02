import type { Metadata } from "next";
import { ReadingBlock } from "@/components/ReadingBlock";

export const metadata: Metadata = {
  title: "Club de lectura",
  description:
    "Lo que estoy leyendo, lo que viene después, y los libros que ya cerré pero siguen volviendo.",
  openGraph: {
    title: "Club de lectura · GiraSun",
    description: "Estantería viva — lo que leemos, lo que leeremos, lo que dejamos al margen.",
    url: "/club-de-lectura",
  },
};

export default function ClubDeLecturaPage() {
  return (
    <>
      <section className="page-head">
        <div className="container">
          <div className="ornament">
            <span className="line" />
            Estantería viva
            <span className="line" />
          </div>
          <h1>
            Club de <em>lectura</em>
          </h1>
          <p className="lede">
            Punto de encuentro y archivo. Lo que tengo abierto sobre la mesa, lo que viene después,
            y las cosas que ya cerré pero siguen volviendo.
          </p>
        </div>
      </section>
      <ReadingBlock
        intro={{
          eyebrow: "Estantería completa",
          title: <>Todos los libros del club.</>,
          body: "Una pila honesta de lecturas — sin recomendaciones obligadas, sin estrellas. Solo lo que leemos despacio, juntas.",
          pill: "25 libros · actualizado este mes",
        }}
      />
    </>
  );
}
