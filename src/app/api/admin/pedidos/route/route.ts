import {NextResponse} from "next/server";
import {prisma} from "@/lib/db";
import jwt from "jsonwebtoken";
import {cookies} from "next/headers";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "fallback-secret";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("admin-session")?.value;

    if (!adminSession) {
      return NextResponse.json({error: "No autenticado"}, {status: 401});
    }

    jwt.verify(adminSession, JWT_SECRET);
  } catch {
    return NextResponse.json({error: "Sesión inválida"}, {status: 401});
  }

  const pedidos = await prisma.pedido.findMany({
    orderBy: {creadoEn: "desc"},
    include: {cliente: true},
  });

  return NextResponse.json(pedidos);
}