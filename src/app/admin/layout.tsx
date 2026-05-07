export const dynamic = "force-dynamic";

export const metadata = {
  title: { default: "Panel · GiraSun", template: "%s · Panel · GiraSun" },
  robots: { index: false, follow: false },
};

/**
 * Outer admin layout — applies to /admin/login as well as the authed
 * routes. Just gives a CSS hook for the admin chrome; the inner
 * (authed) layout adds the sidebar after running the session + admin
 * allowlist check.
 */
export default function AdminRootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="admin-shell">{children}</div>;
}
