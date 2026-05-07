"use client";

import { useAuth } from "@/components/auth/AuthProvider";

export function SignOutLink() {
  const { signOut } = useAuth();
  return (
    <button type="button" onClick={() => signOut()} className="admin-signout">
      Cerrar sesión
    </button>
  );
}
