import {MetadataRoute} from "next";
import {prisma} from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_URL || "https://saideascreativas.com";

  const productos = await prisma.producto.findMany({
    where: {activo: true},
    select: {slug: true, createdAt: true},
  });

  const rutasEstaticas = [
    {url: baseUrl, lastmod: new Date().toISOString(), changeFrequency: "weekly" as const, priority: 1},
    {url: `${baseUrl}/productos`, lastmod: new Date().toISOString(), changeFrequency: "weekly" as const, priority: 0.9},
  ];

  const rutasProductos = productos.map((p) => ({
    url: `${baseUrl}/productos`,
    lastmod: p.createdAt.toISOString(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...rutasEstaticas, ...rutasProductos];
}