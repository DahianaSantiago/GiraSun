import Link from "next/link";
import { listDrafts } from "@/lib/drafts";
import { getPostsByType } from "@/lib/content";

export const dynamic = "force-dynamic";
export const metadata = { title: "Escritos" };

const fmt = (ms: number): string => {
  if (!ms) return "";
  const d = new Date(ms);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
};

export default async function AdminEscritosPage() {
  const drafts = await listDrafts("escrito");
  const published = getPostsByType("escrito");

  const draftSlugs = new Set(drafts.filter((d) => d.status === "published").map((d) => d.slug));
  const orphanPublished = published.filter((p) => !draftSlugs.has(p.slug));

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div className="admin-page-eyebrow">Contenido · Escritos</div>
        <h1 className="admin-page-title">
          Escri<em>tos</em>
        </h1>
        <p className="admin-page-lede">
          Anotaciones del cuaderno. Borradores aquí, publicados van al repo y al sitio público.
        </p>
        <Link href="/admin/escritos/new" className="post-editor-btn" style={{ marginTop: 18 }}>
          + Nuevo escrito
        </Link>
      </header>

      <section className="admin-page-section" style={{ marginTop: 0, borderTop: 0, paddingTop: 0 }}>
        <h2 className="admin-page-h2">Borradores y publicados</h2>
        {drafts.length === 0 ? (
          <p style={{ color: "var(--ink-muted)", fontStyle: "italic" }}>No hay borradores aún.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Slug</th>
                <th>Estado</th>
                <th>Editado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {drafts.map((d) => (
                <tr key={d.id}>
                  <td>{d.title}</td>
                  <td className="mono-cell">{d.slug}</td>
                  <td>
                    <span className={`status-pill ${d.status}`}>
                      {d.status === "published" ? "Publicado" : "Borrador"}
                    </span>
                  </td>
                  <td className="muted-cell">{fmt(d.updatedAt)}</td>
                  <td className="actions-cell">
                    <Link href={`/admin/escritos/${d.id}/edit`}>Editar</Link>
                    {d.status === "published" ? (
                      <a href={`/escritos/${d.slug}`} target="_blank" rel="noreferrer">
                        Ver
                      </a>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {orphanPublished.length > 0 ? (
        <section className="admin-page-section">
          <h2 className="admin-page-h2">Publicados sin borrador en el panel</h2>
          <ul className="admin-orphan-list">
            {orphanPublished.map((p) => (
              <li key={p.slug}>
                <span>{p.title}</span>{" "}
                <a href={`/escritos/${p.slug}`} target="_blank" rel="noreferrer">
                  /escritos/{p.slug}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
