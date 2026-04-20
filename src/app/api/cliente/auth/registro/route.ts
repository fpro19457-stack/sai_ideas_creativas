import {NextResponse} from "next/server";
import {prisma} from "@/lib/db";
import {hashPassword} from "@/lib/clienteAuth";
import {registroSchema, validateOrThrow} from "@/lib/schemas";
import {sanitizeText} from "@/lib/security";
import {Resend} from "resend";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let validated: {nombre: string; email: string; password: string};
    try {
      validated = validateOrThrow(registroSchema, body);
    } catch (err: any) {
      return NextResponse.json(err.error || {error: "Datos inválidos"}, {status: err.status || 400});
    }

    const {nombre, email, password} = validated;
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
        password: hashedPassword,
        tokenVerif,
        emailVerificado: false,
      },
    });

    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "Sai Ideas Creativas <noreply@onresend.com>",
        to: email,
        subject: "Verificá tu email — Sai Ideas Creativas",
        html: `
          <div style="font-family: 'DM Sans', sans-serif; background: #FFF8F2; padding: 40px; max-width: 600px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="font-family: 'Playfair Display', serif; color: #5C3D2E; font-size: 24px;">✦ Sai Ideas Creativas</h1>
            </div>
            <div style="background: white; border-radius: 20px; padding: 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
              <h2 style="font-family: 'Playfair Display', serif; color: #5C3D2E;">¡Bienvenidx, ${nombre}! 🎉</h2>
              <p style="color: #5C3D2E;">Gracias por crear tu cuenta. Por favor verificá tu email haciendo click en el siguiente enlace:</p>
              <a href="${process.env.NEXT_PUBLIC_URL}/cuenta/verificar?token=${tokenVerif}" style="display: inline-block; background: #F9C6C9; color: #5C3D2E; padding: 12px 24px; border-radius: 12px; text-decoration: none; margin-top: 20px;">Verificar mi email</a>
            </div>
            <p style="text-align: center; color: #737373; font-size: 12px; margin-top: 30px;">Hecho con 💕 por Sai Ideas Creativas</p>
          </div>
        `,
      });
    }

    return NextResponse.json({
      mensaje: "Revisá tu email para verificar tu cuenta",
    });
  } catch (error) {
    console.error("Error en registro:", error);
    return NextResponse.json({error: "Error en el registro"}, {status: 500});
  }
}