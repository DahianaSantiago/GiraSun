"use client";

import { createContext, useContext, useState, useTransition, type ReactNode } from "react";
import { useAuth } from "./auth/AuthProvider";
import { toggleLikeAction } from "@/app/actions/likes";

// El detalle de un post pinta el botón de like dos veces (arriba, junto al
// título, y al final del texto). Ambos comparten este estado: si tuvieran el
// suyo propio, el de abajo seguiría creyendo que no le has dado y el siguiente
// clic quitaría el like en vez de ponerlo.

type LikeState = {
  count: number;
  liked: boolean;
  pending: boolean;
  toggle: () => void;
};

const LikeContext = createContext<LikeState | null>(null);

export function useLike(): LikeState {
  const ctx = useContext(LikeContext);
  if (!ctx) throw new Error("useLike debe usarse dentro de <LikeProvider>");
  return ctx;
}

export function LikeProvider({
  postType,
  postSlug,
  initialCount,
  initialLiked,
  children,
}: {
  postType: "cuento" | "escrito";
  postSlug: string;
  initialCount: number;
  initialLiked: boolean;
  children: ReactNode;
}) {
  const { user, promptSignIn } = useAuth();
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(initialLiked);
  const [pending, startTransition] = useTransition();

  const toggle = () => {
    if (!user) {
      promptSignIn();
      return;
    }

    const prevCount = count;
    const prevLiked = liked;
    const nextLiked = !liked;

    // Actualización optimista.
    setLiked(nextLiked);
    setCount((c) => c + (nextLiked ? 1 : -1));

    startTransition(async () => {
      const result = await toggleLikeAction({ postType, postSlug });
      if (!result.ok) {
        // Volvemos a lo que había justo antes del clic, no al valor del
        // primer render: entre medias el conteo pudo haber cambiado.
        setLiked(prevLiked);
        setCount(prevCount);
        return;
      }
      // Nos quedamos con el conteo autoritativo del servidor.
      setLiked(result.liked);
      setCount(result.count);
    });
  };

  return (
    <LikeContext.Provider value={{ count, liked, pending, toggle }}>
      {children}
    </LikeContext.Provider>
  );
}
