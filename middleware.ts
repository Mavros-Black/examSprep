import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Admin-only routes
    if (path.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Teacher-only routes
    if (path.startsWith("/teacher") && !["TEACHER", "ADMIN"].includes(token?.role || "")) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Student-only routes (default - all authenticated users can access)
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/upload/:path*",
    "/practice/:path*",
    "/results/:path*",
    "/settings/:path*",
    "/admin/:path*",
    "/teacher/:path*",
  ],
};
