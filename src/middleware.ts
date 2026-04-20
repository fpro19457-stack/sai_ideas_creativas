import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
  matcher: ["/cuenta/:path*", "/cuenta/reset-password"],
};