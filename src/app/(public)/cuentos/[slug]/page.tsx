import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostDetail } from "@/components/PostDetail";
import { PostBody } from "@/components/mdx/PostBody";
import { CommentThread } from "@/components/CommentThread";
import { findPost, getPostsByType } from "@/lib/content";
import { postArticleSchema, postUrl } from "@/lib/seo";
import { getLikeCount, hasLiked } from "@/lib/firebase/likes";
import { getSession } from "@/lib/firebase/session";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const posts = await getPostsByType("cuento");
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = await findPost("cuento", slug);
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
  const post = await findPost("cuento", slug);
  if (!post) notFound();

  const all = await getPostsByType("cuento");
  const idx = all.findIndex((p) => p.slug === post.slug);
  const nextPost = idx >= 0 && idx < all.length - 1 ? all[idx + 1] : undefined;
  const next = nextPost ? { href: `/cuentos/${nextPost.slug}`, title: nextPost.title } : undefined;

  const session = await getSession();
  const [likeCount, initialLiked] = await Promise.all([
    getLikeCount("cuento", post.slug),
    session ? hasLiked("cuento", post.slug, session.uid) : Promise.resolve(false),
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(postArticleSchema(post)) }}
      />
      <PostDetail
        post={post}
        body={<PostBody source={post.body} />}
        next={next}
        likeCount={likeCount}
        initialLiked={initialLiked}
      />
      <CommentThread postType="cuento" postSlug={post.slug} />
    </>
  );
}
