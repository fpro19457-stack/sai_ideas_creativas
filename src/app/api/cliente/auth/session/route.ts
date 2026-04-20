import {NextResponse} from "next/server";
import {getClienteFromRequest} from "@/lib/clienteAuth";
import {prisma} from "@/lib/db";

export async function GET() {
  try {
    const payload = await getClienteFromRequest();

    if (!payload) {
      return NextResponse.json({});
    }

    const cliente = await prisma.cliente.findUnique({
      where: {id: payload.clienteId},
      select: {id: true, nombre: true, email: true, telefono: true},
    });

    if (!cliente) {
      return NextResponse.json({});
    }

    return NextResponse.json(cliente);
  } catch {
    return NextResponse.json({});
  }
}