import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

// Routes that redirect to dashboard if already authenticated
const AUTH_ROUTES = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get token from cookie (if set) or check for auth header
  const accessToken =
    request.cookies.get("access_token")?.value ||
    request.cookies.get("authToken")?.value;

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  // If user is authenticated and trying to access auth pages
  if (accessToken && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // For protected routes, we can't reliably check localStorage in middleware
  // Instead, we'll let the client-side handle redirects via the layout or page components
  // This middleware only handles cookie-based checks and auth page redirects

  // Redirect root to login if not authenticated (cookie check only)
  if (pathname === "/" && !accessToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect root to dashboard if authenticated
  if (pathname === "/" && accessToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)",
  ],
};
