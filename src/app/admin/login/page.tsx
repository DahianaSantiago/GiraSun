import { redirect } from "next/navigation";
import { AdminSignInButton } from "@/components/admin/AdminSignInButton";
import { getSession } from "@/lib/firebase/session";
import { isAdmin } from "@/lib/firebase/admins";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Entrar al panel",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{ from?: string; error?: string }>;

export default async function AdminLoginPage({ searchParams }: { searchParams: SearchParams }) {
  const { from = "/admin", error } = await searchParams;

  // If the user is already signed in AND admin, just bounce them in.
  const session = await getSession();
  if (session) {
    const allowed = await isAdmin(session.email);
    if (allowed) {
      redirect(from);
    }
  }

  const errorMessage =
    error === "not-admin"
      ? "Esta cuenta no está en la lista de administradores. Pídeme acceso si crees que debería estar."
      : null;

  return (
    <div className="admin-login">
      <div className="admin-login-card">
        <div className="admin-brand-stack">
          <span className="brand-mark">GiraSun</span>
          <span className="brand-dot" />
        </div>
        <div
          style={{
            fontSize: 11,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: "var(--ink-muted)",
            margin: "20px 0 14px",
          }}
        >
          Panel privado
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 400,
            fontSize: 36,
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            margin: "0 0 14px",
          }}
        >
          Entra para <em style={{ color: "var(--accent-ink)" }}>seguir escribiendo</em>.
        </h1>
        <p
          style={{
            fontSize: 14,
            lineHeight: 1.6,
            color: "var(--ink-soft)",
            margin: "0 0 28px",
          }}
        >
          Solo cuentas en la lista de administradores pueden entrar. Inicia sesión con la cuenta de
          Google asociada a tu correo.
        </p>

        {errorMessage ? (
          <div className="admin-login-error" role="alert">
            {errorMessage}
          </div>
        ) : null}

        <AdminSignInButton from={from} />
      </div>
    </div>
  );
}
