import Link from "next/link";
import { AddBookForm } from "@/components/admin/AddBookForm";
import { getBooks } from "@/lib/content";

export const dynamic = "force-dynamic";
export const metadata = { title: "Club de lectura" };

const EditIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

export default async function AdminClubPage() {
  const books = await getBooks();

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
                <th>Fecha</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {books.map((b) => (
                <tr key={b.slug}>
                  <td className="mono-cell">{b.num}</td>
                  <td className="title-cell">{b.title}</td>
                  <td className="muted-cell">{b.addedAt}</td>
                  <td className="actions-cell">
                    <Link
                      href={`/admin/club-de-lectura/${b.slug}/edit`}
                      className="icon-btn"
                      title="Editar"
                    >
                      <EditIcon />
                    </Link>
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
