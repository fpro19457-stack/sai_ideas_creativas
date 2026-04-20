import {NextResponse} from "next/server";
import {prisma} from "@/lib/db";
import {createPreference} from "@/lib/mercadopago";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {pedidoId} = body;

    const pedido = await prisma.pedido.findUnique({
      where: {id: pedidoId},
      include: {items: {include: {producto: true}}},
    });

    if (!pedido) {
      return NextResponse.json({error: "Pedido no encontrado"}, {status: 404});
    }

    if (pedido.metodoPago !== "MERCADOPAGO") {
      return NextResponse.json({error: "Método de pago no es MercadoPago"}, {status: 400});
    }

    const preference = await createPreference(pedido);

    await prisma.pedido.update({
      where: {id: pedidoId},
      data: {mpPreferenceId: preference.id},
    });

    return NextResponse.json({
      preferenceId: preference.id,
      initPoint: preference.init_point,
    });
  } catch (error) {
    console.error("Error creating preference:", error);
    return NextResponse.json({error: "Error creating preference"}, {status: 500});
  }
}