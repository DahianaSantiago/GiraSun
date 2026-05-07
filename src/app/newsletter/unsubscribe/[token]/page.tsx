import type { Metadata } from "next";
import Link from "next/link";
import { unsubscribeByToken } from "@/lib/newsletter";

export const metadata: Metadata = {
  title: "Cancelar suscripción",
  robots: { index: false, follow: false },
};

type Params = Promise<{ token: string }>;

const Shell = ({ children }: { children: React.ReactNode }) => (
  <section className="section">
    <div
      className="container"
      style={{
        textAlign: "center",
        maxWidth: 640,
        padding: "60px 48px 80px",
      }}
    >
      {children}
    </div>
  </section>
);

export default async function UnsubscribePage({ params }: { params: Params }) {
  const { token } = await params;
  const result = await unsubscribeByToken(token);

  if (!result.ok) {
    return (
      <Shell>
        <div
          style={{
            fontSize: 11,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: "var(--ink-muted)",
            marginBottom: 14,
          }}
        >
          Enlace inválido
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 400,
            fontSize: "clamp(36px, 5vw, 56px)",
            letterSpacing: "-0.02em",
            margin: "0 0 18px",
          }}
        >
          Este enlace <em style={{ color: "var(--accent-ink)" }}>no es válido</em>.
        </h1>
        <p
          style={{
            fontSize: 16,
            lineHeight: 1.7,
            color: "var(--ink-soft)",
            margin: "0 auto 32px",
            maxWidth: "44ch",
          }}
        >
          Tal vez ya cancelaste antes, o copiaste el enlace mal. Si quieres asegurarte de no recibir
          más correos, escríbeme a{" "}
          <a
            href="mailto:hola@girasun.com"
            style={{ color: "var(--accent-ink)", borderBottom: "1px solid var(--accent)" }}
          >
            hola@girasun.com
          </a>
          .
        </p>
        <Link className="hero-cta" href="/">
          Volver al diario →
        </Link>
      </Shell>
    );
  }

  return (
    <Shell>
      <div
        style={{
          fontSize: 11,
          letterSpacing: "0.32em",
          textTransform: "uppercase",
          color: "var(--ink-muted)",
          marginBottom: 14,
        }}
      >
        Te has ido
      </div>
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 400,
          fontSize: "clamp(36px, 5vw, 56px)",
          letterSpacing: "-0.02em",
          margin: "0 0 18px",
        }}
      >
        Listo. <em style={{ color: "var(--accent-ink)" }}>No te volveré a escribir.</em>
      </h1>
      <p
        style={{
          fontFamily: "var(--font-display)",
          fontStyle: "italic",
          fontSize: 20,
          lineHeight: 1.5,
          color: "var(--ink-soft)",
          margin: "0 auto 32px",
          maxWidth: "44ch",
        }}
      >
        Si algún día vuelves, las puertas siguen abiertas. ✿
      </p>
      <Link className="hero-cta" href="/">
        Volver al diario →
      </Link>
    </Shell>
  );
}
