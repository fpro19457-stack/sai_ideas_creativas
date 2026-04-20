import {NextResponse} from "next/server";
import {prisma} from "@/lib/db";
import {signClienteToken, verifyPassword} from "@/lib/clienteAuth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {email, password} = body;

    if (!email || !password) {
      return NextResponse.json({error: "Email y contraseña son requeridos"}, {status: 400});
    }

    const cliente = await prisma.cliente.findUnique({where: {email}});

    if (!cliente) {
      return NextResponse.json({error: "Email o contraseña incorrectos"}, {status: 401});
    }

    if (!cliente.emailVerificado) {
      return NextResponse.json({error: "Verificá tu email antes de continuar"}, {status: 401});
    }

    const isValid = await verifyPassword(password, cliente.password);
    if (!isValid) {
      return NextResponse.json({error: "Email o contraseña incorrectos"}, {status: 401});
    }

    const token = signClienteToken(cliente.id, cliente.email);

    const response = NextResponse.json({nombre: cliente.nombre, email: cliente.email});

    response.cookies.set("cliente-session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return NextResponse.json({error: "Error en el login"}, {status: 500});
  }
}