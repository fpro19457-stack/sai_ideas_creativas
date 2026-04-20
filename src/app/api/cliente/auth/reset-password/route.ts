import {NextResponse} from "next/server";
import {prisma} from "@/lib/db";
import {hashPassword} from "@/lib/clienteAuth";
import {Resend} from "resend";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const {email} = await request.json();

    if (!email) {
      return NextResponse.json({error: "Email requerido"}, {status: 400});
    }

    const cliente = await prisma.cliente.findUnique({
      where: {email},
    });

    if (!cliente) {
      return NextResponse.json({error: "No existe cuenta con ese email"}, {status: 404});
    }

    const token = crypto.randomBytes(32).toString("hex");

    await prisma.cliente.update({
      where: {id: cliente.id},
      data: {
        tokenVerif: token,
      },
    });

    console.log("Intentando enviar email a:", email);
    console.log("RESEND_API_KEY configurado:", !!process.env.RESEND_API_KEY);
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const result = await resend.emails.send({
        from: "Sai Ideas Creativas <noreply@onresend.com>",
        to: email,
        subject: "Restablecer contraseña — Sai Ideas Creativas",
        html: `
          <div style="font-family: 'DM Sans', sans-serif; background: #FFF8F2; padding: 40px; max-width: 600px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="font-family: 'Playfair Display', serif; color: #5C3D2E; font-size: 24px;">✦ Sai Ideas Creativas</h1>
            </div>
            <div style="background: white; border-radius: 20px; padding: 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
              <h2 style="font-family: 'Playfair Display', serif; color: #5C3D2E;">Restablecer contraseña</h2>
              <p style="color: #5C3D2E;">Recibimos una solicitud para cambiar tu contraseña. Hacé click en el siguiente enlace:</p>
              <a href="${process.env.NEXT_PUBLIC_URL}/cuenta/reset-password?token=${token}" style="display: inline-block; background: #F9C6C9; color: #5C3D2E; padding: 12px 24px; border-radius: 12px; text-decoration: none; margin-top: 20px;">Restablecer mi contraseña</a>
              <p style="color: #737373; font-size: 12px; margin-top: 20px;">Si no pediste este cambio, ignorá este email.</p>
            </div>
          </div>
        `,
      });
      console.log("Resultado de Resend:", result);
    } else {
      console.log("RESEND_API_KEY no está configurado");
    }

    return NextResponse.json({mensaje: "Si el email existe, recibiste un enlace para restablecer la contraseña"});
  } catch (error) {
    console.error("Error en reset password POST:", error);
    return NextResponse.json({error: "Error interno"}, {status: 500});
  }
}

export async function PUT(request: Request) {
  try {
    const {token, password} = await request.json();

    if (!token || !password) {
      return NextResponse.json({error: "Token y contraseña requeridos"}, {status: 400});
    }

    if (password.length < 6) {
      return NextResponse.json({error: "La contraseña debe tener al menos 6 caracteres"}, {status: 400});
    }

    const cliente = await prisma.cliente.findFirst({
      where: {
        tokenVerif: token,
      },
    });

    if (!cliente) {
      return NextResponse.json({error: "Token inválido o expirado"}, {status: 400});
    }

    const hashedPassword = await hashPassword(password);

    await prisma.cliente.update({
      where: {id: cliente.id},
      data: {
        password: hashedPassword,
        tokenVerif: null,
        emailVerificado: true,
      },
    });

    return NextResponse.json({mensaje: "Contraseña actualizada correctamente"});
  } catch (error) {
    console.error("Error en reset password PUT:", error);
    return NextResponse.json({error: "Error interno"}, {status: 500});
  }
}