import {NextResponse} from "next/server";
import {prisma} from "@/lib/db";
import {unlink} from "fs/promises";
import {join} from "path";

export async function DELETE(
  request: Request,
  {params}: {params: Promise<{archivoId: string}>}
) {
  try {
    const {archivoId} = await params;

    const archivo = await prisma.archivo.findUnique({
      where: {id: archivoId},
    });

    if (!archivo) {
      return NextResponse.json({error: "Archivo no encontrado"}, {status: 404});
    }

    const filePath = join(process.cwd(), "public", archivo.url);
    try {
      await unlink(filePath);
    } catch {
      // File may not exist on disk
    }

    await prisma.archivo.delete({
      where: {id: archivoId},
    });

    return NextResponse.json({mensaje: "Archivo eliminado"});
  } catch (error) {
    console.error("Error deleting archivo:", error);
    return NextResponse.json({error: "Error al eliminar archivo"}, {status: 500});
  }
}