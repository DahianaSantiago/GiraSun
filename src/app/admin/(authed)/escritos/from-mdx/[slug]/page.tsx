import { notFound } from "next/navigation";
import { PostEditor } from "@/components/admin/PostEditor";
import { findPost } from "@/lib/content";

export const dynamic = "force-dynamic";
export const metadata = { title: "Editar escrito (MDX)" };

type Params = Promise<{ slug: string }>;

export default async function EditEscritoFromMdxPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = findPost("escrito", slug);
  if (!post) notFound();

  return (
    <PostEditor
      type="escrito"
      initial={{
        id: "",
        body: post.body,
        frontmatter: {
          type: "escrito",
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
