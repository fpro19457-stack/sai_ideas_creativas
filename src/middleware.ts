import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import * as jose from "jose";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

const RATE_LIMITS = {
  "/api/cliente/auth/login": { max: 5, windowMs: 15 * 60 * 1000 },
  "/api/cliente/auth/registro": { max: 3, windowMs: 60 * 60 * 1000 },
  "/api/cupones/validar": { max: 20, windowMs: 60 * 1000 },
};

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return "unknown";
}

function checkRateLimit(path: string, ip: string): boolean {
  if (process.env.NODE_ENV === "development") return true;
  const limit = RATE_LIMITS[path as keyof typeof RATE_LIMITS];
  if (!limit) return true;

  const now = Date.now();
  const key = `${ip}:${path}`;
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, {count: 1, resetAt: now + limit.windowMs});
    return true;
  }

  if (entry.count >= limit.max) {
    return false;
  }

  entry.count++;
  return true;
}

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}, 60 * 1000);

async function verifyClienteJWT(token: string): Promise<boolean> {
  try {
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "fallback-secret-change-in-production");
    await jose.jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const clienteToken = request.cookies.get("cliente-session")?.value;
    if (clienteToken && await verifyClienteJWT(clienteToken)) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (pathname.startsWith("/cuenta") && !pathname.startsWith("/cuenta/login") && !pathname.startsWith("/cuenta/registro") && !pathname.startsWith("/cuenta/verificar") && !pathname.startsWith("/cuenta/reset-password")) {
    const clienteToken = request.cookies.get("cliente-session")?.value;

    if (!clienteToken || !(await verifyClienteJWT(clienteToken))) {
      const loginUrl = new URL("/cuenta/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Rate limiting deshabilitado temporalmente
  // if (RATE_LIMITS[pathname as keyof typeof RATE_LIMITS]) {
  //   const ip = getClientIp(request);
  //   if (!checkRateLimit(pathname, ip)) {
  //     return NextResponse.json(
  //       {error: "Demasiadas solicitudes. Intenta más tarde."},
  //       {status: 429}
  //     );
  //   }
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/cuenta/:path*", "/cuenta/reset-password", "/api/cliente/auth/login", "/api/cliente/auth/registro", "/api/cupones/validar"],
};