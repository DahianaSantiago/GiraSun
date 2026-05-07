"use server";

import { z } from "zod";
import { render } from "@react-email/components";
import { ConfirmEmail } from "../../../emails/Confirm";
import { WelcomeEmail } from "../../../emails/Welcome";
import { sendEmail } from "@/lib/email";
import { upsertPendingSubscriber } from "@/lib/newsletter";

const Input = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  source: z.string().max(40).optional(),
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://girasun.com";

const confirmUrl = (token: string) => `${SITE_URL}/newsletter/confirm/${token}`;
const unsubscribeUrl = (token: string) => `${SITE_URL}/newsletter/unsubscribe/${token}`;

export async function subscribeAction(input: { email: string; source?: string }) {
  const parsed = Input.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "invalid-email" };
  }

  const { email, source = "home" } = parsed.data;

  try {
    const result = await upsertPendingSubscriber(email, source);

    // Already-confirmed subscribers don't get re-emailed. We still return ok
    // so the form shows the success state — they're effectively done.
    if (result.state === "already-confirmed") {
      return { ok: true as const, state: "already-subscribed" as const };
    }

    const html = await render(
      ConfirmEmail({ confirmUrl: confirmUrl(result.subscriber.confirmToken) }),
    );
    const text = `Confirma tu suscripción al newsletter de GiraSun:\n\n${confirmUrl(result.subscriber.confirmToken)}\n\nSi no fuiste tú, ignora este correo.`;

    await sendEmail({
      to: email,
      subject: "Confirma tu carta — GiraSun",
      html,
      text,
    });

    return { ok: true as const, state: "pending" as const };
  } catch (err) {
    console.error("[newsletter] subscribe failed:", err);
    return { ok: false as const, error: "server-error" };
  }
}

/** Called from the confirm route. Sends the welcome email after marking confirmed. */
export async function sendWelcomeEmailFor(email: string, unsubToken: string): Promise<void> {
  const html = await render(WelcomeEmail({ unsubscribeUrl: unsubscribeUrl(unsubToken) }));
  const text = `Gracias por confirmar. Te llegará una sola carta al mes.\n\nCancelar suscripción: ${unsubscribeUrl(unsubToken)}`;

  await sendEmail({
    to: email,
    subject: "Gracias. Nos escribiremos pronto. ✿",
    html,
    text,
  });
}
