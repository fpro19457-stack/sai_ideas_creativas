import {NextResponse} from "next/server";
import {prisma} from "@/lib/db";

export async function GET() {
  try {
    const [pedidosCount, productosCount, pedidosPendientes, pedidosRecientes, pedidosPorEstado] =
      await Promise.all([
        prisma.pedido.count(),
        prisma.producto.count(),
        prisma.pedido.count({where: {estado: {in: ["PENDIENTE", "PAGO_PENDIENTE"]}}}),
        prisma.pedido.findMany({
          orderBy: {creadoEn: "desc"},
          take: 5,
          include: {cliente: true},
        }),
        prisma.pedido.groupBy({
          by: ["estado"],
          _count: {estado: true},
        }),
      ]);

    return NextResponse.json({
      pedidosCount,
      productosCount,
      pedidosPendientes,
      pedidosRecientes,
      pedidosPorEstado,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json({error: "Error fetching stats"}, {status: 500});
  }
}