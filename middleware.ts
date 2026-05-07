import { NextResponse, type NextRequest } from "next/server";

/**
 * Fast-path admin gate. Runs at the edge — can't call Firebase Admin from
 * here, so it only checks for the *presence* of a session cookie. The full
 * verification (signature + admin allowlist check) happens in
 * src/app/admin/layout.tsx, which runs in the Node runtime.
 *
 * What this prevents: anonymous users accidentally hitting /admin pages and
 * getting a flash of the admin shell before the layout redirect kicks in.
 */
export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const isAdminRoute = url.pathname.startsWith("/admin");
  const isAdminLogin = url.pathname === "/admin/login";

  if (!isAdminRoute || isAdminLogin) {
    return NextResponse.next();
  }

  const hasSession = !!req.cookies.get("__session")?.value;
  if (!hasSession) {
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("from", url.pathname + url.search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Run on every /admin route except static assets and the login page.
  matcher: ["/admin/:path*"],
};
