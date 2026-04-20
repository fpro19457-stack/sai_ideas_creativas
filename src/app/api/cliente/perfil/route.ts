import {NextResponse} from "next/server";
import {getClienteFromRequest, verifyPassword, hashPassword} from "@/lib/clienteAuth";
import {prisma} from "@/lib/db";

export async function GET() {
  try {
    const payload = await getClienteFromRequest();
    if (!payload) {
      return NextResponse.json({error: "No autenticado"}, {status: 401});
    }

    const cliente = await prisma.cliente.findUnique({
      where: {id: payload.clienteId},
      select: {
        id: true,
        email: true,
        nombre: true,
        telefono: true,
        createdAt: true,
      },
    });

    if (!cliente) {
      return NextResponse.json({error: "Cliente no encontrado"}, {status: 404});
    }

    return NextResponse.json(cliente);
  } catch (error) {
    console.error("Error fetching perfil:", error);
    return NextResponse.json({error: "Error al obtener perfil"}, {status: 500});
  }
}

export async function PUT(request: Request) {
  try {
    const payload = await getClienteFromRequest();
    if (!payload) {
      return NextResponse.json({error: "No autenticado"}, {status: 401});
    }

    const body = await request.json();

    if (body.telefono !== undefined) {
      await prisma.cliente.update({
        where: {id: payload.clienteId},
        data: {telefono: body.telefono},
      });
    }

    if (body.nombre !== undefined) {
      await prisma.cliente.update({
        where: {id: payload.clienteId},
        data: {nombre: body.nombre},
      });
    }

    if (body.passwordActual && body.passwordNuevo) {
      const cliente = await prisma.cliente.findUnique({
        where: {id: payload.clienteId},
        select: {password: true},
      });

      if (!cliente) {
        return NextResponse.json({error: "Cliente no encontrado"}, {status: 404});
      }

      const passwordValida = await verifyPassword(body.passwordActual, cliente.password);
      if (!passwordValida) {
        return NextResponse.json({error: "Contraseña actual incorrecta"}, {status: 400});
      }

      const passwordHash = await hashPassword(body.passwordNuevo);
      await prisma.cliente.update({
        where: {id: payload.clienteId},
        data: {password: passwordHash},
      });
    }

    return NextResponse.json({success: true});
  } catch (error) {
    console.error("Error updating perfil:", error);
    return NextResponse.json({error: "Error al actualizar perfil"}, {status: 500});
  }
}