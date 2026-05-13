import { NextRequest, NextResponse } from "next/server";

// Lightweight cookie-presence guard for /admin routes.
// Full cryptographic verification (Firebase Admin verifySessionCookie) happens
// in src/app/admin/(authed)/layout.tsx — that's where expired/revoked sessions
// are caught and redirected. This layer just short-circuits obvious unauthenticated
// requests before any page component runs.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const session = req.cookies.get("__session");
    if (!session?.value) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
