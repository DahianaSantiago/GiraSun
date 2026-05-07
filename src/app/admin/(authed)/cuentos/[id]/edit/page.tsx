import { notFound } from "next/navigation";
import { PostEditor } from "@/components/admin/PostEditor";
import { getDraft } from "@/lib/drafts";

export const dynamic = "force-dynamic";
export const metadata = { title: "Editar cuento" };

type Params = Promise<{ id: string }>;

export default async function EditCuentoPage({ params }: { params: Params }) {
  const { id } = await params;
  const draft = await getDraft(id);
  if (!draft || draft.type !== "cuento") notFound();

  return (
    <PostEditor
      type="cuento"
      initial={{
        id: draft.id,
        body: draft.body,
        frontmatter: {
          type: "cuento",
          title: draft.title,
          titleHTML: draft.titleHTML,
          slug: draft.slug,
          date: draft.date,
          dateLabel: draft.dateLabel,
          eyebrow: draft.eyebrow,
          cat: draft.cat,
          tag: draft.tag,
          excerpt: draft.excerpt,
          dek: draft.dek,
          heroSrc: draft.heroSrc,
          heroAlt: draft.heroAlt,
          readingMinutes: draft.readingMinutes,
          featured: draft.featured,
          sections: draft.sections,
        },
      }}
    />
  );
}
