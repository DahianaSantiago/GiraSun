import { Body, Container, Head, Hr, Html, Link, Preview, Text } from "@react-email/components";

const linen = "#fbf6e8";
const ink = "#322c20";
const inkSoft = "#615a4a";
const accent = "#dba94a";

export type WelcomeEmailProps = {
  unsubscribeUrl: string;
};

export function WelcomeEmail({ unsubscribeUrl }: WelcomeEmailProps) {
  return (
    <Html lang="es">
      <Head />
      <Preview>Gracias. Nos escribiremos pronto. ✿</Preview>
      <Body
        style={{
          margin: 0,
          padding: 0,
          background: linen,
          fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
          color: ink,
        }}
      >
        <Container style={{ maxWidth: 540, margin: "0 auto", padding: "48px 24px 32px" }}>
          <Text
            style={{
              fontFamily: "Georgia, serif",
              fontSize: 26,
              fontWeight: 500,
              letterSpacing: "-0.01em",
              margin: 0,
            }}
          >
            Gira<span style={{ fontStyle: "italic", color: accent }}>Sun</span>
          </Text>

          <Hr
            style={{
              border: "none",
              borderTop: "1px solid rgba(50,44,32,0.12)",
              margin: "28px 0",
            }}
          />

          <Text
            style={{
              fontFamily: "Georgia, serif",
              fontStyle: "italic",
              fontSize: 28,
              lineHeight: 1.2,
              margin: "0 0 18px",
            }}
          >
            Gracias por confirmar.
          </Text>

          <Text style={{ fontSize: 15, lineHeight: 1.6, color: inkSoft, margin: "0 0 16px" }}>
            Te llegará una sola carta al mes, escrita en luna llena. Pensamientos sueltos, lo que
            estoy escribiendo, qué libros me están atravesando este mes. Sin algoritmos, sin
            urgencia.
          </Text>

          <Text style={{ fontSize: 15, lineHeight: 1.6, color: inkSoft, margin: "0 0 16px" }}>
            Mientras tanto, si quieres leer algo despacio, hay cuentos y escritos esperándote en
            <Link href="https://girasun.com/cuentos" style={{ color: accent, marginLeft: 4 }}>
              girasun.com/cuentos
            </Link>
            .
          </Text>

          <Hr
            style={{
              border: "none",
              borderTop: "1px solid rgba(50,44,32,0.12)",
              margin: "32px 0 18px",
            }}
          />

          <Text style={{ fontSize: 11, lineHeight: 1.6, color: inkSoft, margin: 0 }}>
            Te puedes ir cuando quieras —
            <Link href={unsubscribeUrl} style={{ color: accent, marginLeft: 4 }}>
              cancelar suscripción
            </Link>
            . El enlace funciona para siempre.
          </Text>

          <Text
            style={{
              fontFamily: "Georgia, serif",
              fontStyle: "italic",
              fontSize: 13,
              color: inkSoft,
              margin: "24px 0 0",
            }}
          >
            Con cariño,
            <br />
            GiraSun ✿
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

WelcomeEmail.PreviewProps = {
  unsubscribeUrl: "https://girasun.com/newsletter/unsubscribe/abc123",
} as WelcomeEmailProps;

export default WelcomeEmail;
