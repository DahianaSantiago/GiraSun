import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Text,
} from "@react-email/components";

const linen = "#fbf6e8";
const ink = "#322c20";
const inkSoft = "#615a4a";
const accent = "#dba94a";

export type ConfirmEmailProps = {
  confirmUrl: string;
};

export function ConfirmEmail({ confirmUrl }: ConfirmEmailProps) {
  return (
    <Html lang="es">
      <Head />
      <Preview>Confirma tu carta — GiraSun</Preview>
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
            <span
              style={{
                display: "inline-block",
                width: 8,
                height: 8,
                background: accent,
                borderRadius: 999,
                marginLeft: 8,
                verticalAlign: "middle",
              }}
            />
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
              color: ink,
            }}
          >
            Una carta cada luna llena.
          </Text>

          <Text style={{ fontSize: 15, lineHeight: 1.6, color: inkSoft, margin: "0 0 22px" }}>
            Antes de empezar a escribirnos, confirma tu correo. Es un paso pequeño pero importante:
            así me aseguro de que llegan a tu bandeja, no al spam, y de que sigues siendo tú.
          </Text>

          <Button
            href={confirmUrl}
            style={{
              display: "inline-block",
              background: ink,
              color: linen,
              padding: "14px 22px",
              borderRadius: 999,
              fontSize: 13,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Confirmar suscripción →
          </Button>

          <Text style={{ fontSize: 12, color: inkSoft, margin: "28px 0 0" }}>
            Si el botón no funciona, copia y pega este enlace en tu navegador:
            <br />
            <Link href={confirmUrl} style={{ color: accent, wordBreak: "break-all" }}>
              {confirmUrl}
            </Link>
          </Text>

          <Hr
            style={{
              border: "none",
              borderTop: "1px solid rgba(50,44,32,0.12)",
              margin: "32px 0 18px",
            }}
          />

          <Text style={{ fontSize: 11, lineHeight: 1.6, color: inkSoft, margin: 0 }}>
            Si no fuiste tú quien se suscribió, ignora este correo y no pasará nada — el enlace
            expira y nunca recibirás otra carta.
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

ConfirmEmail.PreviewProps = {
  confirmUrl: "https://girasun.com/newsletter/confirm/abc123",
} as ConfirmEmailProps;

export default ConfirmEmail;
