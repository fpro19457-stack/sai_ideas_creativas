import {Metadata} from "next";
import {notFound} from "next/navigation";
import {prisma} from "@/lib/db";
import {Card, CardContent} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import AddToCartButton from "@/components/shared/AddToCartButton";

interface Props {
  params: Promise<{slug: string}>;
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {slug} = await params;
  const producto = await prisma.producto.findUnique({
    where: {slug},
  });

  if (!producto) {
    return {title: "Producto no encontrado"};
  }

  return {
    title: producto.metaTitle || producto.nombre,
    description: producto.metaDesc || producto.descripcion || `${producto.nombre} - Personalizado en Sai Ideas Creativas`,
    openGraph: {
      images: producto.imagenUrl ? [producto.imagenUrl] : [],
    },
  };
}

export default async function ProductoPage({params}: Props) {
  const {slug} = await params;
  const producto = await prisma.producto.findUnique({
    where: {slug},
  });

  if (!producto || !producto.activo) {
    notFound();
  }

  const tipoColors: Record<string, "rosa" | "lila" | "menta"> = {
    FOTO: "rosa",
    STICKER: "lila",
    PERSONALIZADO: "menta",
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="aspect-square bg-muted">
              {producto.imagenUrl ? (
                <img
                  src={producto.imagenUrl}
                  alt={producto.nombre}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl">✦</div>
              )}
            </div>
            <CardContent className="flex flex-col justify-center p-8">
              <Badge variant={tipoColors[producto.tipo]} className="w-fit mb-4">
                {producto.tipo === "FOTO" ? "Foto" : producto.tipo === "STICKER" ? "Sticker" : "Personalizado"}
              </Badge>
              <h1 className="text-3xl font-playfair mb-4">{producto.nombre}</h1>
              {producto.descripcion && (
                <p className="text-muted-foreground mb-6">{producto.descripcion}</p>
              )}
              {producto.descripcionLarga && (
                <p className="text-muted-foreground mb-6">{producto.descripcionLarga}</p>
              )}
              <p className="text-3xl font-bold mb-6">
                {producto.precio === 0 ? "A consultar" : `$${producto.precio.toLocaleString()}`}
              </p>
              <AddToCartButton producto={producto} />
            </CardContent>
          </div>
        </Card>
      </div>
    </div>
  );
}