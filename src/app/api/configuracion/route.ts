import {NextResponse} from "next/server";
import {prisma} from "@/lib/db";
import {getToken} from "next-auth/jwt";

export async function GET() {
  try {
    const config = await prisma.configuracion.findUnique({
      where: {id: "default"},
    });

    if (!config) {
      return NextResponse.json({datos: null}, {status: 404});
    }

    return NextResponse.json(config.datos);
  } catch (error) {
    return NextResponse.json({error: "Error fetching config"}, {status: 500});
  }
}

export async function PUT(request: Request) {
  try {
    const token = await getToken({req: request as any, secret: process.env.NEXTAUTH_SECRET});
    if (!token) {
      return NextResponse.json({error: "No autorizado"}, {status: 401});
    }

    const body = await request.json();

    const config = await prisma.configuracion.upsert({
      where: {id: "default"},
      update: {datos: body},
      create: {id: "default", datos: body},
    });

    return NextResponse.json(config.datos);
  } catch (error) {
    return NextResponse.json({error: "Error updating config"}, {status: 500});
  }
}