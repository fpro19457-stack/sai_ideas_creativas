import {NextResponse} from "next/server";
import {getClienteFromRequest} from "@/lib/clienteAuth";
import {prisma} from "@/lib/db";

export async function GET(
  request: Request,
  {params}: {params: Promise<{id: string}>}
) {
  try {
    const clientePayload = await getClienteFromRequest();

    if (!clientePayload) {
      return NextResponse.json({error: "No autorizado"}, {status: 401});
    }

    const {id} = await params;

    const pedido = await prisma.pedido.findUnique({
      where: {id},
      include: {
        items: {include: {producto: true}},
        historialEstados: {orderBy: {crearEn: "asc"}},
        cupon: true,
      },
    });

    if (!pedido) {
      return NextResponse.json({error: "Pedido no encontrado"}, {status: 404});
    }

    if (pedido.clienteId !== clientePayload.clienteId) {
      return NextResponse.json({error: "No autorizado"}, {status: 403});
    }

    return NextResponse.json(pedido);
  } catch (error) {
    console.error("Error fetching cliente pedido:", error);
    return NextResponse.json({error: "Error al obtener pedido"}, {status: 500});
  }
}