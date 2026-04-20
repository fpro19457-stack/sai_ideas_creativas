import {PrismaClient} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 12);

  const admin = await prisma.adminUser.upsert({
    where: {email: "admin@saideascreativas.com"},
    update: {},
    create: {
      email: "admin@saideascreativas.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  console.log("Admin created:", admin.email);

  const productos = [
    {
      nombre: "Pack 10 fotos 10x15",
      slug: "pack-10-fotos-10x15",
      descripcion: "Pack de 10 fotos impresas en tamaño 10x15cm",
      descripcionLarga: "Fotos impresas en papel fotográfico de alta calidad. Tamaño 10x15cm, ideal para regalar o enmarcar.",
      tipo: "FOTO",
      precio: 2500,
      activo: true,
    },
    {
      nombre: "Pack 20 fotos 10x15",
      slug: "pack-20-fotos-10x15",
      descripcion: "Pack de 20 fotos impresas en tamaño 10x15cm",
      descripcionLarga: "Fotos impresas en papel fotográfico de alta calidad. Tamaño 10x15cm, ideal para regalar o enmarcar.",
      tipo: "FOTO",
      precio: 4500,
      activo: true,
    },
    {
      nombre: "Pack 50 fotos 10x15",
      slug: "pack-50-fotos-10x15",
      descripcion: "Pack de 50 fotos impresas en tamaño 10x15cm",
      descripcionLarga: "Fotos impresas en papel fotográfico de alta calidad. Tamaño 10x15cm, ideal para regalar o enmarcar.",
      tipo: "FOTO",
      precio: 8500,
      activo: true,
    },
    {
      nombre: "Planchas de stickers",
      slug: "planchas-stickers",
      descripcion: "Stickers personalizados cortados en planchas",
      descripcionLarga: "Stickers cortados en planchas de vinilo de alta calidad. Perfectos para decorar libretas, laptops o cualquier superficie.",
      tipo: "STICKER",
      precio: 1800,
      activo: true,
    },
    {
      nombre: "Pedido personalizado",
      slug: "pedido-personalizado",
      descripcion: "Tu idea, hacerla realidad",
      descripcionLarga: "Contame qué tenés en mente y lo hacemos realidad. Fotos en diferentes tamaños, cuadernos personalizados, laminas y más.",
      tipo: "PERSONALIZADO",
      precio: 0,
      activo: true,
    },
  ];

  for (const producto of productos) {
    await prisma.producto.upsert({
      where: {slug: producto.slug},
      update: {},
      create: producto,
    });
  }

  console.log("Productos creados:", productos.length);

  const cupones = [
    {
      codigo: "CUMPLE20",
      descripcion: "20% de descuento de cumpleaños",
      tipo: "PORCENTAJE",
      valor: 20,
      activo: true,
    },
    {
      codigo: "BIENVENIDA10",
      descripcion: "$10 off en tu primera compra",
      tipo: "MONTO_FIJO",
      valor: 10,
      activo: true,
    },
  ];

  for (const cupon of cupones) {
    await prisma.cupon.upsert({
      where: {codigo: cupon.codigo},
      update: {},
      create: cupon,
    });
  }

  console.log("Cupones creados:", cupones.length);

  await prisma.configuracion.upsert({
    where: {id: "default"},
    update: {},
    create: {
      id: "default",
      datos: {
        metodosPago: {
          mercadopago: true,
          transferencia: true,
          efectivo: true,
        },
        entrega: {
          retiroLocal: {
            activo: true,
            direccion: "Av. Ejemplo 123, Buenos Aires",
            horarios: "Lunes a Viernes 10-18hs",
          },
          envio: {
            activo: true,
            costos: {
              CABA: {min: 1000, max: 1499, costo: 500},
              GBA: {min: 1500, max: 1999, costo: 800},
              INTERIOR: {min: 2000, max: 9999, costo: 1500},
            },
          },
        },
        datosBancarios: {
          cbu: "",
          alias: "",
          titular: "",
          banco: "",
        },
        whatsapp: "5491112345678",
      },
    },
  });

  console.log("Configuracion inicial creada");

  console.log("\nListo! Admin: admin@saideascreativas.com / admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });