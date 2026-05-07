import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostDetail } from "@/components/PostDetail";
import { PostBody } from "@/components/mdx/PostBody";
import { findPost, getPostsByType } from "@/lib/content";
import { postArticleSchema, postUrl } from "@/lib/seo";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return getPostsByType("escrito").map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = findPost("escrito", slug);
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

export default async function EscritoDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = findPost("escrito", slug);
  if (!post) notFound();

  const all = getPostsByType("escrito");
  const idx = all.findIndex((p) => p.slug === post.slug);
  const nextPost = idx >= 0 && idx < all.length - 1 ? all[idx + 1] : undefined;
  const next = nextPost ? { href: `/escritos/${nextPost.slug}`, title: nextPost.title } : undefined;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(postArticleSchema(post)) }}
      />
      <PostDetail post={post} body={<PostBody source={post.body} />} next={next} />
    </>
  );
}
