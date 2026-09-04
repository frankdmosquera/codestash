import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Fast, cookie-presence-only check — redirects unauthenticated hits on
// protected routes before they even render. NOT the real access-control
// boundary: it can't verify the session is still valid, only that a
// session cookie exists. The actual check happens server-side in each
// protected page/layout via `auth.api.getSession(...)` — see
// app/(main)/onboarding/page.tsx for that pattern. Renamed from
// middleware.ts — Next 16 deprecated that convention in favor of proxy.ts.
export default function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    const signInUrl = new URL("/sign-in", request.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Everything requires a session now — the catalog is no longer public
  // (see md-docs/ROLES-AND-BILLING-PLAN.md #5, reversed 2026-09-04).
  // Excluded: the auth API itself (sign-in/sign-up need it reachable
  // while signed out), the sign-in/sign-up pages, and /invite/accept,
  // which deliberately renders for signed-out visitors too so it can show
  // its own "sign in to accept" state instead of being redirected before
  // the page ever loads.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sign-in|sign-up|invite/accept).*)",
  ],
};
