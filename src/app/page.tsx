import Link from "next/link";
import {prisma} from "@/lib/db";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import type {Metadata} from "next";
import {MapPin} from "lucide-react";

export const metadata: Metadata = {
  title: "Fotos y Stickers Personalizados",
  description: "Imprimí tus fotos favoritas, creá stickers únicos y pedidos personalizados. Envíos a todo el país.",
};

const tipoColors: Record<string, "rosa" | "lila" | "menta"> = {
  FOTO: "rosa",
  STICKER: "lila",
  PERSONALIZADO: "menta",
};

async function getProductos() {
  return prisma.producto.findMany({
    where: {activo: true},
    orderBy: {createdAt: "asc"},
    take: 4,
  });
}

function StarParticles() {
  const stars = [
    {top: "8%", left: "12%", size: "14px"},
    {top: "15%", left: "85%", size: "10px"},
    {top: "35%", left: "8%", size: "12px"},
    {top: "55%", left: "90%", size: "14px"},
    {top: "45%", left: "45%", size: "10px"},
    {top: "75%", left: "25%", size: "12px"},
    {top: "65%", left: "75%", size: "14px"},
    {top: "25%", left: "55%", size: "10px"},
    {top: "85%", left: "60%", size: "12px"},
    {top: "12%", left: "35%", size: "14px"},
  ];

  return (
    <>
      {stars.map((star, i) => (
        <div
          key={i}
          className={`star-particle star-${i + 1}`}
          style={{
            top: star.top,
            left: star.left,
            fontSize: star.size,
          }}
        >
          ✦
        </div>
      ))}
    </>
  );
}

export default async function HomePage() {
  const productos = await getProductos();

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="relative overflow-hidden animate-gradient py-20 lg:py-32">
          <StarParticles />

          <div className="absolute top-10 left-10 w-32 h-32 bg-[#D4B8E0]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-[#B8E0D2]/20 rounded-full blur-3xl" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-playfair mb-6 hero-title">
                Tus momentos, hechos arte
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 hero-subtitle">
                Fotos impresas, stickers únicos y productos personalizados con amor.
                Envíos a todo el país.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center hero-buttons">
                <Button asChild size="lg" className="text-base px-8 btn-shimmer">
                  <Link href="/productos">Ver productos</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="text-base px-8"
                >
                  <Link href="/#como-funciona">Cómo funciona</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section id="como-funciona" className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-playfair text-center mb-16">
              ¿Cómo funciona?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="bg-[#F9C6C9]/10 border-0 text-center card-hover">
                <CardContent className="pt-8 pb-6">
                  <div className="text-5xl mb-4">📸</div>
                  <h3 className="text-xl font-playfair mb-2">Elegí tu producto</h3>
                  <p className="text-muted-foreground">
                    Fotos, stickers o personalizado. Encontrá lo que necesitás.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-[#D4B8E0]/10 border-0 text-center card-hover">
                <CardContent className="pt-8 pb-6">
                  <div className="text-5xl mb-4">⬆️</div>
                  <h3 className="text-xl font-playfair mb-2">Subí tus fotos</h3>
                  <p className="text-muted-foreground">
                    Elegí las fotos que querés imprimir y subilas directo desde tu celular.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-[#B8E0D2]/10 border-0 text-center card-hover">
                <CardContent className="pt-8 pb-6">
                  <div className="text-5xl mb-4">🎁</div>
                  <h3 className="text-xl font-playfair mb-2">Recibí en casa</h3>
                  <p className="text-muted-foreground">
                    Te lo enviamos a tu domicilio o lo retirás por nuestro local.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-20 bg-[#FEF0F0]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-playfair mb-4">
                Productos destacados
              </h2>
              <p className="text-muted-foreground">
                Los favoritos de nuestros clientes
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {productos.map((producto, index) => (
                <Card
                  key={producto.id}
                  className="group hover:shadow-lg transition-shadow overflow-hidden product-card"
                >
                  <div className="aspect-square bg-muted relative">
                    {producto.imagenUrl ? (
                      <img
                        src={producto.imagenUrl}
                        alt={producto.nombre}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">
                        ✦
                      </div>
                    )}
                  </div>
                  <CardContent className="pt-4">
                    <Badge variant={tipoColors[producto.tipo]} className="mb-2">
                      {producto.tipo === "FOTO"
                        ? "Foto"
                        : producto.tipo === "STICKER"
                        ? "Sticker"
                        : "Personalizado"}
                    </Badge>
                    <h3 className="font-playfair text-lg mb-1">{producto.nombre}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {producto.descripcion}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-lg">
                        {producto.precio === 0
                          ? "A consultar"
                          : `$${producto.precio.toLocaleString()}`}
                      </p>
                      <Button asChild size="sm">
                        <Link href={`/productos`}>Pedir</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button asChild variant="outline" size="lg">
                <Link href="/productos">Ver todos los productos</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-playfair mb-4">
              ¿Tenés alguna duda?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Encontranos en redes o pasá por nuestro local. Estamos para ayudarte.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="https://instagram.com/saideascreativas"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                @saideascreativas
              </a>
              <span className="hidden sm:block text-muted-foreground">|</span>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-5 h-5" />
                Av. Corrientes 150 - Colonia Elisa - Chaco
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}