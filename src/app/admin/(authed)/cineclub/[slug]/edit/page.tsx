import Link from "next/link";
import { notFound } from "next/navigation";
import { EditFilmForm } from "@/components/admin/EditFilmForm";
import { findFilmBySlug } from "@/lib/content";

export const dynamic = "force-dynamic";
export const metadata = { title: "Editar sesión" };

type Params = Promise<{ slug: string }>;

export default async function EditFilmPage({ params }: { params: Params }) {
  const { slug } = await params;
  const film = await findFilmBySlug(slug);
  if (!film) notFound();

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <Link
          href="/admin/cineclub"
          style={{
            fontSize: 12,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--ink-muted)",
            textDecoration: "none",
            display: "inline-block",
            marginBottom: 18,
          }}
        >
          ← Volver al archivo
        </Link>
        <div className="admin-page-eyebrow">CineClub · Editar</div>
        <h1 className="admin-page-title">{film.title}</h1>
        <p className="admin-page-lede">
          Slug del archivo: <code className="mono-cell">{slug}.mdx</code>
        </p>
      </header>

      <section className="admin-page-section" style={{ marginTop: 0, borderTop: 0, paddingTop: 0 }}>
        <EditFilmForm slug={slug} initial={film} />
      </section>
    </div>
  );
}
