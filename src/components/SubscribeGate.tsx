"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { subscribeAction } from "@/app/actions/newsletter";

/**
 * First-visit subscribe gate.
 *
 * Shown once per browser, a few seconds into the first visit to any public
 * page. Whatever the visitor does with it — subscribes, dismisses it, presses
 * Escape — we remember it in localStorage and never open it again. If storage
 * is unavailable (Safari private mode throws on write) the gate degrades to
 * "once per page load", which is the friendlier failure of the two.
 */

const STORAGE_KEY = "girasun:subscribe-gate";
const OPEN_DELAY_MS = 6000;
const CLOSE_AFTER_SUCCESS_MS = 2600;

type Outcome = "subscribed" | "dismissed";
type SubmitState = "idle" | "submitted" | "already-subscribed" | "error";

function alreadySeen(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

function remember(outcome: Outcome): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, outcome);
  } catch {
    // Storage blocked — nothing to remember, the gate just won't persist.
  }
}

// Landing on the confirm/unsubscribe pages means the visitor is already dealing
// with the newsletter — asking them to sign up there would be absurd.
const MUTED_PATHS = ["/newsletter"];

const FOCUSABLE =
  'button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

export function SubscribeGate({ delayMs = OPEN_DELAY_MS }: { delayMs?: number }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<SubmitState>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const dialogRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const muted = MUTED_PATHS.some((prefix) => pathname?.startsWith(prefix));

  const close = useCallback((outcome: Outcome) => {
    remember(outcome);
    setOpen(false);
  }, []);

  // Arm the timer on first visit only. Reading storage here (rather than in
  // useState) keeps the server and the first client render identical.
  useEffect(() => {
    if (muted || alreadySeen()) return;
    const timer = setTimeout(() => setOpen(true), delayMs);
    return () => clearTimeout(timer);
  }, [delayMs, muted]);

  // Escape to dismiss, Tab kept inside the dialog, page frozen behind it.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close("dismissed");
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    dialogRef.current?.querySelector<HTMLElement>('input[type="email"]')?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  // Let the thank-you land for a beat, then get out of the way.
  useEffect(() => {
    if (state !== "submitted" && state !== "already-subscribed") return;
    const timer = setTimeout(() => setOpen(false), CLOSE_AFTER_SUCCESS_MS);
    return () => clearTimeout(timer);
  }, [state]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    startTransition(async () => {
      const res = await subscribeAction({ email, source: "gate" });
      if (res.ok) {
        // Remembered before the auto-close fires: a subscriber must never see
        // this again, even if they navigate away in the meantime.
        remember("subscribed");
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

  if (!open) return null;

  const done = state === "submitted" || state === "already-subscribed";

  return (
    <div
      className="gate-backdrop"
      role="presentation"
      onClick={() => close("dismissed")}
      data-testid="subscribe-gate"
    >
      <div
        ref={dialogRef}
        className="gate"
        role="dialog"
        aria-modal="true"
        aria-labelledby="gate-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="gate-close"
          aria-label="Cerrar"
          onClick={() => close("dismissed")}
        >
          ×
        </button>

        <div className="gate-eyebrow">Qué bueno tenerte por aquí</div>
        <h2 id="gate-title">
          Una carta cada
          <br />
          <em>luna llena</em>.
        </h2>
        <p>
          Cartas de amor, pensamientos, poemas, los libros que me están atravesando este mes y las
          pelis favoritas de la semana. También te aviso cuando sea luna llena para que salgas y la
          mires.
        </p>

        {done ? (
          <div className="gate-sent">
            {state === "already-subscribed"
              ? "Ya estabas en la lista. Nos escribiremos pronto. ✿"
              : "Listo, ya estás en la lista. Nos escribiremos pronto. ✿"}
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

        {state === "error" && errorMsg ? <div className="gate-error">{errorMsg}</div> : null}

        {done ? null : (
          <button type="button" className="gate-skip" onClick={() => close("dismissed")}>
            Ahora no, gracias
          </button>
        )}

        <div className="gate-check">
          <span className="brand-dot" />
          <span>Sin spam. Una sola carta al mes. Te puedes ir cuando quieras.</span>
        </div>
      </div>
    </div>
  );
}
