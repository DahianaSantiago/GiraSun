import Link from "next/link";

export function SectionHead({
  eyebrow,
  title,
  titleHTML,
  link,
}: {
  eyebrow: string;
  /** Plain title — use \\\`titleHTML\\\` if you need an italic emphasis on a single word. */
  title?: string;
  titleHTML?: string;
  link?: { href: string; label: string };
}) {
  return (
    <div className="section-head">
      <div>
        <div className="section-eyebrow">{eyebrow}</div>
        {titleHTML ? (
          <h2 className="section-title" dangerouslySetInnerHTML={{ __html: titleHTML }} />
        ) : (
          <h2 className="section-title">{title}</h2>
        )}
      </div>
      {link ? (
        <Link className="section-link" href={link.href}>
          {link.label} →
        </Link>
      ) : null}
    </div>
  );
}
