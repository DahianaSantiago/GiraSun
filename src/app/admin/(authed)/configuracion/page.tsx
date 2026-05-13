import { listFirestoreAdmins } from "@/lib/firebase/admins";
import { AdminConfig } from "@/components/admin/AdminConfig";

export const dynamic = "force-dynamic";
export const metadata = { title: "Configuración · Admin" };

const envAdmins = (): string[] => {
  const raw = process.env.ADMIN_EMAILS ?? "";
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
};

export default async function ConfiguracionPage() {
  const [firestoreAdmins, env] = await Promise.all([
    listFirestoreAdmins(),
    Promise.resolve(envAdmins()),
  ]);

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div className="admin-page-eyebrow">Admin · Configuración</div>
        <h1 className="admin-page-title">Configuración</h1>
        <p className="admin-page-lede">
          Gestiona qué emails tienen acceso al panel de administración.
        </p>
      </header>

      <AdminConfig firestoreAdmins={firestoreAdmins} envAdmins={env} />
    </div>
  );
}
