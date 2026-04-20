import {NextResponse} from "next/server";
import {prisma} from "@/lib/db";
import {rename, readdir, mkdir} from "fs/promises";
import {join} from "path";

export async function PATCH(request: Request) {
  try {
    const {tempId, pedidoId} = await request.json();

    if (!tempId || !pedidoId) {
      return NextResponse.json({error: "tempId y pedidoId son requeridos"}, {status: 400});
    }

    await prisma.archivo.updateMany({
      where: {pedidoId: tempId},
      data: {pedidoId},
    });

    const tempDir = join(process.cwd(), "public", "uploads", tempId);
    const pedidoDir = join(process.cwd(), "public", "uploads", pedidoId);

    try {
      await mkdir(pedidoDir, {recursive: true});
      const files = await readdir(tempDir);
      for (const file of files) {
        await rename(join(tempDir, file), join(pedidoDir, file));
      }
    } catch {
    }

    return NextResponse.json({success: true});
  } catch (error) {
    console.error("Error reasignando archivos:", error);
    return NextResponse.json({error: "Error al reasignar archivos"}, {status: 500});
  }
}