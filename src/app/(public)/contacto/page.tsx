import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Escríbeme a hola@girasun.com. Leo todos los correos. Contesto los que puedo, despacio.",
  openGraph: {
    title: "Contacto · GiraSun",
    description: "Escríbeme a hola@girasun.com.",
    url: "/contacto",
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
            Si algo de lo que leíste te movilizó, te atravesó o simplemente quieres saludar me
            puedes escribir con toda confianza. Sin miedo. Siempre que quieras ser leída o leído acá
            estaré para hacerlo.
          </p>
        </div>
      </section>

      <section className="section section-tight" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="long-prose">
            <p>La forma más fácil es por correo.</p>
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
            <h2>¿De qué me puedes escribir?</h2>
            <p>
              La verdad, de cualquier cosa que te haya pasado al leer algo de este blog, también si
              tienes un libro recomendado para el club de lectura o si quieres proponer una peli
              para el CineClub.
            </p>
            <h2>Otros lugares</h2>
            <p>
              Estoy en Instagram, en Goodreads, y en Letterboxd para el archivo del CineClub con
              reseñas super nadaqueverientas. Los enlaces están al final de página.
            </p>
            <h2>Newsletter</h2>
            <p>
              Si te gustaría recibir una carta (poema, texto, reflexión o lo que sea que salga ese
              mes) te puedes suscribir en el formulario de la página principal. TQM.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
