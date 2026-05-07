"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutLink } from "./SignOutLink";

const SECTIONS = [
  {
    label: "Contenido",
    items: [
      { href: "/admin", label: "Resumen" },
      { href: "/admin/cuentos", label: "Cuentos" },
      { href: "/admin/escritos", label: "Escritos" },
      { href: "/admin/club-de-lectura", label: "Club de lectura" },
      { href: "/admin/cineclub", label: "CineClub" },
    ],
  },
  {
    label: "Lectoras",
    items: [
      { href: "/admin/comentarios", label: "Comentarios" },
      { href: "/admin/suscriptores", label: "Suscriptores" },
      { href: "/admin/newsletter", label: "Newsletter" },
    ],
  },
  {
    label: "Sistema",
    items: [{ href: "/admin/configuracion", label: "Configuración" }],
  },
];

const isActive = (href: string, current: string): boolean => {
  if (href === "/admin") return current === "/admin";
  return current === href || current.startsWith(`${href}/`);
};

export function AdminSidebar({
  user,
}: {
  user: { email: string; name: string | null; picture: string | null };
}) {
  const pathname = usePathname() ?? "/admin";

  return (
    <aside className="admin-sidebar">
      <Link href="/admin" className="admin-brand" aria-label="Panel admin · Inicio">
        <span className="brand-mark">GiraSun</span>
        <span className="brand-dot" />
        <small>panel</small>
      </Link>

      <nav className="admin-nav" aria-label="Navegación admin">
        {SECTIONS.map((section) => (
          <div key={section.label} className="admin-nav-section">
            <div className="admin-nav-eyebrow">{section.label}</div>
            <ul>
              {section.items.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={isActive(item.href, pathname) ? "active" : ""}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="admin-account">
        <div className="admin-account-name">
          {user.name ?? user.email.split("@")[0]}
          <small>{user.email}</small>
        </div>
        <SignOutLink />
      </div>
    </aside>
  );
}
