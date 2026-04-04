import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "kai_super_secret_fallback" });

  const { pathname } = req.nextUrl;

  // Static files and Next.js internal routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.match(/\.(png|jpg|jpeg|svg|webp|gif)$/)
  ) {
    return NextResponse.next();
  }

  // Public / unrestricted routes
  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register");
  const isApiAuthRoute = pathname.startsWith("/api/auth") || pathname.startsWith("/api/register");

  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  if (isAuthRoute) {
    if (token) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  // Protected routes (root chat page / dashboard)
  if (!token && (pathname === "/" || pathname === "/dashboard")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Verification Check
  if (token && token.isVerified === false) {
    if (pathname === "/" || pathname === "/dashboard" || pathname === "/account/security") {
      return NextResponse.redirect(new URL("/auth/verify", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
