"use client";

import { createContext, useContext, useEffect, useState } from "react";
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const auth = getClientAuth();
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setLoading(false);
      // We sync here to keep the cookie alive on refresh
      await syncSession(u);
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

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
