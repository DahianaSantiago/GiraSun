"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { getClientAuth } from "@/lib/firebase/client";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  signInPromptOpen: boolean;
  promptSignIn: () => void;
  closeSignInPrompt: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [signInPromptOpen, setSignInPromptOpen] = useState(false);

  // Sync session cookie with Firebase Auth state
  const syncSession = async (firebaseUser: User | null) => {
    try {
      if (firebaseUser) {
        const idToken = await firebaseUser.getIdToken();
        await fetch("/api/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
        });
      } else {
        await fetch("/api/session", { method: "DELETE" });
      }
    } catch (error) {
      console.error("Session sync failed:", error);
    }
  };

  // The session cookie outlives the client SDK's own persistence (IndexedDB, which
  // browsers can evict — Safari's ITP does so after 7 days, and it is unavailable in
  // some private modes). Dropping the cookie just because the SDK restored no user
  // would log out someone whose cookie is still valid, so only clear it on a real
  // sign-out: a transition from a signed-in user to none.
  const hadUser = useRef(false);

  useEffect(() => {
    const auth = getClientAuth();
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setLoading(false);
      const wasSignedIn = hadUser.current;
      hadUser.current = u !== null;
      // We sync here to keep the cookie alive on refresh
      if (u || wasSignedIn) await syncSession(u);
    });
  }, []);

  const signIn = async () => {
    const auth = getClientAuth();
    const provider = new GoogleAuthProvider();
    // Unified: use popup on all devices to maintain state in the current page
    const result = await signInWithPopup(auth, provider);
    await syncSession(result.user);
  };

  const signOut = async () => {
    const auth = getClientAuth();
    await firebaseSignOut(auth);
    await syncSession(null);
  };

  const promptSignIn = () => setSignInPromptOpen(true);
  const closeSignInPrompt = () => setSignInPromptOpen(false);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signOut,
        signInPromptOpen,
        promptSignIn,
        closeSignInPrompt,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
