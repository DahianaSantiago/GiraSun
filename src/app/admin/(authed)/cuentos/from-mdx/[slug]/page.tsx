import { notFound } from "next/navigation";
import { PostEditor } from "@/components/admin/PostEditor";
import { findPost } from "@/lib/content";

export const dynamic = "force-dynamic";
export const metadata = { title: "Editar cuento (MDX)" };

type Params = Promise<{ slug: string }>;

export default async function EditCuentoFromMdxPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = findPost("cuento", slug);
  if (!post) notFound();

  return (
    <PostEditor
      type="cuento"
      initial={{
        // No Firestore draft id yet — PostEditor's first 'Guardar borrador'
        // creates one. From there, 'Publicar' overwrites the existing
        // /content/cuentos/{slug}.mdx.
        id: "",
        body: post.body,
        frontmatter: {
          type: "cuento",
          title: post.title,
          titleHTML: post.titleHTML,
          slug: post.slug,
          date: post.date,
          dateLabel: post.dateLabel,
          eyebrow: post.eyebrow,
          cat: post.cat,
          tag: post.tag,
          excerpt: post.excerpt,
          dek: post.dek,
          heroSrc: post.heroSrc,
          heroAlt: post.heroAlt,
          readingMinutes: post.readingMinutes,
          featured: post.featured,
          sections: post.sections,
        },
      }}
    />
  );
}
