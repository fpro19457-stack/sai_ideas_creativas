import {NextResponse} from "next/server";
import {prisma} from "@/lib/db";
import {readFile} from "fs/promises";
import {join} from "path";
import JSZip from "jszip";

export async function GET(request: Request, {params}: {params: Promise<{id: string}>}) {
  try {
    const {id} = await params;

    const pedido = await prisma.pedido.findUnique({
      where: {id},
      include: { archivos: true },
    });

    if (!pedido) {
      return NextResponse.json({error: "Pedido no encontrado"}, {status: 404});
    }

    if (!pedido.archivos || pedido.archivos.length === 0) {
      return NextResponse.json({error: "No hay archivos"}, {status: 404});
    }

    const zip = new JSZip();

    for (const archivo of pedido.archivos) {
      try {
        const rutaFisica = join(process.cwd(), "public", archivo.url);
        console.log("Leyendo:", rutaFisica);
        const buffer = await readFile(rutaFisica);

        const partes = archivo.url.split("/");
        const nombreArchivo = partes.pop() || archivo.nombre;
        const carpeta = partes.slice(3).join("/");

        if (carpeta) {
          zip.folder(carpeta)?.file(nombreArchivo, buffer);
        } else {
          zip.file(nombreArchivo, buffer);
        }
      } catch (e) {
        console.error("Error leyendo:", archivo.url, e);
      }
    }

    const zipBuffer = await zip.generateAsync({type: "nodebuffer"});

    return new NextResponse(zipBuffer as any, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="fotos-${pedido.numero}.zip"`,
      },
    });
  } catch (error) {
    console.error("Error ZIP:", error);
    return NextResponse.json({error: "Error al crear ZIP"}, {status: 500});
  }
}