"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { getClientAuth } from "@/lib/firebase/client";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  /** Open the sign-in modal. The modal is rendered globally; this just toggles state. */
  promptSignIn: () => void;
  /** Internal: read by the modal to know whether to render. Don't call directly. */
  signInPromptOpen: boolean;
  closeSignInPrompt: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const isMobileViewport = (): boolean =>
  typeof window !== "undefined" && window.matchMedia("(max-width: 720px)").matches;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [signInPromptOpen, setSignInPromptOpen] = useState(false);

  useEffect(() => {
    const auth = getClientAuth();
    const unsub = onAuthStateChanged(auth, (next) => {
      setUser(next);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const signIn = useCallback(async () => {
    const auth = getClientAuth();
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    try {
      const result = isMobileViewport() ? null : await signInWithPopup(auth, provider);

      // Mobile path: signInWithRedirect navigates away — when the user comes
      // back, onAuthStateChanged fires with the new user. We still need to
      // exchange that for a session cookie below, but it'll happen on the
      // next render via the user effect.
      if (!result) {
        await signInWithRedirect(auth, provider);
        return;
      }

      const idToken = await result.user.getIdToken();
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      if (!res.ok) {
        await firebaseSignOut(auth);
        throw new Error("session-cookie-failed");
      }
      setSignInPromptOpen(false);
    } catch (err) {
      const code = (err as { code?: string }).code;
      // The user closed the popup or cancelled — not an error worth logging.
      if (code !== "auth/popup-closed-by-user" && code !== "auth/cancelled-popup-request") {
        console.error("Sign-in failed:", err);
      }
    }
  }, []);

  const signOut = useCallback(async () => {
    const auth = getClientAuth();
    await firebaseSignOut(auth);
    await fetch("/api/session", { method: "DELETE" });
  }, []);

  const promptSignIn = useCallback(() => setSignInPromptOpen(true), []);
  const closeSignInPrompt = useCallback(() => setSignInPromptOpen(false), []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, signIn, signOut, promptSignIn, signInPromptOpen, closeSignInPrompt }),
    [user, loading, signIn, signOut, promptSignIn, signInPromptOpen, closeSignInPrompt],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
