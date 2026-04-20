import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function uploadFile(file: File, subfolder: string): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = join(process.cwd(), "public", "uploads", subfolder);
  await mkdir(uploadDir, { recursive: true });

  const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2)}${getExtension(file.name)}`;
  const filePath = join(uploadDir, uniqueName);
  await writeFile(filePath, buffer);

  return `/uploads/${subfolder}/${uniqueName}`;
}

function getExtension(filename: string): string {
  const ext = filename.split(".").pop();
  return ext ? `.${ext}` : "";
}