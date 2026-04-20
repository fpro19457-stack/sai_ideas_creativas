import {NextResponse} from "next/server";
import {getClienteFromRequest} from "@/lib/clienteAuth";
import {prisma} from "@/lib/db";

export async function GET(request: Request) {
  try {
    const clientePayload = await getClienteFromRequest();

    if (!clientePayload) {
      return NextResponse.json({error: "No autorizado"}, {status: 401});
    }

    const {searchParams} = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 10;

    const [pedidos, total] = await Promise.all([
      prisma.pedido.findMany({
        where: {clienteId: clientePayload.clienteId},
        orderBy: {creadoEn: "desc"},
        skip: (page - 1) * limit,
        take: limit,
        include: {
          items: {include: {producto: true}},
        },
      }),
      prisma.pedido.count({where: {clienteId: clientePayload.clienteId}}),
    ]);

    return NextResponse.json({
      pedidos,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching cliente pedidos:", error);
    return NextResponse.json({error: "Error al obtener pedidos"}, {status: 500});
  }
}