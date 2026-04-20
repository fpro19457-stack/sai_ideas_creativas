import {NextResponse} from "next/server";
import {prisma} from "@/lib/db";

export async function GET(request: Request, {params}: {params: Promise<{id: string}>}) {
  const {id} = await params;
  try {
    const pedido = await prisma.pedido.findUnique({
      where: {id},
      include: {
        cliente: true,
        items: {include: {producto: true}},
        archivos: true,
        historialEstados: {orderBy: {crearEn: "asc"}},
        cupon: true,
      },
    });

    if (!pedido) {
      return NextResponse.json({error: "Pedido no encontrado"}, {status: 404});
    }

    return NextResponse.json(pedido);
  } catch (error) {
    return NextResponse.json({error: "Error fetching pedido"}, {status: 500});
  }
}

export async function PATCH(request: Request, {params}: {params: Promise<{id: string}>}) {
  const {id} = await params;
  try {
    const body = await request.json();
    const {estado, nota, courier, guiaTracking, direccion, notasInternas} = body;

    const updateData: any = {};

    if (estado) {
      updateData.estado = estado;
      await prisma.historialEstado.create({
        data: {
          pedidoId: id,
          estado,
          nota,
        },
      });
    }

    if (courier) updateData.courier = courier;
    if (guiaTracking) updateData.guiaTracking = guiaTracking;
    if (direccion !== undefined) updateData.direccion = direccion;
    if (notasInternas !== undefined) updateData.notasInternas = notasInternas;

    const pedido = await prisma.pedido.update({
      where: {id},
      data: updateData,
    });

    return NextResponse.json(pedido);
  } catch (error) {
    return NextResponse.json({error: "Error updating pedido"}, {status: 500});
  }
}