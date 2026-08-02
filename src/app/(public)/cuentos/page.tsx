import type { Metadata } from "next";
import { PostIndex } from "@/components/PostIndex";
import { getPostsByType } from "@/lib/content";

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
  return (
    <PostIndex
      posts={posts}
      pageHead={{
        titleHTML: "Cuento <em>cuentos</em>",
      }}
    />
  );
}
