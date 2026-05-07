import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostDetail } from "@/components/PostDetail";
import { findPost, getPostsByType } from "@/lib/fixtures";
import { getPostBody } from "@/lib/post-bodies";
import { postArticleSchema, postUrl } from "@/lib/seo";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return getPostsByType("cuento").map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = findPost("cuento", slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      type: "article",
      title: `${post.title} · GiraSun`,
      description: post.excerpt,
      url: postUrl(post),
      publishedTime: post.date,
      authors: ["Dahiana Santiago"],
    },
  };
}

export default async function CuentoDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = findPost("cuento", slug);
  if (!post) notFound();

  const all = getPostsByType("cuento");
  const idx = all.findIndex((p) => p.slug === post.slug);
  const nextPost = idx >= 0 && idx < all.length - 1 ? all[idx + 1] : undefined;
  const next = nextPost ? { href: `/cuentos/${nextPost.slug}`, title: nextPost.title } : undefined;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(postArticleSchema(post)) }}
      />
      <PostDetail post={post} body={getPostBody(post.slug)} next={next} />
    </>
  );
}
