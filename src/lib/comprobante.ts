import {PDFDocument, StandardFonts, rgb, PDFPage, PDFFont} from "pdf-lib";
import {prisma} from "@/lib/db";
import {writeFile, mkdir, readFile as fsReadFile} from "fs/promises";
import {join} from "path";

const ROSE_BG = rgb(0.976, 0.776, 0.788);
const WHITE = rgb(1, 1, 1);
const DARK = rgb(0.361, 0.239, 0.180);
const GRAY = rgb(0.5, 0.5, 0.5);
const LIGHT_ROSE = rgb(0.99, 0.95, 0.95);
const LIGHT_GRAY = rgb(0.95, 0.95, 0.95);

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const MARGIN = 50;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

async function ensureDir(dir: string) {
  await mkdir(dir, {recursive: true});
}

function drawSeparator(page: PDFPage, y: number, x: number, width: number) {
  page.drawLine({
    start: {x, y},
    end: {x: x + width, y},
    thickness: 0.5,
    color: LIGHT_GRAY,
  });
}

function drawRightAlignedText(
  page: PDFPage,
  text: string,
  font: PDFFont,
  fontSize: number,
  rightX: number,
  y: number,
  color: any
) {
  const textWidth = font.widthOfTextAtSize(text, fontSize);
  page.drawText(text, {
    x: rightX - textWidth,
    y,
    size: fontSize,
    font,
    color,
  });
}

function drawLabelValue(
  page: PDFPage,
  label: string,
  value: string,
  labelFont: PDFFont,
  valueFont: PDFFont,
  labelSize: number,
  valueSize: number,
  x: number,
  y: number,
  labelColor: any,
  valueColor: any
) {
  page.drawText(label, {x, y, size: labelSize, font: labelFont, color: labelColor});
  const labelWidth = labelFont.widthOfTextAtSize(label, labelSize);
  page.drawText(value, {x: x + labelWidth + 5, y, size: valueSize, font: valueFont, color: valueColor});
}

