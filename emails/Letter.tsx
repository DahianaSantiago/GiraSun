import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

const linen = "#fbf6e8";
const ink = "#322c20";
const inkSoft = "#615a4a";
const accent = "#dba94a";

export type LetterEmailProps = {
  subject: string;
  bodyHTML: string;
  unsubscribeUrl: string;
};

export function LetterEmail({ subject, bodyHTML, unsubscribeUrl }: LetterEmailProps) {
  return (
    <Html lang="es">
      <Head />
      <Preview>{subject}</Preview>
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

          <Section
            style={{
              fontFamily: "Georgia, serif",
              fontSize: 16,
              lineHeight: 1.7,
              color: ink,
            }}
            dangerouslySetInnerHTML={{ __html: bodyHTML }}
          />

          <Hr
            style={{
              border: "none",
              borderTop: "1px solid rgba(50,44,32,0.12)",
              margin: "32px 0 18px",
            }}
          />

          <Text style={{ fontSize: 11, lineHeight: 1.6, color: inkSoft, margin: 0 }}>
            Recibiste este mensaje porque te suscribiste al newsletter de GiraSun. Te puedes ir
            cuando quieras —
            <Link href={unsubscribeUrl} style={{ color: accent, marginLeft: 4 }}>
              cancelar suscripción
            </Link>
            .
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

LetterEmail.PreviewProps = {
  subject: "Una carta de mayo",
  bodyHTML: "<p>Esta es la carta de este mes.</p>",
  unsubscribeUrl: "https://girasun.com/newsletter/unsubscribe/abc123",
} as LetterEmailProps;

export default LetterEmail;
