import {prisma} from "@/lib/db";
import {notFound} from "next/navigation";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Check, Clock, Package, Truck, MapPin} from "lucide-react";

const estadoIcons: Record<string, React.ReactNode> = {
  PENDIENTE: <Clock className="w-5 h-5" />,
  PAGO_CONFIRMADO: <Check className="w-5 h-5" />,
  PREPARANDO: <Package className="w-5 h-5" />,
  ENVIADO: <Truck className="w-5 h-5" />,
  LISTO: <Check className="w-5 h-5" />,
  ENTREGADO: <Check className="w-5 h-5" />,
};

const estadoLabels: Record<string, string> = {
  PENDIENTE: "Pendiente de pago",
  PAGO_CONFIRMADO: "Pago confirmado",
  PREPARANDO: "Preparando tu pedido",
  ENVIADO: "En camino",
  LISTO: "Listo para retirar",
  ENTREGADO: "Entregado",
};

const estadoColors: Record<string, string> = {
  PENDIENTE: "bg-yellow-100 text-yellow-800",
  PAGO_CONFIRMADO: "bg-blue-100 text-blue-800",
  PREPARANDO: "bg-purple-100 text-purple-800",
  ENVIADO: "bg-indigo-100 text-indigo-800",
  LISTO: "bg-green-100 text-green-800",
  ENTREGADO: "bg-green-100 text-green-800",
};

const timeline = [
  {key: "PENDIENTE", label: "Pendiente"},
  {key: "PAGO_CONFIRMADO", label: "Pago confirmado"},
  {key: "PREPARANDO", label: "Preparando"},
  {key: "ENVIADO", label: "Enviado", condition: (p: any) => p.tipoEntrega === "ENVIO"},
  {key: "LISTO", label: "Listo para retirar", condition: (p: any) => p.tipoEntrega === "RETIRO_LOCAL"},
  {key: "ENTREGADO", label: "Entregado"},
];

async function getPedido(id: string) {
  const pedido = await prisma.pedido.findUnique({
    where: {id},
    include: {
      items: {
        include: {
          producto: true,
        },
      },
    },
  });
  return pedido;
}

function CopyButton({text}: {text: string}) {
  if (!text) return null;
  return (
    <button
      onClick={() => navigator.clipboard.writeText(text)}
      className="text-xs underline ml-2"
    >
      Copiar
    </button>
  );
}

export default async function PedidoPage({params}: {params: Promise<{id: string}>}) {
  const {id} = await params;
  const pedido = await getPedido(id);

  if (!pedido) {
    return (
      <div className="min-h-screen bg-[#FFF8F2] flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <CardTitle className="text-2xl">Pedido no encontrado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              El pedido que buscas no existe o fue eliminado.
            </p>
            <Button asChild>
              <Link href="/">Volver al inicio</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const estadoIndex = timeline.findIndex(
    (t) => t.key === pedido.estado && (!t.condition || t.condition(pedido))
  );

  return (
    <div className="min-h-screen bg-[#FFF8F2]">
      <header className="bg-white border-b py-4">
        <div className="max-w-2xl mx-auto px-4">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Volver
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-playfair mb-2">Pedido #{pedido.numero}</h1>
          <Badge className={estadoColors[pedido.estado]}>
            {estadoIcons[pedido.estado]} {estadoLabels[pedido.estado]}
          </Badge>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Seguimiento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              {timeline.map((t, i) => {
                if (t.condition && !t.condition(pedido)) return null;
                const isActive = i <= estadoIndex;
                const isCurrent = i === estadoIndex;
                return (
                  <div key={t.key} className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isActive ? "bg-[#F9C6C9] text-[#5C3D2E]" : "bg-gray-100 text-gray-400"
                      } ${isCurrent ? "ring-2 ring-[#5C3D2E]" : ""}`}
                    >
                      {estadoIcons[t.key]}
                    </div>
                    <span className="text-xs mt-1 text-center max-w-[60px]">{t.label}</span>
                    {i < timeline.filter((t2) => !t2.condition || t2.condition(pedido)).length - 1 && (
                      <div className={`absolute h-1 w-full ${isActive ? "bg-[#F9C6C9]" : "bg-gray-200"}`} style={{display: "none"}} />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Detalles del pedido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Cliente</p>
                <p className="font-medium">{pedido.clienteNombre}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium">{pedido.clienteEmail}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Método de pago</p>
                <p className="font-medium">
                  {pedido.metodoPago === "MERCADOPAGO"
                    ? "MercadoPago"
                    : pedido.metodoPago === "TRANSFERENCIA"
                    ? "Transferencia"
                    : "Efectivo"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Tipo de entrega</p>
                <p className="font-medium">
                  {pedido.tipoEntrega === "ENVIO" ? "Envío a domicilio" : "Retiro en local"}
                </p>
              </div>
            </div>

            {pedido.tipoEntrega === "ENVIO" && (
              <div>
                <p className="text-muted-foreground">Dirección</p>
                <p className="font-medium">{pedido.direccion}</p>
              </div>
            )}

            {pedido.courier && (
              <div>
                <p className="text-muted-foreground">Courier</p>
                <p className="font-medium">{pedido.courier}</p>
              </div>
            )}

            {pedido.guiaTracking && (
              <div>
                <p className="text-muted-foreground">Número de guía</p>
                <p className="font-medium flex items-center">
                  {pedido.guiaTracking}
                  <CopyButton text={pedido.guiaTracking} />
                </p>
              </div>
            )}

            <div className="border-t pt-4">
              <p className="text-muted-foreground">Productos</p>
              <ul className="mt-2 space-y-2">
                {pedido.items.map((item) => (
                  <li key={item.id} className="flex justify-between text-sm">
                    <span>
                      {item.producto?.nombre || "Producto"} x {item.cantidad}
                    </span>
                    <span className="font-medium">${item.precio.toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            </div>

            {pedido.descuento > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Descuento</span>
                <span>-${pedido.descuento.toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between font-bold text-lg border-t pt-4">
              <span>Total</span>
              <span>${pedido.totalFinal.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        {pedido.tipoEntrega === "RETIRO_LOCAL" && pedido.estado === "LISTO" && (
          <Card className="mb-6 bg-green-50 border-green-200">
            <CardContent className="flex items-center gap-4 py-6">
              <MapPin className="w-8 h-8 text-green-600" />
              <div>
                <p className="font-medium text-green-800">¡Tu pedido está listo para retirar!</p>
                <p className="text-sm text-green-600">
                  Podés pasar a buscarlo por nuestro local.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="text-center">
          <Button asChild variant="outline">
            <Link href="/">Volver al inicio</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}