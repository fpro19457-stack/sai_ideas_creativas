import {NextResponse} from "next/server";
import {prisma} from "@/lib/db";
import {cuponSchema, validateOrThrow} from "@/lib/schemas";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let validated: {codigo: string; total: number};
    try {
      validated = validateOrThrow(cuponSchema, body);
    } catch (err: any) {
      return NextResponse.json(err.error || {error: "Datos inválidos"}, {status: err.status || 400});
    }

    const {codigo, total} = validated;

    const cupon = await prisma.cupon.findUnique({
      where: {codigo: codigo.toUpperCase()},
    });

    if (!cupon) {
      return NextResponse.json({valido: false, mensaje: "Código inválido"});
    }

    if (!cupon.activo) {
      return NextResponse.json({valido: false, mensaje: "Cupón desactivado"});
    }

    const now = new Date();
    if (cupon.fechaInicio && now < cupon.fechaInicio) {
      return NextResponse.json({valido: false, mensaje: "Cupón aún no válido"});
    }

    if (cupon.fechaFin && now > cupon.fechaFin) {
      return NextResponse.json({valido: false, mensaje: "Cupón vencido"});
    }

    if (cupon.maxUsos && cupon.usosActuales >= cupon.maxUsos) {
      return NextResponse.json({valido: false, mensaje: "Cupón agotado"});
    }

    if (cupon.minCompra && total < cupon.minCompra) {
      return NextResponse.json({
        valido: false,
        mensaje: `Requiere compra mínima de $${cupon.minCompra.toLocaleString()}`,
      });
    }

    let descuento = 0;
    if (cupon.tipo === "PORCENTAJE") {
      descuento = total * (cupon.valor / 100);
    } else {
      descuento = Math.min(cupon.valor, total);
    }

    return NextResponse.json({
      valido: true,
      tipo: cupon.tipo,
      valor: cupon.valor,
      descuento,
      mensaje: `¡Cupón aplicado! Ahorrás $${descuento.toLocaleString()}`,
      cuponId: cupon.id,
    });
  } catch (error) {
    return NextResponse.json({error: "Error validating cupon"}, {status: 500});
  }
}