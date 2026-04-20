import {NextResponse} from "next/server";
import {prisma} from "@/lib/db";
import {writeFile, mkdir} from "fs/promises";
import {join} from "path";
import {randomUUID} from "crypto";

const MAGIC_NUMBERS: Record<string, number[]> = {
  "image/jpeg": [0xff, 0xd8, 0xff],
  "image/png": [0x89, 0x50, 0x4e, 0x47],
  "application/pdf": [0x25, 0x50, 0x44, 0x46],
};

function validateMagicNumber(buffer: Buffer, mimeType: string): boolean {
  const magic = MAGIC_NUMBERS[mimeType];
  if (!magic) return true;
  return magic.every((byte, i) => buffer[i] === byte);
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const pedidoId = formData.get("pedidoId") as string;
    const productoNombre = formData.get("productoNombre") as string | null;
    const files = formData.getAll("files") as File[];

    if (!pedidoId) {
      return NextResponse.json({error: "Pedido ID requerido"}, {status: 400});
    }

    if (!files || files.length === 0) {
      return NextResponse.json({error: "No se proporcionaron archivos"}, {status: 400});
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/heic"];
    const maxSize = 20 * 1024 * 1024;

    let uploadDir = join(process.cwd(), "public", "uploads", pedidoId);
    if (productoNombre) {
      const sanitized = productoNombre.replace(/[^a-zA-Z0-9-_]/g, "-").toLowerCase();
      uploadDir = join(uploadDir, sanitized);
    }
    await mkdir(uploadDir, {recursive: true});

    const resultados: {id: string; url: string; nombre: string}[] = [];

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        continue;
      }

      if (file.size > maxSize) {
        continue;
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      if (!validateMagicNumber(buffer, file.type)) {
        continue;
      }

      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const uniqueName = `${randomUUID()}.${ext}`;
      const filePath = join(uploadDir, uniqueName);

      await writeFile(filePath, buffer);

      const urlPath = productoNombre
        ? `/uploads/${pedidoId}/${productoNombre.replace(/[^a-zA-Z0-9-_]/g, "-").toLowerCase()}/${uniqueName}`
        : `/uploads/${pedidoId}/${uniqueName}`;

      const archivo = await prisma.archivo.create({
        data: {
          pedidoId,
          nombre: file.name,
          url: urlPath,
          tamano: file.size,
          tipo: file.type,
        },
      });

      resultados.push({
        id: archivo.id,
        url: archivo.url,
        nombre: archivo.nombre,
      });
    }

    return NextResponse.json({archivos: resultados});
  } catch (error) {
    console.error("Error uploading files:", error);
    return NextResponse.json({error: "Error al subir archivos"}, {status: 500});
  }
}