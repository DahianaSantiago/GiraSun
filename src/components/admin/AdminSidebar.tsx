"use client";

import { useState, useEffect, startTransition } from "react";
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
      { href: "/admin/sobre-mi", label: "Sobre mí" },
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

const MenuIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);

const CloseIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export function AdminSidebar({
  user,
}: {
  user: { email: string; name: string | null; picture: string | null };
}) {
  const pathname = usePathname() ?? "/admin";
  const [isOpen, setIsOpen] = useState(false);

  // Close the mobile drawer when the user navigates to a new route
  useEffect(() => {
    startTransition(() => {
      setIsOpen(false);
    });
  }, [pathname]);

  return (
    <aside className={`admin-sidebar ${isOpen ? "is-open" : ""}`}>
      <div className="admin-sidebar-header">
        <Link href="/admin" className="admin-brand" aria-label="Panel admin · Inicio">
          <span className="brand-mark">GiraSun</span>
          <span className="brand-dot" />
          <small>panel</small>
        </Link>
        <button
          className="admin-hamburger"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Alternar menú"
          aria-expanded={isOpen}
        >
          {isOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      <div className="admin-sidebar-content">
        <nav className="admin-nav" aria-label="Navegación admin">
          {SECTIONS.map((section) => (
            <div key={section.label} className="admin-nav-section">
              <div className="admin-nav-eyebrow">{section.label}</div>
              <ul>
                {section.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={isActive(item.href, pathname) ? "active" : ""}
                    >
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
      </div>
    </aside>
  );
}
