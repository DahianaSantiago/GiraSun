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

/** DELETE /api/session — sign out by clearing the session cookie. */
export async function DELETE() {
  const { name, options } = sessionCookieAttrs();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(name, "", { ...options, maxAge: 0 });
  return res;
}
