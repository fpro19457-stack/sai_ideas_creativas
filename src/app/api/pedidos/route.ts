import {NextResponse} from "next/server";
import {prisma} from "@/lib/db";
import {sendEmailConfirmacionPedido, sendEmailAdminNuevoPedido} from "@/lib/email";
import {getClienteFromRequest} from "@/lib/clienteAuth";
import {checkoutSchema, validateOrThrow} from "@/lib/schemas";
import {sanitizeText} from "@/lib/security";

export async function GET(request: Request) {
  try {
    const {searchParams} = new URL(request.url);
    const estado = searchParams.get("estado");
    const tipoEntrega = searchParams.get("tipoEntrega");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 20;

    const where: any = {};

    if (estado && estado !== "all") {
      where.estado = estado;
    }

    if (tipoEntrega && tipoEntrega !== "all") {
      where.tipoEntrega = tipoEntrega;
    }

    if (search) {
      where.OR = [
        {numero: {contains: search, mode: "insensitive"}},
        {clienteNombre: {contains: search, mode: "insensitive"}},
        {clienteEmail: {contains: search, mode: "insensitive"}},
      ];
    }

    const [pedidos, total] = await Promise.all([
      prisma.pedido.findMany({
        where,
        orderBy: {creadoEn: "desc"},
        skip: (page - 1) * limit,
        take: limit,
        include: {
          cliente: true,
          items: {include: {producto: true}},
        },
      }),
      prisma.pedido.count({where}),
    ]);

    return NextResponse.json({
      pedidos,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return NextResponse.json({error: "Error fetching pedidos"}, {status: 500});
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let validated: any;
    try {
      validated = validateOrThrow(checkoutSchema, body);
    } catch (err: any) {
      return NextResponse.json(err.error || {error: "Datos inválidos"}, {status: err.status || 400});
    }

    const {
      clienteEmail,
      clienteNombre,
      clienteTel,
      items,
      tipoEntrega,
      direccion,
      costoEnvio,
      notas,
      metodoPago,
      cuponId,
    } = validated;

    const sanitizedNombre = sanitizeText(clienteNombre, 100);
    const sanitizedNotas = notas ? sanitizeText(notas, 500) : null;

    const productoIds = items.map((item: any) => item.productoId);
    const productosExistentes = await prisma.producto.findMany({
      where: {id: {in: productoIds}},
      select: {id: true},
    });

    const idsExistentes = productosExistentes.map((p) => p.id);
    const idsInvalidos = productoIds.filter((id: string) => !idsExistentes.includes(id));

    if (idsInvalidos.length > 0) {
      return NextResponse.json({
        error: "Algunos productos de tu carrito ya no están disponibles. Por favor vaciá el carrito y volvé a agregar los productos.",
      }, {status: 400});
    }

    const clientePayload = await getClienteFromRequest();
    const clienteId = clientePayload?.clienteId || null;

    const lastPedido = await prisma.pedido.findFirst({
      orderBy: {numero: "desc"},
    });

    const year = new Date().getFullYear();
    let nextNum = 1;
    if (lastPedido) {
      const lastNum = parseInt(lastPedido.numero.split("-")[2]);
      nextNum = lastNum + 1;
    }
    const numero = `P-${year}-${nextNum.toString().padStart(3, "0")}`;

    let totalBruto = 0;
    for (const item of items) {
      totalBruto += item.precio * item.cantidad;
    }

    let descuento = 0;
    if (cuponId) {
      const cupon = await prisma.cupon.findUnique({where: {id: cuponId}});
      if (!cupon) {
        return NextResponse.json({error: "Cupón no encontrado"}, {status: 400});
      }
      if (!cupon.activo) {
        return NextResponse.json({error: "El cupón no está activo"}, {status: 400});
      }
      const now = new Date();
      if (cupon.fechaInicio && now < cupon.fechaInicio) {
        return NextResponse.json({error: "El cupón aún no es válido"}, {status: 400});
      }
      if (cupon.fechaFin && now > cupon.fechaFin) {
        return NextResponse.json({error: "El cupón está vencido"}, {status: 400});
      }
      if (cupon.maxUsos && cupon.usosActuales >= cupon.maxUsos) {
        return NextResponse.json({error: "El cupón llegó a su límite de usos"}, {status: 400});
      }
      if (cupon.minCompra && totalBruto < cupon.minCompra) {
        return NextResponse.json({error: `El cupón requiere un mínimo de compra de $${cupon.minCompra.toLocaleString()}`}, {status: 400});
      }
      if (cupon.tipo === "PORCENTAJE") {
        descuento = totalBruto * (cupon.valor / 100);
      } else {
        descuento = Math.min(cupon.valor, totalBruto);
      }
    }

    const totalFinal = totalBruto - descuento + (costoEnvio || 0);

    const [pedido] = await prisma.$transaction([
      prisma.pedido.create({
        data: {
          numero,
          clienteEmail,
          clienteNombre: sanitizedNombre,
          clienteTel,
          ...(clienteId ? { cliente: { connect: { id: clienteId } } } : {}),
          items: {
            create: items.map((item: any) => ({
              productoId: item.productoId,
              cantidad: item.cantidad,
              precio: item.precio,
              opciones: item.opciones || null,
            })),
          },
          tipoEntrega,
          direccion,
          costoEnvio,
          notas: sanitizedNotas,
          metodoPago,
          totalBruto,
          descuento,
          totalFinal,
          ...(cuponId ? { cupon: { connect: { id: cuponId } } } : {}),
          estado: "PENDIENTE",
          estadoPago: "PENDIENTE",
          historialEstados: {
            create: {
              estado: "PENDIENTE",
              nota: "Pedido creado",
            },
          },
        },
        include: {
          items: {include: {producto: true}},
          historialEstados: true,
        },
      }),
      ...(cuponId ? [prisma.cupon.update({
        where: {id: cuponId},
        data: {usosActuales: {increment: 1}},
      })] : []),
    ]);

    await sendEmailConfirmacionPedido(pedido);
    await sendEmailAdminNuevoPedido(pedido);

    return NextResponse.json(pedido);
  } catch (error) {
    console.error("Error creating pedido:", error);
    return NextResponse.json({error: "Error creating pedido"}, {status: 500});
  }
}