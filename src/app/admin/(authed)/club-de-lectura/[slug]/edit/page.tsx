import Link from "next/link";
import { notFound } from "next/navigation";
import { EditBookForm } from "@/components/admin/EditBookForm";
import { findBookBySlug } from "@/lib/content";

export const dynamic = "force-dynamic";
export const metadata = { title: "Editar libro" };

type Params = Promise<{ slug: string }>;

export default async function EditBookPage({ params }: { params: Params }) {
  const { slug } = await params;
  const book = findBookBySlug(slug);
  if (!book) notFound();

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <Link
          href="/admin/club-de-lectura"
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
          ← Volver al estante
        </Link>
        <div className="admin-page-eyebrow">Club de lectura · Editar</div>
        <h1 className="admin-page-title">{book.title}</h1>
        <p className="admin-page-lede">
          Slug del archivo: <code className="mono-cell">{slug}.mdx</code>
        </p>
      </header>

      <section className="admin-page-section" style={{ marginTop: 0, borderTop: 0, paddingTop: 0 }}>
        <EditBookForm slug={slug} initial={book} />
      </section>
    </div>
  );
}
