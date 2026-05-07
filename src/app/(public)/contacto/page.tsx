import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Escríbeme a hola@girasun.com. Leo todos los correos. Contesto los que puedo, despacio.",
  openGraph: {
    title: "Contacto · GiraSun",
    description: "Escríbeme a hola@girasun.com.",
    url: "https://girasun.com/contacto",
  },
};

export default function ContactoPage() {
  return (
    <>
      <section className="page-head">
        <div className="container">
          <div className="ornament">
            <span className="line" />
            Para ti, para mí
            <span className="line" />
          </div>
          <h1>
            Escri<em>bir</em>nos
          </h1>
          <p className="lede">
            Si una palabra te detuvo, si te recordó a alguien, o si simplemente quieres saludar —
            aquí estoy.
          </p>
        </div>
      </section>

      <section className="section section-tight" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="long-prose">
            <p>
              La forma más segura de llegarme es por correo. Le contesto a casi todos — a veces
              tardo, pero llego.
            </p>
            <p>
              <strong style={{ fontWeight: 500 }}>Email · </strong>
              <a
                href="mailto:hola@girasun.com"
                style={{
                  color: "var(--accent-ink)",
                  borderBottom: "1px solid var(--accent)",
                  paddingBottom: 1,
                }}
              >
                hola@girasun.com
              </a>
            </p>
            <h2>¿De qué me podés escribir?</h2>
            <p>
              De cualquier cosa que te haya pasado al leer algo aquí. De un libro que te gustaría
              proponer al club. De una película para una próxima sesión del CineClub. De un encargo
              de escritura. De algo que te pasó hoy y que tenías que contarle a alguien.
            </p>
            <h2>Otros lugares</h2>
            <p>
              Estoy en Instagram (sin mucha frecuencia), en Goodreads (con la sinceridad rara que
              dan los libros), y en Letterboxd para el archivo del CineClub. Los enlaces están en el
              pie de página.
            </p>
            <h2>Newsletter</h2>
            <p>
              Si te gustaría recibir una sola carta al mes — sin spam, sin algoritmos — el
              formulario está en la página principal. Te puedes ir cuando quieras.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
