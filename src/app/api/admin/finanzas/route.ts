import {NextResponse} from "next/server";
import {prisma} from "@/lib/db";

export async function GET(request: Request) {
  try {
    const {searchParams} = new URL(request.url);
    const desde = searchParams.get("desde");
    const hasta = searchParams.get("hasta");

    const where: any = {
      OR: [
        {estadoPago: "PAGADO"},
        {estado: "ENTREGADO"},
        {estado: "EN_PRODUCCION"},
        {estado: "LISTO"},
        {estado: "ENVIADO"},
      ],
    };

    if (desde || hasta) {
      where.creadoEn = {};
      if (desde) where.creadoEn.gte = new Date(desde);
      if (hasta && hasta.trim()) where.creadoEn.lte = new Date(hasta + "T23:59:59");
    }

    const pedidos = await prisma.pedido.findMany({
      where,
      select: {
        id: true,
        numero: true,
        clienteNombre: true,
        clienteEmail: true,
        metodoPago: true,
        totalBruto: true,
        descuento: true,
        totalFinal: true,
        estado: true,
        creadoEn: true,
      },
      orderBy: {creadoEn: "desc"},
    });

    if (!pedidos || pedidos.length === 0) {
      return NextResponse.json({
        resumen: {total: 0, porMercadoPago: 0, porTransferencia: 0, porEfectivo: 0, descuentos: 0, pedidosCompletados: 0},
        porDia: [],
        porMetodo: [
          {metodo: "MercadoPago", monto: 0, cantidad: 0},
          {metodo: "Transferencia", monto: 0, cantidad: 0},
          {metodo: "Efectivo", monto: 0, cantidad: 0},
        ],
        transacciones: [],
      });
    }

    const total = pedidos.reduce((sum, p) => sum + p.totalFinal, 0);
    const porMercadoPago = pedidos
      .filter((p) => p.metodoPago === "MERCADOPAGO")
      .reduce((sum, p) => sum + p.totalFinal, 0);
    const porTransferencia = pedidos
      .filter((p) => p.metodoPago === "TRANSFERENCIA")
      .reduce((sum, p) => sum + p.totalFinal, 0);
    const porEfectivo = pedidos
      .filter((p) => p.metodoPago === "EFECTIVO")
      .reduce((sum, p) => sum + p.totalFinal, 0);
    const descuentos = pedidos.reduce((sum, p) => sum + p.descuento, 0);
    const pedidosCompletados = pedidos.filter((p) => p.estado === "ENTREGADO").length;

    const porDia: Record<string, number> = {};
    for (const pedido of pedidos) {
      const dia = new Date(pedido.creadoEn).toISOString().split("T")[0];
      porDia[dia] = (porDia[dia] || 0) + pedido.totalFinal;
    }

    const porMetodo = [
      {metodo: "MercadoPago", monto: porMercadoPago, cantidad: pedidos.filter((p) => p.metodoPago === "MERCADOPAGO").length},
      {metodo: "Transferencia", monto: porTransferencia, cantidad: pedidos.filter((p) => p.metodoPago === "TRANSFERENCIA").length},
      {metodo: "Efectivo", monto: porEfectivo, cantidad: pedidos.filter((p) => p.metodoPago === "EFECTIVO").length},
    ];

    return NextResponse.json({
      resumen: {total, porMercadoPago, porTransferencia, porEfectivo, descuentos, pedidosCompletados},
      porDia: Object.entries(porDia).map(([fecha, monto]) => ({fecha, monto})),
      porMetodo,
      transacciones: pedidos,
    });
  } catch (error) {
    console.error("Error en /api/admin/finanzas:", error);
    return NextResponse.json({
      resumen: {total: 0, porMercadoPago: 0, porTransferencia: 0, porEfectivo: 0, descuentos: 0, pedidosCompletados: 0},
      porDia: [],
      porMetodo: [
        {metodo: "MercadoPago", monto: 0, cantidad: 0},
        {metodo: "Transferencia", monto: 0, cantidad: 0},
        {metodo: "Efectivo", monto: 0, cantidad: 0},
      ],
      transacciones: [],
    });
  }
}