import {NextResponse} from "next/server";
import {prisma} from "@/lib/db";

export async function GET() {
  try {
    const productos = await prisma.producto.findMany({
      orderBy: {createdAt: "desc"},
    });
    return NextResponse.json(productos);
  } catch (error) {
    return NextResponse.json({error: "Error fetching productos"}, {status: 500});
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {nombre, slug, descripcion, descripcionLarga, tipo, precio, opciones, imagenUrl, activo} = body;

    const producto = await prisma.producto.create({
      data: {
        nombre,
        slug,
        descripcion,
        descripcionLarga,
        tipo,
        precio: parseFloat(precio),
        opciones: opciones || null,
        imagenUrl,
        activo: activo ?? true,
      },
    });

    return NextResponse.json(producto);
  } catch (error) {
    return NextResponse.json({error: "Error creating producto"}, {status: 500});
  }
}