import {NextResponse} from "next/server";
import {prisma} from "@/lib/db";
import {auth} from "@/lib/auth";
import {getClienteFromRequest} from "@/lib/clienteAuth";
import {generateComprobantePDF} from "@/lib/comprobante";
import {readFile} from "fs/promises";
import {join} from "path";

export async function GET(
  request: Request,
  {params}: {params: Promise<{id: string}>}
) {
  try {
    const {id} = await params;

    const clientePayload = await getClienteFromRequest();
    const adminSession = await auth();

    if (!clientePayload && !adminSession) {
      return NextResponse.json({error: "No autorizado"}, {status: 401});
    }

    const pedido = await prisma.pedido.findUnique({
      where: {id},
      include: {cliente: true},
    });

    if (!pedido) {
      return NextResponse.json({error: "Pedido no encontrado"}, {status: 404});
    }

    if (adminSession) {
    } else if (clientePayload?.clienteId !== pedido.clienteId) {
      return NextResponse.json({error: "No autorizado"}, {status: 403});
    }

    const filePath = join(process.cwd(), "public", "comprobantes", `${id}.pdf`);

    let pdfBuffer: Buffer;
    try {
      pdfBuffer = await readFile(filePath);
    } catch {
      const pdfPath = await generateComprobantePDF(id);
      pdfBuffer = await readFile(join(process.cwd(), "public", pdfPath));
    }

    const fileName = `comprobante-${pedido.numero}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("Error generating comprobante:", error);
    return NextResponse.json({error: "Error al generar comprobante"}, {status: 500});
  }
}