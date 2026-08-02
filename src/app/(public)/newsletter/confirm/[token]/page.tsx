// Legacy double opt-in landing page. Subscribing is single opt-in now, so no new
// confirm links are ever minted — this route only exists so the confirm emails
// sent before the switch still land somewhere sensible. Safe to delete once
// those are stale.
import type { Metadata } from "next";
import Link from "next/link";
import { confirmSubscriber } from "@/lib/newsletter";
import { sendWelcomeEmailFor } from "@/app/actions/newsletter";
import { getServerDb } from "@/lib/firebase/server";

export const metadata: Metadata = {
  title: "Confirmar suscripción",
  robots: { index: false, follow: false },
};

type Params = Promise<{ token: string }>;

const Shell = ({
  children,
  centered = true,
}: {
  children: React.ReactNode;
  centered?: boolean;
}) => (
  <section className="section">
    <div
      className="container"
      style={{
        textAlign: centered ? "center" : "left",
        maxWidth: 640,
        padding: "60px 48px 80px",
      }}
    >
      {children}
    </div>
  </section>
);

export default async function ConfirmPage({ params }: { params: Params }) {
  const { token } = await params;
  const result = await confirmSubscriber(token);

  if (!result.ok) {
    if (result.reason === "already-confirmed") {
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
            Ya estás dentro
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
            Este correo <em style={{ color: "var(--accent-ink)" }}>ya estaba confirmado</em>.
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
            Nos escribiremos pronto. ✿
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
          Este enlace <em style={{ color: "var(--accent-ink)" }}>ya no funciona</em>.
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
          Tal vez ya lo usaste, o tal vez te suscribiste de nuevo y este enlace quedó atrás. Vuelve
          a la página principal y suscríbete — ahora es solo dejar tu correo, sin pasos extra.
        </p>
        <Link className="hero-cta" href="/#newsletter">
          Suscribirme de nuevo →
        </Link>
      </Shell>
    );
  }

  // Successfully confirmed — fetch the unsubscribe token to include in the welcome email.
  const db = getServerDb();
  const id = result.email;
  const docSnap = await db.collection("subscribers").doc(id).get();
  const unsubToken = docSnap.exists ? (docSnap.data()?.unsubToken as string) : "";

  if (unsubToken) {
    await sendWelcomeEmailFor(result.email, unsubToken);
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
        Suscripción confirmada
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
        Gracias. <em style={{ color: "var(--accent-ink)" }}>Nos escribiremos pronto.</em>
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
        Te llegará una sola carta al mes — nunca antes. Mientras, hay cuentos esperándote.
      </p>
      <Link className="hero-cta" href="/cuentos">
        Leer los cuentos →
      </Link>
    </Shell>
  );
}
