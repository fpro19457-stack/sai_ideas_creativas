export function wrapEmail(titulo: string, contenido: string, footerExtra?: string): string {
  const instagramUrl = "https://instagram.com/saideascreativas";
  const whatsappUrl = "https://wa.me/5491100000000";
  const baseUrl = process.env.NEXT_PUBLIC_URL || "https://saideascreativas.com";

  return `
<div style="font-family: 'DM Sans', Arial, sans-serif; background: #FFF8F2; padding: 40px; max-width: 600px; margin: 0 auto;">
  <div style="text-align: center; margin-bottom: 30px; background: #F9C6C9; padding: 30px; border-radius: 20px;">
    <h1 style="font-family: Georgia, 'Times New Roman', serif; color: #5C3D2E; font-size: 28px; margin: 0;">✦ SA Ideas Creativas</h1>
  </div>
  <div style="background: white; border-radius: 20px; padding: 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
    <h2 style="font-family: Georgia, 'Times New Roman', serif; color: #5C3D2E; font-size: 22px; margin-top: 0;">${titulo}</h2>
    ${contenido}
  </div>
  <div style="text-align: center; margin-top: 30px;">
    <p style="color: #737373; font-size: 14px; margin-bottom: 15px;">
      <a href="${instagramUrl}" style="color: #D4B8E0; text-decoration: none; margin: 0 10px;">📸 Instagram</a>
      <a href="${whatsappUrl}" style="color: #B8E0D2; text-decoration: none; margin: 0 10px;">💬 WhatsApp</a>
      <a href="${baseUrl}" style="color: #5C3D2E; text-decoration: none; margin: 0 10px;">🌐 Web</a>
    </p>
    <p style="color: #737373; font-size: 12px;">${footerExtra || "Hecho con 💕 por SA Ideas Creativas"}</p>
  </div>
</div>
  `.trim();
}

export function emailTable(items: {nombre: string; cantidad: number; precio: number}[], descuento = 0, total: number, showDescuento = true): string {
  const rows = items.map((item) => `
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 10px; font-size: 14px;">${item.nombre} x${item.cantidad}</td>
      <td style="padding: 10px; text-align: right; font-size: 14px;">$${(item.precio * item.cantidad).toLocaleString()}</td>
    </tr>
  `).join("");

  const descuentoRow = descuento > 0 && showDescuento ? `
    <tr>
      <td style="padding: 10px; color: #22c55e; font-size: 14px;">Descuento</td>
      <td style="padding: 10px; text-align: right; color: #22c55e; font-size: 14px;">-$${descuento.toLocaleString()}</td>
    </tr>
  ` : "";

  return `
<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
  ${rows}
  ${descuentoRow}
  <tr style="font-weight: bold; font-size: 16px;">
    <td style="padding: 15px 10px 5px;">Total</td>
    <td style="padding: 15px 10px 5px; text-align: right;">$${total.toLocaleString()}</td>
  </tr>
</table>
  `.trim();
}