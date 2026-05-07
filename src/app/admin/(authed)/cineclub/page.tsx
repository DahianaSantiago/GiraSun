import Link from "next/link";
import { AddFilmForm } from "@/components/admin/AddFilmForm";
import { getFilms } from "@/lib/content";

export const dynamic = "force-dynamic";
export const metadata = { title: "CineClub" };

export default function AdminCineClubPage() {
  const films = getFilms();

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div className="admin-page-eyebrow">Contenido · CineClub</div>
        <h1 className="admin-page-title">
          Cine<em>Club</em>
        </h1>
        <p className="admin-page-lede">
          Agrega una sesión pasada. Cada entrada es un commit a{" "}
          <code className="mono-cell">/content/cineclub/</code> y Vercel reconstruye solo.
        </p>
      </header>

      <section className="admin-page-section" style={{ marginTop: 0, borderTop: 0, paddingTop: 0 }}>
        <h2 className="admin-page-h2">Agregar sesión</h2>
        <AddFilmForm existingCount={films.length} />
      </section>

      <section className="admin-page-section">
        <h2 className="admin-page-h2">Sesiones del archivo</h2>
        {films.length === 0 ? (
          <p style={{ color: "var(--ink-muted)", fontStyle: "italic" }}>
            Aún no hay sesiones registradas.
          </p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Núm.</th>
                <th>Título</th>
                <th>Director</th>
                <th>Año</th>
                <th>Sesión</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {films.map((f) => (
                <tr key={f.slug}>
                  <td className="mono-cell">{f.num}</td>
                  <td>{f.title}</td>
                  <td className="muted-cell">{f.director}</td>
                  <td className="mono-cell">{f.year}</td>
                  <td className="muted-cell">{f.date}</td>
                  <td className="actions-cell">
                    <Link href={`/admin/cineclub/${f.slug}/edit`}>Editar</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
