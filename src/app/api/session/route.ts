import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createSessionCookie, sessionCookieAttrs } from "@/lib/firebase/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  idToken: z.string().min(20),
});

/** POST /api/session — exchange a Firebase ID token for a session cookie. */
export async function POST(req: NextRequest) {
  let parsed: z.infer<typeof Body>;
  try {
    parsed = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const { cookie, ttlMs } = await createSessionCookie(parsed.idToken);
    const { name, options } = sessionCookieAttrs();
    const res = NextResponse.json({ ok: true });
    res.cookies.set(name, cookie, { ...options, maxAge: Math.floor(ttlMs / 1000) });
    return res;
  } catch (err) {
    console.error("Session mint failed:", err);
    return NextResponse.json({ error: "Could not create session" }, { status: 401 });
  }
}

/**
 * GET /api/session?token=<idToken>&redirect=<path>
 * Test-only: sets the session cookie via a navigation response so the browser
 * treats it as a first-party navigation cookie. Only works when the Firebase
 * Auth emulator is active (FIREBASE_AUTH_EMULATOR_HOST is set).
 */
export async function GET(req: NextRequest) {
  if (!process.env.FIREBASE_AUTH_EMULATOR_HOST) {
    return NextResponse.json({ error: "Not allowed outside emulator mode" }, { status: 403 });
  }

  const token = req.nextUrl.searchParams.get("token");
  const redirectTo = req.nextUrl.searchParams.get("redirect") ?? "/admin";

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  try {
    const { cookie, ttlMs } = await createSessionCookie(token);
    const { name, options } = sessionCookieAttrs();
    const res = NextResponse.redirect(new URL(redirectTo, req.url));
    res.cookies.set(name, cookie, { ...options, maxAge: Math.floor(ttlMs / 1000) });
    return res;
  } catch (err) {
    console.error("Session mint failed (GET):", err);
    return NextResponse.json({ error: "Could not create session" }, { status: 401 });
  }
}

/** DELETE /api/session — sign out by clearing the session cookie. */
export async function DELETE() {
  const { name, options } = sessionCookieAttrs();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(name, "", { ...options, maxAge: 0 });
  return res;
}