export async function generateComprobantePDF(pedidoId: string): Promise<string> {
  const pedido = await prisma.pedido.findUnique({
    where: {id: pedidoId},
    include: {
      items: {include: {producto: true}},
      cupon: true,
    },
  });

  if (!pedido) throw new Error("Pedido no encontrado");

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);

  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  let y = PAGE_HEIGHT - MARGIN;

  page.drawText("SA Ideas Creativas", {
    x: MARGIN,
    y,
    size: 20,
    font: boldFont,
    color: DARK,
  });
  y -= 28;

  page.drawText("Comprobante de compra", {
    x: MARGIN,
    y,
    size: 12,
    font: regularFont,
    color: GRAY,
  });
  y -= 25;

  drawSeparator(page, y, MARGIN, CONTENT_WIDTH);
  y -= 20;

  const labelSize = 10;
  const valueSize = 11;

  drawLabelValue(page, "N. Comprobante:", `COM-${pedido.numero}`, boldFont, boldFont, labelSize, valueSize, MARGIN, y, GRAY, DARK);
  y -= 18;

  const fecha = new Date(pedido.creadoEn).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  drawLabelValue(page, "Fecha:", fecha, boldFont, regularFont, labelSize, valueSize, MARGIN, y, GRAY, DARK);
  y -= 18;

  drawLabelValue(page, "Cliente:", pedido.clienteNombre, boldFont, regularFont, labelSize, valueSize, MARGIN, y, GRAY, DARK);
  y -= 18;

  drawLabelValue(page, "Email:", pedido.clienteEmail, boldFont, regularFont, labelSize, valueSize, MARGIN, y, GRAY, DARK);
  y -= 35;

  const tableHeaderY = y;
  page.drawRectangle({
    x: MARGIN,
    y: tableHeaderY - 14,
    width: CONTENT_WIDTH,
    height: 18,
    color: ROSE_BG,
  });

  const colX = {
    producto: MARGIN + 5,
    cantidad: MARGIN + 280,
    precio: MARGIN + 340,
    subtotal: MARGIN + 420,
  };

  page.drawText("Producto", {x: colX.producto, y: tableHeaderY - 11, size: 9, font: boldFont, color: DARK});
  drawRightAlignedText(page, "Cant.", boldFont, 9, MARGIN + 330, tableHeaderY - 11, DARK);
  drawRightAlignedText(page, "P. Unit.", boldFont, 9, MARGIN + 400, tableHeaderY - 11, DARK);
  drawRightAlignedText(page, "Subtotal", boldFont, 9, MARGIN + 495, tableHeaderY - 11, DARK);

  y -= 22;

  pedido.items.forEach((item, i) => {
    const subtotal = item.precio * item.cantidad;
    const isAlt = i % 2 === 1;

    if (isAlt) {
      page.drawRectangle({
        x: MARGIN,
        y: y - 12,
        width: CONTENT_WIDTH,
        height: 16,
        color: LIGHT_ROSE,
      });
    }

    const productoNombre = (item.producto?.nombre || "Producto").substring(0, 35);
    page.drawText(productoNombre, {x: colX.producto, y: y - 10, size: 9, font: regularFont, color: rgb(0.2, 0.2, 0.2)});
    drawRightAlignedText(page, item.cantidad.toString(), regularFont, 9, MARGIN + 330, y - 10, rgb(0.2, 0.2, 0.2));
    drawRightAlignedText(page, `$${item.precio.toLocaleString()}`, regularFont, 9, MARGIN + 400, y - 10, rgb(0.2, 0.2, 0.2));
    drawRightAlignedText(page, `$${subtotal.toLocaleString()}`, regularFont, 9, MARGIN + 495, y - 10, rgb(0.2, 0.2, 0.2));

    y -= 16;
  });

  y -= 15;
  drawSeparator(page, y, MARGIN + 300, CONTENT_WIDTH - 300);
  y -= 15;

  const totalsX = MARGIN + 300;
  const totalsWidth = CONTENT_WIDTH - 300;

  page.drawText("Subtotal:", {x: totalsX, y, size: 10, font: regularFont, color: GRAY});
  const subtotalStr = `$${pedido.totalBruto.toLocaleString()}`;
  drawRightAlignedText(page, subtotalStr, regularFont, 10, MARGIN + 495, y, DARK);
  y -= 16;

  if (pedido.descuento > 0) {
    const codigo = pedido.cupon?.codigo || "";
    page.drawText(`Descuento (${codigo}):`, {x: totalsX, y, size: 10, font: regularFont, color: rgb(0.2, 0.6, 0.2)});
    const descuentoStr = `-$${pedido.descuento.toLocaleString()}`;
    drawRightAlignedText(page, descuentoStr, regularFont, 10, MARGIN + 495, y, rgb(0.2, 0.6, 0.2));
    y -= 16;
  }

  page.drawText("TOTAL:", {x: totalsX, y, size: 13, font: boldFont, color: DARK});
  const totalStr = `$${pedido.totalFinal.toLocaleString()}`;
  drawRightAlignedText(page, totalStr, boldFont, 13, MARGIN + 495, y, DARK);
  y -= 30;

  drawSeparator(page, y, MARGIN, CONTENT_WIDTH);
  y -= 20;

  drawLabelValue(page, "Metodo de pago:", pedido.metodoPago === "MERCADOPAGO" ? "MercadoPago" : pedido.metodoPago === "TRANSFERENCIA" ? "Transferencia bancaria" : "Efectivo", boldFont, regularFont, labelSize, valueSize, MARGIN, y, GRAY, DARK);
  y -= 18;

  drawLabelValue(page, "Estado:", "Pagado", boldFont, boldFont, labelSize, valueSize, MARGIN, y, GRAY, rgb(0.2, 0.6, 0.2));
  y -= 40;

  page.drawText("Gracias por tu compra!", {
    x: MARGIN,
    y,
    size: 12,
    font: boldFont,
    color: DARK,
  });
  y -= 16;
  page.drawText("Sai Ideas Creativas - @saideascreativas", {
    x: MARGIN,
    y,
    size: 9,
    font: regularFont,
    color: GRAY,
  });

  const pdfBytes = await pdfDoc.save();

  const uploadDir = join(process.cwd(), "public", "comprobantes");
  await ensureDir(uploadDir);

  const filePath = join(uploadDir, `${pedidoId}.pdf`);
  await writeFile(filePath, pdfBytes);

  return `/comprobantes/${pedidoId}.pdf`;
}