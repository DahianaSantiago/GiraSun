import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { getSession } from "@/lib/firebase/session";
import { isAdmin } from "@/lib/firebase/admins";

export const dynamic = "force-dynamic";

/**
 * Inner admin layout — runs the session + admin allowlist check before
 * rendering anything. Wraps in the sidebar shell for every page under
 * /admin/* except /admin/login (which lives outside this route group).
 */
export default async function AuthedAdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
  }

  const allowed = await isAdmin(session.email);
  if (!allowed) {
    redirect("/admin/login?error=not-admin");
  }

  return (
    <>
      <AdminSidebar user={session} />
      <div className="admin-main">{children}</div>
    </>
  );
}
