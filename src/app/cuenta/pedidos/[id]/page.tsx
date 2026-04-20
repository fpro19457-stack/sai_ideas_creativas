"use client";

import {useState, useEffect} from "react";
import {useParams, useRouter} from "next/navigation";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {ArrowLeft, Package, MapPin, CreditCard, Copy, Check, Download} from "lucide-react";

interface Pedido {
  id: string;
  numero: string;
  estado: string;
  estadoPago: string;
  tipoEntrega: string;
  direccion: string | null;
  metodoPago: string;
  totalBruto: number;
  descuento: number;
  totalFinal: number;
  courier: string | null;
  guiaTracking: string | null;
  items: any[];
  historialEstados: any[];
  cupon: any;
  comprobanteEstado: string | null;
  creadoEn: string;
}

const estadoLabels: Record<string, string> = {
  PENDIENTE: "Pendiente",
  PAGO_PENDIENTE: "Pago Pendiente",
  PAGO_CONFIRMADO: "Pago Confirmado",
  EN_PRODUCCION: "En Producción",
  LISTO: "Listo",
  ENVIADO: "Enviado",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

export default function ClientePedidoDetallePage() {
  const params = useParams();
  const router = useRouter();
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchPedido(params.id as string);
    }
  }, [params.id]);

  const fetchPedido = async (id: string) => {
    try {
      const res = await fetch(`/api/cliente/pedidos/${id}`);
      if (res.status === 403) {
        router.push("/cuenta/pedidos");
        return;
      }
      const data = await res.json();
      setPedido(data);
    } catch (error) {
      console.error("Error fetching pedido:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyTracking = () => {
    if (pedido?.guiaTracking) {
      navigator.clipboard.writeText(pedido.guiaTracking);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Pedido no encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => router.push("/cuenta/pedidos")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-playfair">Pedido {pedido.numero}</h1>
            <p className="text-muted-foreground">
              Realizado el {new Date(pedido.creadoEn).toLocaleDateString("es-AR")}
            </p>
          </div>
        </div>

        {pedido.comprobanteEstado === "PENDIENTE_REVISION" && (
          <Card className="mb-6 border-yellow-500 bg-yellow-50">
            <CardContent className="p-4">
              <p className="text-yellow-800">
                ⏳ Tu comprobante de transferencia está siendo verificado. Te notificaremos cuando esté aprobado.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Estado del pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Badge
                  variant={
                    pedido.estado === "LISTO" || pedido.estado === "ENTREGADO"
                      ? "success"
                      : pedido.estado === "CANCELADO"
                      ? "destructive"
                      : "warning"
                  }
                  className="text-base px-4 py-1"
                >
                  {estadoLabels[pedido.estado]}
                </Badge>
                {pedido.estadoPago === "PAGADO" && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <a href={`/api/pedidos/${pedido.id}/comprobante`} target="_blank" rel="noopener noreferrer">
                      <Download className="w-4 h-4 mr-2" />
                      Descargar comprobante
                    </a>
                  </Button>
                )}
              </div>

              {pedido.historialEstados.length > 0 && (
                <div className="mt-6 space-y-4">
                  {pedido.historialEstados.map((h: any) => (
                    <div key={h.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{estadoLabels[h.estado]}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(h.crearEn).toLocaleString("es-AR")}
                        </p>
                        {h.nota && <p className="text-sm mt-1">{h.nota}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {pedido.guiaTracking && (
            <Card>
              <CardHeader>
                <CardTitle>Seguimiento del envío</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Courier</p>
                    <p className="font-medium">{pedido.courier}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Número de guía</p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono font-medium">{pedido.guiaTracking}</p>
                      <button onClick={copyTracking} className="text-primary hover:underline text-sm flex items-center gap-1">
                        {copied ? <><Check className="w-3 h-3" /> Copiado</> : <><Copy className="w-3 h-3" /> Copiar</>}
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Productos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pedido.items.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center border-b pb-4 last:border-0">
                  <div>
                    <p className="font-medium">{item.producto?.nombre}</p>
                    <p className="text-sm text-muted-foreground">Cantidad: {item.cantidad}</p>
                  </div>
                  <p className="font-medium">${(item.precio * item.cantidad).toLocaleString()}</p>
                </div>
              ))}
              {pedido.descuento > 0 && (
                <div className="flex justify-between text-green-600 pt-4">
                  <span>Descuento{pedido.cupon ? ` (${pedido.cupon.codigo})` : ""}</span>
                  <span>-${pedido.descuento.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-4 border-t">
                <span>Total</span>
                <span>${pedido.totalFinal.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Entrega
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">
                  {pedido.tipoEntrega === "ENVIO" ? "Envío a domicilio" : "Retiro en local"}
                </p>
                {pedido.direccion && <p className="text-sm text-muted-foreground mt-1">{pedido.direccion}</p>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Pago
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">
                  {pedido.metodoPago === "MERCADOPAGO"
                    ? "MercadoPago"
                    : pedido.metodoPago === "TRANSFERENCIA"
                    ? "Transferencia bancaria"
                    : "Efectivo"}
                </p>
                {pedido.comprobanteEstado && (
                  <Badge
                    variant={pedido.comprobanteEstado === "APROBADO" ? "success" : "warning"}
                    className="mt-2"
                  >
                    {pedido.comprobanteEstado === "APROBADO" ? "Aprobado" : "Pendiente"}
                  </Badge>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}