import Link from "next/link";
import { AddBookForm } from "@/components/admin/AddBookForm";
import { getBooks, STATUS_LABELS } from "@/lib/content";

export const dynamic = "force-dynamic";
export const metadata = { title: "Club de lectura" };

export default function AdminClubPage() {
  const books = getBooks();

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div className="admin-page-eyebrow">Contenido · Club de lectura</div>
        <h1 className="admin-page-title">
          Club de <em>lectura</em>
        </h1>
        <p className="admin-page-lede">
          Agrega un libro al estante. Cada entrada es un commit a{" "}
          <code className="mono-cell">/content/club-de-lectura/</code> y Vercel reconstruye solo.
        </p>
      </header>

      <section className="admin-page-section" style={{ marginTop: 0, borderTop: 0, paddingTop: 0 }}>
        <h2 className="admin-page-h2">Agregar libro</h2>
        <AddBookForm existingCount={books.length} />
      </section>

      <section className="admin-page-section">
        <h2 className="admin-page-h2">Estante actual</h2>
        {books.length === 0 ? (
          <p style={{ color: "var(--ink-muted)", fontStyle: "italic" }}>Estante vacío.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Núm.</th>
                <th>Título</th>
                <th>Autor</th>
                <th>Estado</th>
                <th>Cover</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {books.map((b) => (
                <tr key={b.slug}>
                  <td className="mono-cell">{b.num}</td>
                  <td>{b.title}</td>
                  <td className="muted-cell">{b.author}</td>
                  <td>
                    <span className={`status-pill ${b.status}`}>{STATUS_LABELS[b.status]}</span>
                  </td>
                  <td className="muted-cell">{b.cover}</td>
                  <td className="actions-cell">
                    <Link href={`/admin/club-de-lectura/${b.slug}/edit`}>Editar</Link>
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
