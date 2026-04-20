import {NextResponse} from "next/server";
import {prisma} from "@/lib/db";

export async function GET() {
  try {
    const cupones = await prisma.cupon.findMany({
      orderBy: {createdAt: "desc"},
    });
    return NextResponse.json(cupones);
  } catch (error) {
    return NextResponse.json({error: "Error fetching cupones"}, {status: 500});
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {codigo, descripcion, tipo, valor, minCompra, maxUsos, fechaInicio, fechaFin, activo} = body;

    const cupon = await prisma.cupon.create({
      data: {
        codigo: codigo.toUpperCase(),
        descripcion,
        tipo,
        valor: parseFloat(valor),
        minCompra: minCompra ? parseFloat(minCompra) : null,
        maxUsos: maxUsos ? parseInt(maxUsos) : null,
        fechaInicio: fechaInicio ? new Date(fechaInicio) : null,
        fechaFin: fechaFin ? new Date(fechaFin) : null,
        activo: activo ?? true,
      },
    });

    return NextResponse.json(cupon);
  } catch (error) {
    return NextResponse.json({error: "Error creating cupon"}, {status: 500});
  }
}