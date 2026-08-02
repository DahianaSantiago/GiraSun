"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { render } from "@react-email/components";
import { WelcomeEmail } from "../../../emails/Welcome";
import { sendEmail } from "@/lib/email";
import {
  upsertConfirmedSubscriber,
  adminUnsubscribe,
  listAllSubscribers,
  recordNewsletterSend,
} from "@/lib/newsletter";
import { LetterEmail } from "../../../emails/Letter";
import { getSession } from "@/lib/firebase/session";
import { isAdmin } from "@/lib/firebase/admins";
import { checkRateLimit } from "@/lib/rate-limit";

async function requireAdmin() {
  const session = await getSession();
  if (!session) throw new Error("not-authenticated");
  if (!(await isAdmin(session.email))) throw new Error("not-admin");
}

const Input = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  source: z.string().max(40).optional(),
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://girasun.com";

const unsubscribeUrl = (token: string) => `${SITE_URL}/newsletter/unsubscribe/${token}`;

export async function subscribeAction(input: { email: string; source?: string }) {
  const parsed = Input.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "invalid-email" };
  }

  const { email, source = "home" } = parsed.data;

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0].trim() ?? "127.0.0.1";
  const rl = await checkRateLimit("newsletter", ip);
  if (!rl.allowed) {
    return { ok: false as const, error: "rate-limited" };
  }

  try {
    // Single opt-in: the address is subscribed the moment the form is submitted.
    // The welcome email is a courtesy, not a gate — nothing is asked of the user.
    const result = await upsertConfirmedSubscriber(email, source);

    // Already-subscribed addresses don't get re-emailed. We still return ok
    // so the form shows the success state — they're effectively done.
    if (result.state === "already-confirmed") {
      return { ok: true as const, state: "already-subscribed" as const };
    }

    try {
      await sendWelcomeEmailFor(email, result.subscriber.unsubToken);
    } catch (err) {
      // The subscription is already stored, so a failed welcome email must not
      // fail the request — they're on the list either way.
      console.error("[newsletter] welcome email failed:", err);
    }

    return { ok: true as const, state: "subscribed" as const };
  } catch (err) {
    console.error("[newsletter] subscribe failed:", err);
    return { ok: false as const, error: "server-error" };
  }
}

export async function adminUnsubscribeAction(email: string) {
  try {
    await requireAdmin();
    await adminUnsubscribe(email);
    return { ok: true as const };
  } catch (err) {
    return { ok: false as const, error: (err as Error).message };
  }
}

export async function sendNewsletterAction(input: { subject: string; bodyHTML: string }) {
  try {
    await requireAdmin();
    const session = await getSession();
    const confirmed = (await listAllSubscribers()).filter((s) => s.status === "confirmed");
    if (confirmed.length === 0) {
      return { ok: false as const, error: "no-recipients" };
    }

    const FROM = process.env.EMAIL_FROM ?? "GiraSun <hola@girasun.com>";
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      console.warn("[newsletter] RESEND_API_KEY not set — skipping bulk send.");
      const sent = await recordNewsletterSend({
        subject: input.subject,
        bodyHTML: input.bodyHTML,
        recipientCount: 0,
        sentBy: session?.email ?? "admin",
      });
      return { ok: true as const, send: sent, skipped: true };
    }

    const { Resend } = await import("resend");
    const resend = new Resend(resendApiKey);

    const CHUNK = 100;
    let sent = 0;
    for (let i = 0; i < confirmed.length; i += CHUNK) {
      const chunk = confirmed.slice(i, i + CHUNK);
      const messages = await Promise.all(
        chunk.map(async (sub) => {
          const html = await render(
            LetterEmail({
              subject: input.subject,
              bodyHTML: input.bodyHTML,
              unsubscribeUrl: unsubscribeUrl(sub.unsubToken),
            }),
          );
          return {
            from: FROM,
            to: sub.email,
            subject: input.subject,
            html,
          };
        }),
      );
      await resend.batch.send(messages);
      sent += chunk.length;
    }

    const record = await recordNewsletterSend({
      subject: input.subject,
      bodyHTML: input.bodyHTML,
      recipientCount: sent,
      sentBy: session?.email ?? "admin",
    });
    return { ok: true as const, send: record };
  } catch (err) {
    console.error("[newsletter] sendNewsletterAction failed:", err);
    return { ok: false as const, error: (err as Error).message };
  }
}

/**
 * The one and only email a new subscriber gets. Sent by subscribeAction, and
 * also by the legacy confirm route when someone clicks an old confirm link.
 */
export async function sendWelcomeEmailFor(email: string, unsubToken: string): Promise<void> {
  const html = await render(WelcomeEmail({ unsubscribeUrl: unsubscribeUrl(unsubToken) }));
  const text = `Ya estás en la lista. Te llegará una sola carta al mes — no tienes que hacer nada más.\n\nCancelar suscripción: ${unsubscribeUrl(unsubToken)}`;

  await sendEmail({
    to: email,
    subject: "Ya estás dentro. Nos escribiremos pronto. ✿",
    html,
    text,
  });
}
