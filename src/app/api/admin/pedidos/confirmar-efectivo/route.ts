import {NextResponse} from "next/server";
import {prisma} from "@/lib/db";
import {sendEmailPagoConfirmado} from "@/lib/email";

export async function PATCH(request: Request) {
  try {
    const {pedidoId} = await request.json();

    if (!pedidoId) {
      return NextResponse.json({error: "pedidoId requerido"}, {status: 400});
    }

    const pedido = await prisma.pedido.update({
      where: {id: pedidoId},
      data: {
        estadoPago: "PAGADO",
        estado: "PAGO_CONFIRMADO",
        historialEstados: {
          create: {
            estado: "PAGO_CONFIRMADO",
            nota: "Pago en efectivo confirmado",
          },
        },
      },
      include: {
        cliente: true,
      },
    });

    if (pedido.cliente?.email) {
      await sendEmailPagoConfirmado(pedido);
    }

    return NextResponse.json(pedido);
  } catch (error) {
    console.error("Error confirming efectivo:", error);
    return NextResponse.json({error: "Error al confirmar"}, {status: 500});
  }
}