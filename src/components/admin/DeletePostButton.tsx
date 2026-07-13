"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteDraftAction } from "@/app/actions/drafts";

const TrashIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

export function DeletePostButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const onDelete = () => {
    if (!window.confirm(`¿Eliminar "${title}"? Esta acción no se puede deshacer.`)) return;
    startTransition(async () => {
      try {
        const res = await deleteDraftAction(id);
        if (res.ok) {
          router.refresh();
        } else {
          window.alert(`No se pudo eliminar: ${res.detail ?? res.error}`);
        }
      } catch (err) {
        // Without this, a rejected server action is swallowed by the transition
        // and the row just silently stays put.
        window.alert(`No se pudo eliminar: ${(err as Error).message}`);
      }
    });
  };

  return (
    <button
      type="button"
      className="icon-btn danger"
      title="Eliminar"
      aria-label={`Eliminar ${title}`}
      onClick={onDelete}
      disabled={pending}
    >
      <TrashIcon />
    </button>
  );
}
