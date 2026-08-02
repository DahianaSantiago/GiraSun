import type { Metadata } from "next";
import { PostIndex } from "@/components/PostIndex";
import { getPostsByType } from "@/lib/content";
import { getLikeCounts } from "@/lib/firebase/likes";

export const metadata: Metadata = {
  title: "Cuento cuentos",
  description: "Cuentos breves de Dahiana Santiago.",
  openGraph: {
    title: "Cuento cuentos · GiraSun",
    description: "Cuentos breves de Dahiana Santiago.",
    url: "https://girasun.com/cuentos",
  },
};

export default async function CuentosPage() {
  const posts = await getPostsByType("cuento");
  const likeCounts = await getLikeCounts(
    "cuento",
    posts.map((p) => p.slug),
  );
  return (
    <PostIndex
      posts={posts}
      likeCounts={likeCounts}
      pageHead={{
        titleHTML: "Cuento <em>cuentos</em>",
      }}
    />
  );
}
