"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { AuthChip } from "./auth/AuthChip";

export type NavSection = "home" | "cuentos" | "escritos" | "club" | "cine" | "about" | "contacto";

const SEARCH_ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3-3" />
  </svg>
);

const LINKS: Array<{ href: string; label: string; key: NavSection }> = [
  { href: "/", label: "Inicio", key: "home" },
  { href: "/cuentos", label: "Cuentos", key: "cuentos" },
  { href: "/escritos", label: "Escritos", key: "escritos" },
  { href: "/club-de-lectura", label: "Club de lectura", key: "club" },
  { href: "/cineclub", label: "CineClub", key: "cine" },
  { href: "/sobre-mi", label: "Sobre mí", key: "about" },
  { href: "/contacto", label: "Contacto", key: "contacto" },
];

export function NavBar({ active }: { active?: NavSection }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 900) {
        setMobileOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <header className="nav">
      <div className="nav-inner container">
        <Link href="/" className="brand" aria-label="GiraSun · Inicio">
          <span className="brand-mark">GiraSun</span>
          <span className="brand-dot" />
        </Link>
        <nav className="nav-links" aria-label="Navegación principal">
          {LINKS.map((link) => (
            <Link key={link.key} href={link.href} className={active === link.key ? "active" : ""}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="nav-actions">
          <AuthChip />
          <button
            className="nav-hamburger"
            aria-label="Menú"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <span className={mobileOpen ? "open" : ""} />
          </button>
        </div>
      </div>
      {mobileOpen && (
        <nav className="nav-mobile">
          {LINKS.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              className={active === link.key ? "active" : ""}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
