import Link from "next/link";
import { listDrafts, type Draft } from "@/lib/drafts";

export const dynamic = "force-dynamic";
export const metadata = { title: "Escritos" };

const fmt = (ms: number): string => {
  if (!ms) return "";
  const d = new Date(ms);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
};

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

const EyeIcon = () => (
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
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export default async function AdminEscritosPage() {
  let drafts: Draft[] = [];
  let loadError: string | null = null;
  try {
    drafts = await listDrafts("escrito");
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

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div className="admin-page-eyebrow">Contenido · Escritos</div>
        <h1 className="admin-page-title">
          Escri<em>tos</em>
        </h1>
        <p className="admin-page-lede">Anotaciones del cuaderno. Borradores y publicados.</p>
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
                <th>Editado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {drafts.map((d) => (
                <tr key={d.id}>
                  <td className="title-cell">
                    {d.title}
                    {d.status === "draft" ? (
                      <span className="status-pill draft" style={{ marginLeft: 8 }}>
                        Borrador
                      </span>
                    ) : null}
                  </td>
                  <td className="muted-cell">{fmt(d.updatedAt)}</td>
                  <td className="actions-cell">
                    <Link href={`/admin/escritos/${d.id}/edit`} className="icon-btn" title="Editar">
                      <EditIcon />
                    </Link>
                    {d.status === "published" ? (
                      <a
                        href={`/escritos/${d.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="icon-btn"
                        title="Ver publicado"
                      >
                        <EyeIcon />
                      </a>
                    ) : null}
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
