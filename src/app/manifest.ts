// Web app manifest — what Android/Chrome read for "Añadir a pantalla de inicio"
// and for the title in the share sheet. iOS gets the same name from the
// appleWebApp metadata in layout.tsx.
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GiraSun",
    short_name: "GiraSun",
    description:
      "Diario literario de Dahiana Santiago — cuentos, escritos, club de lectura y CineClub.",
    lang: "es",
    start_url: "/",
    display: "standalone",
    background_color: "#fbf6e8",
    theme_color: "#fbf6e8",
    icons: [
      // Both are generated routes: icon.tsx (32px gold dot) and apple-icon.tsx
      // (180px sunflower). Chrome picks whichever fits the surface.
      { src: "/icon", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
