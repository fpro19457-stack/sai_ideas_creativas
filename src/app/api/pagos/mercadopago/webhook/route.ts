import {NextResponse} from "next/server";
import {prisma} from "@/lib/db";
import {getPayment} from "@/lib/mercadopago";
import {sendEmailConfirmacionPedido} from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {type, data} = body;

    if (type !== "payment") {
      return NextResponse.json({ok: true});
    }

    const paymentId = data.id;

    const paymentInfo = await getPayment(paymentId);

    if (paymentInfo.status === "approved") {
      const externalReference = paymentInfo.external_reference;

      const pedido = await prisma.pedido.findUnique({
        where: {numero: externalReference},
        include: {items: {include: {producto: true}}, cupon: true},
      });

      if (pedido) {
        await prisma.pedido.update({
          where: {id: pedido.id},
          data: {
            mpPaymentId: paymentId.toString(),
            mpStatus: "approved",
            estadoPago: "PAGADO",
            estado: "PAGO_CONFIRMADO",
          },
        });

        await prisma.historialEstado.create({
          data: {
            pedidoId: pedido.id,
            estado: "PAGO_CONFIRMADO",
            nota: "Pago confirmado vía MercadoPago",
          },
        });

        try {
          await sendEmailConfirmacionPedido(pedido);
        } catch (emailError) {
          console.error("Error sending confirmation email:", emailError);
        }
      }
    }

    return NextResponse.json({ok: true});
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ok: true});
  }
}