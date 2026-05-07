import Link from "next/link";
import { listDrafts, type Draft } from "@/lib/drafts";
import { getPostsByType, type Post } from "@/lib/content";

export const dynamic = "force-dynamic";
export const metadata = { title: "Escritos" };

const fmt = (ms: number): string => {
  if (!ms) return "";
  const d = new Date(ms);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
};

export default async function AdminEscritosPage() {
  let drafts: Draft[] = [];
  let published: Post[] = [];
  let loadError: string | null = null;
  try {
    drafts = await listDrafts("escrito");
    published = getPostsByType("escrito");
  } catch (err) {
    loadError = `${(err as Error).name}: ${(err as Error).message}\n\n${(err as Error).stack ?? ""}`;
    console.error("[admin/escritos] load failed", err);
  }

  if (loadError) {
    return (
      <div className="admin-page">
        <header className="admin-page-head">
          <div className="admin-page-eyebrow">Contenido · Escritos</div>
          <h1 className="admin-page-title">No pude cargar la lista</h1>
          <p className="admin-page-lede">
            Algo falló al leer los borradores o el contenido del repo. Detalle abajo.
          </p>
          <pre
            style={{
              marginTop: 24,
              padding: "16px 20px",
              background: "var(--bg-soft)",
              border: "1px solid var(--rule)",
              borderRadius: "var(--radius-s)",
              fontSize: 12,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {loadError}
          </pre>
        </header>
      </div>
    );
  }

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
          <h2 className="admin-page-h2">Publicados (desde el repo)</h2>
          <p style={{ color: "var(--ink-muted)", fontSize: 13, margin: "0 0 14px" }}>
            Estos escritos viven en <code className="mono-cell">/content/escritos/</code>. Click en
            Editar para abrirlos en el editor pre-llenados; al publicar se sobrescribe el archivo.
          </p>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Slug</th>
                <th>Fecha</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orphanPublished.map((p) => (
                <tr key={p.slug}>
                  <td>{p.title}</td>
                  <td className="mono-cell">{p.slug}</td>
                  <td className="muted-cell">{p.dateLabel}</td>
                  <td className="actions-cell">
                    <Link href={`/admin/escritos/from-mdx/${p.slug}`}>Editar</Link>
                    <a href={`/escritos/${p.slug}`} target="_blank" rel="noreferrer">
                      Ver
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}
    </div>
  );
}
