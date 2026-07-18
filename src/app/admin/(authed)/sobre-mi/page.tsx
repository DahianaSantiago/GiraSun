import { AboutEditor } from "@/components/admin/AboutEditor";
import { getAboutHome, getAboutPage } from "@/lib/content";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sobre mí" };

export default async function AdminSobreMiPage() {
  const [home, page] = await Promise.all([getAboutHome(), getAboutPage()]);

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div className="admin-page-eyebrow">Contenido · Sobre mí</div>
        <h1 className="admin-page-title">
          Sobre <em>mí</em>
        </h1>
        <p className="admin-page-lede">
          Edita el bloque de la portada y la página completa de Sobre mí. Mientras no guardes, el
          sitio muestra el texto original.
        </p>
      </header>

      <AboutEditor home={home} page={page} />
    </div>
  );
}
