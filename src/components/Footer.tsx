const SOCIAL_LINKS = [
  { href: "https://www.instagram.com/", label: "Instagram" },
  { href: "https://www.goodreads.com/", label: "Goodreads" },
  { href: "https://letterboxd.com/", label: "Letterboxd" },
  { href: "mailto:hola@girasun.com", label: "Email" },
];

export function Footer({ year = String(new Date().getFullYear()) }: { year?: string }) {
  return (
    <footer className="footer">
      <div className="footer-inner container">
        <div className="footer-sig">
          Con cariño, GiraSun.
          <small>Diario personal · MMXXVI</small>
        </div>
        <div className="footer-social">
          {SOCIAL_LINKS.map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noreferrer">
              {s.label}
            </a>
          ))}
        </div>
      </div>
      <div className="container" style={{ marginTop: 24 }}>
        <div className="footer-copy">
          © {year} GiraSun. Todos los textos pertenecen a su autora. Las palabras crecen mejor a la
          luz.
        </div>
      </div>
    </footer>
  );
}
