import type { Metadata } from "next";
import { PostIndex } from "@/components/PostIndex";
import { getPostsByType } from "@/lib/content";

export const metadata: Metadata = {
  title: "Cuento cuentos",
  description:
    "Mundos pequeños, personajes que respiran, finales que se quedan. Cuentos breves de Dahiana Santiago.",
  openGraph: {
    title: "Cuento cuentos · GiraSun",
    description: "Mundos pequeños, personajes que respiran, finales que se quedan.",
    url: "https://girasun.com/cuentos",
  },
};

export default function CuentosIndexPage() {
  const posts = getPostsByType("cuento");
  return (
    <PostIndex
      posts={posts}
      decoPlaceholder="Foto decorativa — cuentos"
      pageHead={{
        eyebrow: "Archivo de cuentos",
        titleHTML: "Cuento <em>cuentos</em>",
        lede: "Mundos pequeños, personajes que respiran, finales que se quedan. Lee despacio.",
      }}
    />
  );
}
