import {NextResponse} from "next/server";
import {prisma} from "@/lib/db";

export async function GET(request: Request) {
  try {
    const {searchParams} = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({error: "Token requerido"}, {status: 400});
    }

    const cliente = await prisma.cliente.findFirst({
      where: {tokenVerif: token},
    });

    if (!cliente) {
      return NextResponse.json({error: "Token inválido o expirado"}, {status: 400});
    }

    await prisma.cliente.update({
      where: {id: cliente.id},
      data: {
        emailVerificado: true,
        tokenVerif: null,
      },
    });

    return NextResponse.json({mensaje: "Email verificado correctamente"});
  } catch (error) {
    console.error("Error verificando email:", error);
    return NextResponse.json({error: "Error al verificar email"}, {status: 500});
  }
}