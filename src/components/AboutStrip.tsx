import { ImageSlot } from "./ImageSlot";

export function AboutStrip() {
  return (
    <section className="section" id="about" style={{ paddingTop: 0 }}>
      <div className="container">
        <div className="about-strip">
          <div className="photo">
            <ImageSlot
              placeholder="Retrato (opcional)"
              style={{ position: "absolute", inset: 0 }}
            />
          </div>
          <div>
            <div className="section-eyebrow">Sobre quien escribe</div>
            <h3>
              Escribo desde una mesa que mira al sur. Tengo más cuadernos que paciencia, y casi
              siempre un libro a medias.
            </h3>
            <p>
              GiraSun es mi rincón quieto del internet — un cuaderno abierto donde guardo cuentos,
              anotaciones y lecturas. Si llegaste hasta aquí, gracias por leer despacio. Las
              palabras crecen mejor cuando alguien las mira con cuidado.
            </p>
            <div className="sig">— GiraSun</div>
          </div>
        </div>
      </div>
    </section>
  );
}
