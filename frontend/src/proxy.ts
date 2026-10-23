import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";

/**
 * Optimistic check only: without a cookie there is no point rendering a
 * protected page. Token validity and roles are verified by the backend.
 */
export default function proxy(request: NextRequest) {
  if (!request.cookies.has(AUTH_COOKIE_NAME)) {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/student/:path*", "/mentor/:path*"],
};
