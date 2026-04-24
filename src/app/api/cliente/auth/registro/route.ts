import {NextResponse} from "next/server";
import {prisma} from "@/lib/db";
import {hashPassword} from "@/lib/clienteAuth";
import {registroSchema, validateOrThrow} from "@/lib/schemas";
import {sanitizeText} from "@/lib/security";
import {sendEmailVerificacion} from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let validated: {nombre: string; email: string; password: string};
    try {
      validated = validateOrThrow(registroSchema, body);
    } catch (err: any) {
      return NextResponse.json(err.error || {error: "Datos inválidos"}, {status: err.status || 400});
    }

    const {nombre, email, telefono, password} = validated;
    const sanitizedNombre = sanitizeText(nombre, 100);

    const existingCliente = await prisma.cliente.findUnique({
      where: {email},
    });

    if (existingCliente) {
      return NextResponse.json({error: "Este email ya está registrado"}, {status: 400});
    }

    const hashedPassword = await hashPassword(password);
    const tokenVerif = globalThis.crypto.randomUUID().replace(/-/g, "") + globalThis.crypto.randomUUID().replace(/-/g, "");

    const cliente = await prisma.cliente.create({
      data: {
        nombre: sanitizedNombre,
        email,
        telefono: telefono || null,
        password: hashedPassword,
        tokenVerif,
        emailVerificado: false,
      },
    });

    await sendEmailVerificacion(email, nombre, tokenVerif);

    return NextResponse.json({
      mensaje: "Revisá tu email para verificar tu cuenta",
    });
  } catch (error) {
    console.error("Error en registro:", error);
    return NextResponse.json({error: "Error en el registro"}, {status: 500});
  }
}