import Link from "next/link";
import { getServerDb } from "@/lib/firebase/server";
import { getPostsByType, getBooks, getFilms } from "@/lib/content";
import { getSession } from "@/lib/firebase/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Resumen" };

async function counts() {
  const db = getServerDb();
  const [pendingComments, totalComments, confirmedSubs, pendingSubs] = await Promise.all([
    db.collection("comments").where("hidden", "==", true).count().get(),
    db.collection("comments").count().get(),
    db.collection("subscribers").where("status", "==", "confirmed").count().get(),
    db.collection("subscribers").where("status", "==", "pending").count().get(),
  ]);

  const [cuentos, escritos, books, films] = await Promise.all([
    getPostsByType("cuento"),
    getPostsByType("escrito"),
    getBooks(),
    getFilms(),
  ]);

  return {
    cuentos: cuentos.length,
    escritos: escritos.length,
    books: books.length,
    films: films.length,
    comments: totalComments.data().count,
    hiddenComments: pendingComments.data().count,
    subscribers: confirmedSubs.data().count,
    pendingSubs: pendingSubs.data().count,
  };
}

const Card = ({
  label,
  value,
  hint,
  href,
}: {
  label: string;
  value: number | string;
  hint?: string;
  href?: string;
}) => {
  const inner = (
    <div className="admin-stat-card">
      <div className="admin-stat-label">{label}</div>
      <div className="admin-stat-value">{value}</div>
      {hint ? <div className="admin-stat-hint">{hint}</div> : null}
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
};

export default async function AdminDashboardPage() {
  const session = await getSession();
  const data = await counts();
  const firstName = session?.name?.split(/\s+/)[0] ?? "tú";

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div className="admin-page-eyebrow">Panel · Resumen</div>
        <h1 className="admin-page-title">
          Bienvenida, <em>{firstName}</em>.
        </h1>
        <p className="admin-page-lede">
          Una mirada rápida a lo que hay en GiraSun ahora mismo. Cada tarjeta abre la sección
          correspondiente.
        </p>
      </header>

      <section className="admin-stat-grid">
        <Card label="Cuentos publicados" value={data.cuentos} href="/admin/cuentos" />
        <Card label="Escritos publicados" value={data.escritos} href="/admin/escritos" />
        <Card label="Libros en el club" value={data.books} href="/admin/club-de-lectura" />
        <Card label="Sesiones de CineClub" value={data.films} href="/admin/cineclub" />
        <Card
          label="Comentarios"
          value={data.comments}
          hint={data.hiddenComments > 0 ? `${data.hiddenComments} ocultos` : "todos visibles"}
          href="/admin/comentarios"
        />
        <Card
          label="Suscriptores"
          value={data.subscribers}
          hint={data.pendingSubs > 0 ? `${data.pendingSubs} sin confirmar` : "todos confirmados"}
          href="/admin/suscriptores"
        />
      </section>

      <section className="admin-page-section">
        <div className="admin-page-eyebrow">Próximamente</div>
        <h2 className="admin-page-h2">Siguientes pasos</h2>
        <ul className="admin-todo-list">
          <li className="done" style={{ opacity: 0.6, textDecoration: "line-through" }}>
            <strong>Migración a Firestore</strong> — Independencia total de GitHub para contenido.
            ¡Listo!
          </li>
          <li>
            <strong>
              Moderación de comentarios + bandeja de suscriptores + composición del newsletter
            </strong>{" "}
            — Phase 9.
          </li>
          <li>
            <strong>Configuración de admins</strong> — agregar/quitar emails de la allowlist. Phase
            9.
          </li>
        </ul>
      </section>
    </div>
  );
}
