import type { Metadata } from "next";
import { PostIndex } from "@/components/PostIndex";
import { getPostsByType } from "@/lib/content";
import { getLikeCounts } from "@/lib/firebase/likes";

export const metadata: Metadata = {
  title: "Escritos",
  description:
    "Anotaciones del cuaderno. Lugar y tiempo reales. Un diario abierto: lo que pasó, lo que sentí, lo que quise decir.",
  openGraph: {
    title: "Escritos · GiraSun",
    description: "Anotaciones del cuaderno. Lugar y tiempo reales.",
    url: "https://girasun.com/escritos",
  },
};

export default async function EscritosIndexPage() {
  const posts = await getPostsByType("escrito");
  const likeCounts = await getLikeCounts(
    "escrito",
    posts.map((p) => p.slug),
  );
  return (
    <PostIndex
      posts={posts}
      likeCounts={likeCounts}
      pageHead={{
        eyebrow: "Archivo del diario",
        titleHTML: "Escri<em>tos</em>",
        lede: "Anotaciones, cartas que no envío, diario abierto. Lugar y tiempo reales.",
      }}
    />
  );
}
