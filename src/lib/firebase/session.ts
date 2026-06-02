// Server-side session helpers. Uses Firebase Admin's createSessionCookie /
// verifySessionCookie to establish an httpOnly cookie that survives across
// page reloads — the canonical Firebase + Next.js App Router auth pattern.
//
// Flow:
//   1. Client signs in via Firebase Auth (Google popup) → gets an ID token.
//   2. Client POSTs the ID token to /api/session.
//   3. Server verifies the ID token, mints a session cookie (5-day TTL),
//      and sets it as an httpOnly cookie on the response.
//   4. Subsequent requests include the cookie automatically; getSession()
//      verifies it and returns the user.

import "server-only";
import { cookies } from "next/headers";
import { getServerAuth } from "./server";

/** Maximum session cookie age supported by Firebase: 14 days. We use 5. */
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 5;
const SESSION_COOKIE_NAME = "__session";

export type Session = {
  uid: string;
  email: string;
  name: string | null;
  picture: string | null;
};

/**
 * Mint a session cookie from a Firebase ID token (returned by client-side
 * \\\`signInWithPopup\\\`). The token must be ≤5 min old or Firebase rejects it.
 */
export async function createSessionCookie(
  idToken: string,
): Promise<{ cookie: string; ttlMs: number }> {
  const auth = getServerAuth();
  // Verify the ID token first to surface clearer errors.
  await auth.verifyIdToken(idToken, true);
  const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn: SESSION_TTL_MS });
  return { cookie: sessionCookie, ttlMs: SESSION_TTL_MS };
}

/** Read + verify the session cookie from the current request. Returns null when absent or invalid. */
export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  const cookieValue = jar.get(SESSION_COOKIE_NAME)?.value;

  if (!cookieValue) return null;

  try {
    // Revocation checking requires a live backend call; skip it in emulator mode
    // where the emulator may not support the revocation endpoint.
    const checkRevoked = !process.env.FIREBASE_AUTH_EMULATOR_HOST;
    const decoded = await getServerAuth().verifySessionCookie(cookieValue, checkRevoked);
    return {
      uid: decoded.uid,
      email: decoded.email ?? "",
      name: decoded.name ?? null,
      picture: decoded.picture ?? null,
    };
  } catch {
    return null;
  }
}

/** Returns the cookie name + secure attributes — used by the route handler to set / clear. */
export function sessionCookieAttrs(): {
  name: string;
  options: { httpOnly: true; secure: boolean; sameSite: "lax"; path: "/"; maxAge?: number };
} {
  return {
    name: SESSION_COOKIE_NAME,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    },
  };
}
