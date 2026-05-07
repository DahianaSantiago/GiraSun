import Link from "next/link";
import { listDrafts, type Draft } from "@/lib/drafts";
import { getPostsByType, type Post } from "@/lib/content";

export const dynamic = "force-dynamic";
export const metadata = { title: "Cuentos" };

const fmt = (ms: number): string => {
  if (!ms) return "";
  const d = new Date(ms);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
};

export default async function AdminCuentosPage() {
  let drafts: Draft[] = [];
  let published: Post[] = [];
  let loadError: string | null = null;
  try {
    drafts = await listDrafts("cuento");
    published = getPostsByType("cuento");
  } catch (err) {
    loadError = `${(err as Error).name}: ${(err as Error).message}\n\n${(err as Error).stack ?? ""}`;
    console.error("[admin/cuentos] load failed", err);
  }

  if (loadError) {
    return (
      <div className="admin-page">
        <header className="admin-page-head">
          <div className="admin-page-eyebrow">Contenido · Cuentos</div>
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
        <div className="admin-page-eyebrow">Contenido · Cuentos</div>
        <h1 className="admin-page-title">
          Cuento <em>cuentos</em>
        </h1>
        <p className="admin-page-lede">
          Tus borradores y cuentos publicados. Borrador = aún no en el repo. Publicado = ya está en
          GitHub y Vercel está reconstruyendo (o ya construyó).
        </p>
        <Link href="/admin/cuentos/new" className="post-editor-btn" style={{ marginTop: 18 }}>
          + Nuevo cuento
        </Link>
      </header>

      <section className="admin-page-section" style={{ marginTop: 0, borderTop: 0, paddingTop: 0 }}>
        <h2 className="admin-page-h2">Borradores y publicados</h2>
        {drafts.length === 0 ? (
          <p style={{ color: "var(--ink-muted)", fontStyle: "italic" }}>
            No hay borradores aún. Crea el primero arriba.
          </p>
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
                    <Link href={`/admin/cuentos/${d.id}/edit`}>Editar</Link>
                    {d.status === "published" ? (
                      <a href={`/cuentos/${d.slug}`} target="_blank" rel="noreferrer">
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
          <p style={{ color: "var(--ink-muted)", fontSize: 13, margin: "0 0 14px" }}>
            Estos cuentos viven en el repo (\\\`/content/cuentos/*.mdx\\\`) pero no tienen un
            borrador en el panel — fueron commiteados a mano. Si quieres editarlos desde aquí,
            tendrías que crear un nuevo borrador con el mismo slug.
          </p>
          <ul className="admin-orphan-list">
            {orphanPublished.map((p) => (
              <li key={p.slug}>
                <span>{p.title}</span>{" "}
                <a href={`/cuentos/${p.slug}`} target="_blank" rel="noreferrer">
                  /cuentos/{p.slug}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
