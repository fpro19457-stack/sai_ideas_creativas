import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const session = await auth();
    console.log("[Middleware] /admin check - pathname:", pathname, "session:", session ? "exists" : "null");

    if (!session) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (pathname.startsWith("/cuenta") && !pathname.startsWith("/cuenta/login") && !pathname.startsWith("/cuenta/registro") && !pathname.startsWith("/cuenta/verificar") && !pathname.startsWith("/cuenta/reset-password")) {
    const clienteSession = request.cookies.get("cliente-session")?.value;

    if (!clienteSession) {
      const loginUrl = new URL("/cuenta/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/cuenta/:path*", "/cuenta/reset-password"],
};