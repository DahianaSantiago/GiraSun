"use client";

import { useState, useTransition } from "react";
import { subscribeAction } from "@/app/actions/newsletter";

type SubmitState = "idle" | "submitted" | "already-subscribed" | "error";

export function Newsletter({ source = "home" }: { source?: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<SubmitState>("idle");
  const [pending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    startTransition(async () => {
      const res = await subscribeAction({ email, source });
      if (res.ok) {
        setState(res.state === "already-subscribed" ? "already-subscribed" : "submitted");
        setEmail("");
      } else {
        setState("error");
        setErrorMsg(
          res.error === "invalid-email"
            ? "Esa dirección de correo no parece válida."
            : res.error === "rate-limited"
              ? "Demasiados intentos. Intenta de nuevo más tarde."
              : "No pudimos guardar tu correo. Intenta de nuevo en un momento.",
        );
      }
    });
  };

  return (
    <section className="section">
      <div className="container">
        <div className="newsletter">
          <div>
            <div className="newsletter-eyebrow">Newsletter</div>
            <h3>
              Una carta cada luna llena.
              <br />
              <em>Sin spam.</em>
            </h3>
            <p>
              Cartas de amor, pensamientos, reflexiones, meditaciones, libros que me están
              atravesando en el mes o las pelis favoritas de la semana. Llega a tu correo el tres de
              cada mes.
            </p>
          </div>
          <div>
            {state === "submitted" || state === "already-subscribed" ? (
              <div className="sent">
                {state === "already-subscribed"
                  ? "Ya estabas en la lista. Nos escribiremos pronto. ✿"
                  : "Revisa tu correo y confirma. Nos escribiremos pronto. ✿"}
              </div>
            ) : (
              <form onSubmit={onSubmit} aria-label="Suscribirse al newsletter">
                <input
                  type="email"
                  name="email"
                  placeholder="tu correo electrónico"
                  aria-label="tu correo electrónico"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={pending}
                />
                <button type="submit" disabled={pending || !email}>
                  {pending ? "Enviando..." : "Suscribirme"}
                </button>
              </form>
            )}
            {state === "error" && errorMsg ? (
              <div className="newsletter-error">{errorMsg}</div>
            ) : null}
            <div className="check">
              <span className="brand-dot"></span>
              <span>Sin spam. Una sola carta al mes. Te puedes ir cuando quieras.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
