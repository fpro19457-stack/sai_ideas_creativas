import {NextResponse} from "next/server";
import {prisma} from "@/lib/db";

export async function GET(request: Request, {params}: {params: Promise<{id: string}>}) {
  const {id} = await params;
  try {
    const producto = await prisma.producto.findUnique({where: {id}});
    if (!producto) {
      return NextResponse.json({error: "Producto no encontrado"}, {status: 404});
    }
    return NextResponse.json(producto);
  } catch (error) {
    return NextResponse.json({error: "Error fetching producto"}, {status: 500});
  }
}

export async function PUT(request: Request, {params}: {params: Promise<{id: string}>}) {
  const {id} = await params;
  try {
    const body = await request.json();
    const updateData: any = {};
    if (body.nombre !== undefined) updateData.nombre = body.nombre;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.descripcion !== undefined) updateData.descripcion = body.descripcion === "" ? null : body.descripcion;
    if (body.tipo !== undefined) updateData.tipo = body.tipo;
    if (body.precio !== undefined) updateData.precio = parseFloat(body.precio);
    if (body.imagenUrl !== undefined) updateData.imagenUrl = body.imagenUrl;
    if (body.activo !== undefined) updateData.activo = body.activo;
    if (body.requiereFotos !== undefined) updateData.requiereFotos = body.requiereFotos;
    if (body.cantidadFotos !== undefined) updateData.cantidadFotos = body.cantidadFotos > 0 ? body.cantidadFotos : null;
    const producto = await prisma.producto.update({
      where: {id},
      data: updateData,
    });
    return NextResponse.json(producto);
  } catch (error) {
    console.error("Error updating producto:", error);
    return NextResponse.json({error: "Error updating producto", details: String(error)}, {status: 500});
  }
}

export async function DELETE(request: Request, {params}: {params: Promise<{id: string}>}) {
  const {id} = await params;
  try {
    await prisma.producto.delete({where: {id}});
    return NextResponse.json({success: true});
  } catch (error) {
    return NextResponse.json({error: "Error deleting producto"}, {status: 500});
  }
}