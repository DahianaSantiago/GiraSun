// Resend wrapper with a graceful no-op when no API key is configured.
//
// During Phase 6 the girasun.com domain isn't yet verified at Resend (Phase
// 12 wires DNS), so production sends will fail. To keep the app deployable,
// every send goes through this wrapper:
//
//   - If RESEND_API_KEY is unset, log to console and return as if sent.
//     This keeps local dev + Vercel preview working without surprises.
//   - If RESEND_API_KEY is set but the send fails (e.g., domain not yet
//     verified), log the error and return ok:false. Callers should treat
//     this as a soft failure — the subscriber is still in Firestore, the
//     admin can resend once DNS is green.
//
// In Phase 12 we set RESEND_API_KEY in Vercel and the wrapper just works.

import "server-only";
import { Resend } from "resend";

const FROM_DEFAULT = process.env.EMAIL_FROM || "GiraSun <hola@girasun.com>";
const REPLY_TO = process.env.EMAIL_REPLY_TO || "hola@girasun.com";

let _resend: Resend | null = null;
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

export type SendResult =
  | { ok: true; id: string | null }
  | { ok: false; reason: "no-api-key" | "send-failed"; error?: string };

export async function sendEmail({
  to,
  subject,
  html,
  text,
  from = FROM_DEFAULT,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
  from?: string;
}): Promise<SendResult> {
  const resend = getResend();

  if (!resend) {
    console.warn(`[email] RESEND_API_KEY not set — skipping send. To: ${to}, Subject: ${subject}`);
    return { ok: true, id: null };
  }

  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      replyTo: REPLY_TO,
      subject,
      html,
      text,
    });
    if (error) {
      console.error("[email] Resend send error:", error);
      return { ok: false, reason: "send-failed", error: error.message };
    }
    return { ok: true, id: data?.id ?? null };
  } catch (err) {
    console.error("[email] Unexpected send failure:", err);
    return { ok: false, reason: "send-failed", error: (err as Error).message };
  }
}
