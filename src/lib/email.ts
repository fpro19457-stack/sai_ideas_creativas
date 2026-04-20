import nodemailer from "nodemailer";
import {wrapEmail, emailTable} from "@/lib/emailTemplate";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

function getAdminEmail() {
  return process.env.ADMIN_EMAIL || process.env.GMAIL_USER;
}

async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.log("GMAIL not configured, skipping email");
    return;
  }

  try {
    await transporter.sendMail({
      from: `"SA Ideas Creativas" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

export async function sendEmailConfirmacionPedido(pedido: any) {
  const contenido = `
    <p style="color: #5C3D2E; font-size: 16px;">Hola ${pedido.clienteNombre}!</p>
    <p style="color: #5C3D2E;">Recibimos tu pedido <strong>${pedido.numero}</strong></p>
    <p style="color: #737373;">Te vamos a avisar por email cuando tu pedido avance de estado.</p>
    ${emailTable(
      pedido.items.map((item: any) => ({
        nombre: item.producto?.nombre || "Producto",
        cantidad: item.cantidad,
        precio: item.precio,
      })),
      pedido.descuento,
      pedido.totalFinal
    )}
    <a href="${process.env.NEXT_PUBLIC_URL}/pedido/${pedido.id}" style="display: inline-block; background: #F9C6C9; color: #5C3D2E; padding: 12px 24px; border-radius: 12px; text-decoration: none; margin-top: 20px; font-weight: 500;">Ver seguimiento del pedido</a>
  `;

  await sendEmail(
    pedido.clienteEmail,
    `Tu pedido ${pedido.numero} fue recibido - SA Ideas Creativas`,
    wrapEmail(`Hola ${pedido.clienteNombre}!`, contenido)
  );
}

export async function sendEmailComprobanteRecibido(pedido: any) {
  const contenido = `
    <p style="color: #5C3D2E;">Tu comprobante de transferencia para el pedido <strong>${pedido.numero}</strong> fue recibido.</p>
    <p style="color: #737373;">Estamos verificando tu pago. Te notificaremos cuando esté confirmado.</p>
    <p style="color: #737373; font-size: 12px; margin-top: 20px;">Esto suele tomar unas pocas horas en dias habiles.</p>
  `;

  await sendEmail(
    pedido.clienteEmail,
    `Comprobante recibido - Pedido ${pedido.numero}`,
    wrapEmail("Recibimos tu comprobante!", contenido)
  );
}

export async function sendEmailComprobanteAprobado(pedido: any) {
  const contenido = `
    <p style="color: #5C3D2E;">El comprobante de tu transferencia para el pedido <strong>${pedido.numero}</strong> fue aprobado.</p>
    <p style="color: #737373;">Ya estamos preparando tu pedido.</p>
  `;

  await sendEmail(
    pedido.clienteEmail,
    `Pago confirmado - Pedido ${pedido.numero}`,
    wrapEmail("Tu pago fue verificado!", contenido)
  );
}

export async function sendEmailComprobanteRechazado(pedido: any, motivo: string) {
  const contenido = `
    <p style="color: #5C3D2E;">El comprobante de transferencia para tu pedido <strong>${pedido.numero}</strong> no pudo ser verificado.</p>
    <p style="color: #737373; margin-top: 10px;"><strong>Motivo:</strong> ${motivo}</p>
    <p style="color: #737373; margin-top: 15px;">Por favor, subí un nuevo comprobante desde tu cuenta.</p>
  `;

  await sendEmail(
    pedido.clienteEmail,
    `Comprobante rechazado - Pedido ${pedido.numero}`,
    wrapEmail("Hay un problema con tu comprobante", contenido)
  );
}

export async function sendEmailPedidoEnviado(pedido: any) {
  const contenido = `
    <p style="color: #5C3D2E;"><strong>Courier:</strong> ${pedido.courier || "N/A"}</p>
    <p style="color: #5C3D2E;"><strong>Numero de guia:</strong> ${pedido.guiaTracking || "N/A"}</p>
    <p style="color: #737373;">Tu pedido esta en camino! Segui el link para rastrear tu envio.</p>
  `;

  await sendEmail(
    pedido.clienteEmail,
    `Tu pedido ${pedido.numero} esta en camino - SA Ideas Creativas`,
    wrapEmail("Tu pedido fue enviado!", contenido)
  );
}

export async function sendEmailPedidoListo(pedido: any) {
  const retiroInfo = pedido.tipoEntrega === "RETIRO_LOCAL"
    ? `<p style="color: #5C3D2E;"><strong>Direccion:</strong> ${pedido.direccion || "Consultar con el negocio"}</p>`
    : `<p style="color: #737373;">Tu pedido fue enviado y llegara pronto!</p>`;

  const contenido = `
    <p style="color: #5C3D2E;">${pedido.tipoEntrega === "RETIRO_LOCAL" ? "Podés pasar a retirar tu pedido por nuestro local." : "Tu pedido fue enviado y llegara pronto!"}</p>
    ${retiroInfo}
  `;

  await sendEmail(
    pedido.clienteEmail,
    `Tu pedido ${pedido.numero} esta listo - SA Ideas Creativas`,
    wrapEmail("Tu pedido esta listo!", contenido)
  );
}

export async function sendEmailPagoConfirmado(pedido: any) {
  const contenido = `
    <p style="color: #5C3D2E;">Tu pago en efectivo fue confirmado.</p>
    <p style="color: #737373; margin-top: 10px;">Ya podés pasar a retirar tu pedido por nuestro local.</p>
  `;

  await sendEmail(
    pedido.clienteEmail,
    `Pago confirmado - Pedido ${pedido.numero}`,
    wrapEmail("Pago confirmado!", contenido)
  );
}

export async function sendEmailAdminNuevoPedido(pedido: any) {
  const metodoLabel = pedido.metodoPago === "MERCADOPAGO" ? "MercadoPago"
    : pedido.metodoPago === "TRANSFERENCIA" ? "Transferencia"
    : "Efectivo";

  const entregaLabel = pedido.tipoEntrega === "ENVIO" ? "Envio a domicilio" : "Retiro en local";

  const itemsList = pedido.items.map((item: any) => {
    const subtotal = item.precio * item.cantidad;
    return `• ${item.producto?.nombre || "Producto"} x${item.cantidad} = $${subtotal.toLocaleString()}`;
  }).join("<br>");

  const contenido = `
    <div style="font-family: Arial, sans-serif; background: #FFF8F2; padding: 30px; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #5C3D2E; margin-bottom: 20px;">Nuevo pedido ${pedido.numero}</h2>
      <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <p style="margin: 5px 0;"><strong>Cliente:</strong> ${pedido.clienteNombre}</p>
        <p style="margin: 5px 0;"><strong>Email:</strong> ${pedido.clienteEmail}</p>
        ${pedido.clienteTel ? `<p style="margin: 5px 0;"><strong>Tel:</strong> ${pedido.clienteTel}</p>` : ""}
        <hr style="border: none; border-top: 1px solid #eee; margin: 15px 0;">
        <p style="margin: 5px 0;"><strong>Metodo de pago:</strong> ${metodoLabel}</p>
        <p style="margin: 5px 0;"><strong>Entrega:</strong> ${entregaLabel}</p>
        ${pedido.direccion ? `<p style="margin: 5px 0;"><strong>Direccion:</strong> ${pedido.direccion}</p>` : ""}
        <hr style="border: none; border-top: 1px solid #eee; margin: 15px 0;">
        <p style="margin: 5px 0;"><strong>Productos:</strong></p>
        <p style="margin: 5px 0;">${itemsList}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 15px 0;">
        <p style="margin: 5px 0;"><strong>Subtotal:</strong> $${pedido.totalBruto.toLocaleString()}</p>
        ${pedido.descuento > 0 ? `<p style="margin: 5px 0; color: green;"><strong>Descuento:</strong> -$${pedido.descuento.toLocaleString()}</p>` : ""}
        <p style="margin: 5px 0; font-size: 18px;"><strong>Total:</strong> $${pedido.totalFinal.toLocaleString()}</p>
      </div>
      <a href="${process.env.NEXT_PUBLIC_URL}/admin/pedidos/${pedido.id}" style="display: inline-block; background: #F9C6C9; color: #5C3D2E; padding: 12px 24px; border-radius: 12px; text-decoration: none; margin-top: 20px; font-weight: 500;">Ver pedido en admin</a>
    </div>
  `;

  await sendEmail(
    getAdminEmail(),
    `Nuevo pedido ${pedido.numero} - ${pedido.clienteNombre}`,
    contenido
  );
}