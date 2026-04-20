import {NextResponse} from "next/server";
import {prisma} from "@/lib/db";
import jwt from "jsonwebtoken";
import {cookies} from "next/headers";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "fallback-secret";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("admin-session")?.value;

    if (!adminSession) {
      return NextResponse.json({error: "No autenticado"}, {status: 401});
    }

    let tokenData;
    try {
      tokenData = jwt.verify(adminSession, JWT_SECRET) as {email: string};
    } catch {
      return NextResponse.json({error: "Sesión inválida"}, {status: 401});
    }

    const admin = await prisma.adminUser.findUnique({
      where: {email: tokenData.email},
      select: {id: true, email: true, role: true},
    });

    if (!admin) {
      return NextResponse.json({error: "Admin no encontrado"}, {status: 404});
    }

    return NextResponse.json(admin);
  } catch (error) {
    console.error("Error fetching admin perfil:", error);
    return NextResponse.json({error: "Error al obtener perfil"}, {status: 500});
  }
}

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("admin-session")?.value;

    if (!adminSession) {
      return NextResponse.json({error: "No autenticado"}, {status: 401});
    }

    let tokenData;
    try {
      tokenData = jwt.verify(adminSession, JWT_SECRET) as {email: string};
    } catch {
      return NextResponse.json({error: "Sesión inválida"}, {status: 401});
    }

    const body = await request.json();
    const {passwordActual, passwordNuevo} = body;

    if (!passwordActual || !passwordNuevo) {
      return NextResponse.json({error: "Contraseñas requeridas"}, {status: 400});
    }

    if (passwordNuevo.length < 6) {
      return NextResponse.json({error: "La contraseña debe tener al menos 6 caracteres"}, {status: 400});
    }

    const admin = await prisma.adminUser.findUnique({
      where: {email: tokenData.email},
      select: {id: true, password: true},
    });

    if (!admin) {
      return NextResponse.json({error: "Admin no encontrado"}, {status: 404});
    }

    const passwordValida = await bcrypt.compare(passwordActual, admin.password);
    if (!passwordValida) {
      return NextResponse.json({error: "Contraseña actual incorrecta"}, {status: 400});
    }

    const passwordHash = await bcrypt.hash(passwordNuevo, 12);
    await prisma.adminUser.update({
      where: {id: admin.id},
      data: {password: passwordHash},
    });

    return NextResponse.json({success: true});
  } catch (error) {
    console.error("Error updating admin perfil:", error);
    return NextResponse.json({error: "Error al actualizar"}, {status: 500});
  }
}