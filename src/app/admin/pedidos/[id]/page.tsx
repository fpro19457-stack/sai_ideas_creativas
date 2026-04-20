"use client";

import {useState, useEffect} from "react";
import {useRouter, useParams} from "next/navigation";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Badge} from "@/components/ui/badge";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Textarea} from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {ArrowLeft, MessageSquare, Truck, Save, Image as ImageIcon, CheckCircle, XCircle, FileText, MessageCircle} from "lucide-react";

interface Pedido {
  id: string;
  numero: string;
  clienteEmail: string;
  clienteNombre: string;
  clienteTel: string | null;
  estado: string;
  tipoEntrega: string;
  direccion: string | null;
  guiaTracking: string | null;
  courier: string | null;
  notas: string | null;
  notasInternas: string | null;
  metodoPago: string;
  estadoPago: string;
  totalBruto: number;
  descuento: number;
  totalFinal: number;
  comprobanteUrl: string | null;
  comprobanteEstado: string | null;
  items: any[];
  archivos: any[];
  historialEstados: any[];
  cupon: any;
  creadoEn: string;
}

const estadosOrden = [
  "PENDIENTE",
  "PAGO_PENDIENTE",
  "PAGO_CONFIRMADO",
  "EN_PRODUCCION",
  "LISTO",
  "ENVIADO",
  "ENTREGADO",
  "CANCELADO",
];

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

const couriers = ["Andreani", "OCA", "Correo Argentino", "Mercado Envíos", "Otro"];

export default function AdminPedidoDetallePage() {
  const router = useRouter();
  const params = useParams();
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedEstado, setSelectedEstado] = useState("");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState("");
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectMotivo, setRejectMotivo] = useState("");

  const [formData, setFormData] = useState({
    courier: "",
    guiaTracking: "",
    notasInternas: "",
  });

  useEffect(() => {
    if (params.id) {
      fetchPedido(params.id as string);
    }
  }, [params.id]);

  const fetchPedido = async (id: string) => {
    try {
      const res = await fetch(`/api/pedidos/${id}`);
      const data = await res.json();
      setPedido(data);
      setFormData({
        courier: data.courier || "",
        guiaTracking: data.guiaTracking || "",
        notasInternas: data.notasInternas || "",
      });
    } catch (error) {
      console.error("Error fetching pedido:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEnvio = async () => {
    if (!pedido) return;
    setSaving(true);
    try {
      await fetch(`/api/pedidos/${pedido.id}`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          courier: formData.courier,
          guiaTracking: formData.guiaTracking,
          notasInternas: formData.notasInternas,
        }),
      });
      await fetchPedido(pedido.id);
    } catch (error) {
      console.error("Error saving envio:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleCambiarEstado = async () => {
    if (!pedido || !selectedEstado) return;
    setSaving(true);
    try {
      await fetch(`/api/pedidos/${pedido.id}`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({estado: selectedEstado}),
      });
      await fetchPedido(pedido.id);
      setConfirmModalOpen(false);
    } catch (error) {
      console.error("Error changing estado:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleAprobarComprobante = async () => {
    if (!pedido) return;
    setSaving(true);
    try {
      await fetch(`/api/pagos/transferencia/revisar`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({accion: "aprobar", pedidoId: pedido.id}),
      });
      await fetchPedido(pedido.id);
    } catch (error) {
      console.error("Error approving comprobante:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleRechazarComprobante = async () => {
    if (!pedido) return;
    setSaving(true);
    try {
      await fetch(`/api/pagos/transferencia/revisar`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({accion: "rechazar", motivo: rejectMotivo, pedidoId: pedido.id}),
      });
      await fetchPedido(pedido.id);
      setRejectModalOpen(false);
      setRejectMotivo("");
    } catch (error) {
      console.error("Error rejecting comprobante:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmarEfectivo = async () => {
    if (!pedido) return;
    setSaving(true);
    try {
      await fetch(`/api/admin/pedidos/confirmar-efectivo`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({pedidoId: pedido.id}),
      });
      await fetchPedido(pedido.id);
    } catch (error) {
      console.error("Error confirming efectivo:", error);
    } finally {
      setSaving(false);
    }
  };

  const openLightbox = (url: string) => {
    setLightboxUrl(url);
    setLightboxOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando pedido...</p>
        </div>
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Pedido no encontrado</p>
        <Button onClick={() => router.push("/admin/pedidos")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a pedidos
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push("/admin/pedidos")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-playfair">Pedido {pedido.numero}</h1>
          <p className="text-muted-foreground">
            Creado el {new Date(pedido.creadoEn).toLocaleDateString("es-AR")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="font-medium">{pedido.clienteNombre}</p>
              <p className="text-sm text-muted-foreground">{pedido.clienteEmail}</p>
              {pedido.clienteTel && (
                <p className="text-sm text-muted-foreground">{pedido.clienteTel}</p>
              )}
              {pedido.clienteTel && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 bg-green-50 border-green-200 hover:bg-green-100"
                  onClick={() => {
                    let telefono = pedido.clienteTel?.replace(/[\s\-\(\)]/g, "") || "";
                    if (telefono.startsWith("0")) telefono = telefono.slice(1);
                    if (!telefono.startsWith("54")) telefono = "54" + telefono;
                    const texto = encodeURIComponent(`Hola ${pedido.clienteNombre}, te contactamos de Sai Ideas Creativas por tu pedido ${pedido.numero}`);
                    window.open(`https://wa.me/${telefono}?text=${texto}`, "_blank");
                  }}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Escribir por WhatsApp
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Productos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pedido.items.map((item: any) => (
                <div key={item.id} className="flex justify-between items-start border-b pb-3 last:border-0">
                  <div>
                    <p className="font-medium">{item.producto.nombre}</p>
                    <p className="text-sm text-muted-foreground">
                      Cantidad: {item.cantidad}
                    </p>
                  </div>
                  <p className="font-medium">${item.precio.toLocaleString()}</p>
                </div>
              ))}
              <div className="border-t pt-4 space-y-2">
                {pedido.descuento > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Descuento</span>
                    <span className="text-green-600">-${pedido.descuento.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${pedido.totalFinal.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {pedido.archivos.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Archivos del cliente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">El cliente aún no subió fotos</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Archivos del cliente ({pedido.archivos.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {pedido.archivos.map((archivo: any) => (
                    <div key={archivo.id} className="aspect-square rounded-lg overflow-hidden bg-muted">
                      <img
                        src={archivo.url}
                        alt={archivo.nombre}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <Button
                  className="bg-[#F9C6C9] hover:bg-[#F0B8BC] text-[#5C3D2E] border-0"
                  onClick={() => {
                    window.open(`/api/pedidos/${pedido.id}/download`, "_blank");
                  }}
                >
                  Descargar fotos (ZIP)
                </Button>
              </CardContent>
            </Card>
          )}

          {pedido.metodoPago === "TRANSFERENCIA" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Comprobante de transferencia
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!pedido.comprobanteUrl && (
                  <p className="text-muted-foreground text-sm">El cliente aún no subió el comprobante</p>
                )}
                {pedido.comprobanteUrl && (
                  <>
                    <div className="flex items-center gap-3">
                      {pedido.comprobanteUrl.endsWith(".pdf") ? (
                        <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                          <FileText className="w-8 h-8 text-muted-foreground" />
                        </div>
                      ) : (
                        <img
                          src={pedido.comprobanteUrl}
                          alt="Comprobante"
                          className="w-16 h-16 rounded-lg object-cover cursor-pointer"
                          onClick={() => pedido.comprobanteUrl && openLightbox(pedido.comprobanteUrl)}
                        />
                      )}
                      <div>
                        <p className="font-medium text-sm">{pedido.comprobanteUrl.split("/").pop()}</p>
                        <Badge
                          variant={
                            pedido.comprobanteEstado === "APROBADO"
                              ? "success"
                              : pedido.comprobanteEstado === "RECHAZADO"
                              ? "destructive"
                              : "warning"
                          }
                        >
                          {pedido.comprobanteEstado === "APROBADO"
                            ? "Aprobado"
                            : pedido.comprobanteEstado === "RECHAZADO"
                            ? "Rechazado"
                            : "Pendiente de revisión"}
                        </Badge>
                      </div>
                    </div>
                    {pedido.comprobanteEstado === "PENDIENTE_REVISION" && (
                      <div className="flex gap-2">
                        <Button onClick={handleAprobarComprobante} disabled={saving} className="flex-1">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {saving ? "Aprobando..." : "Aprobar pago"}
                        </Button>
                        <Button variant="destructive" onClick={() => setRejectModalOpen(true)} className="flex-1">
                          <XCircle className="w-4 h-4 mr-2" />
                          Rechazar
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {pedido.metodoPago === "EFECTIVO" && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-800">
                  <FileText className="w-5 h-5" />
                  Pago en efectivo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {pedido.estadoPago === "PENDIENTE" && (
                  <>
                    <p className="text-sm text-yellow-700">
                      El cliente选择了 pago en efectivo. Debes confirmar cuando recibas el pago.
                    </p>
                    <Button onClick={handleConfirmarEfectivo} disabled={saving} className="w-full bg-green-600 hover:bg-green-700">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {saving ? "Confirmando..." : "Confirmar recepción de efectivo"}
                    </Button>
                  </>
                )}
                {pedido.estadoPago === "PAGADO" && (
                  <p className="text-sm text-green-700 font-medium flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Pago confirmado
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Estado del pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-6">
                <Badge
                  variant={
                    pedido.estado === "LISTO" || pedido.estado === "ENTREGADO"
                      ? "success"
                      : pedido.estado === "CANCELADO"
                      ? "secondary"
                      : "warning"
                  }
                  className="text-base px-4 py-1"
                >
                  {estadoLabels[pedido.estado]}
                </Badge>
              </div>

              <Select
                value={selectedEstado}
                onValueChange={setSelectedEstado}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Cambiar estado..." />
                </SelectTrigger>
                <SelectContent>
                  {estadosOrden.map((estado) => (
                    <SelectItem key={estado} value={estado}>
                      {estadoLabels[estado]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                className="w-full mt-3"
                onClick={() => setConfirmModalOpen(true)}
                disabled={!selectedEstado}
              >
                Cambiar estado
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Envío
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Courier</Label>
                <Select
                  value={formData.courier}
                  onValueChange={(value) => setFormData({...formData, courier: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    {couriers.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Número de tracking</Label>
                <Input
                  value={formData.guiaTracking}
                  onChange={(e) => setFormData({...formData, guiaTracking: e.target.value})}
                  placeholder="XXXX-XXXX-XXXX"
                />
              </div>
              <Button onClick={handleSaveEnvio} disabled={saving} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Guardando..." : "Guardar datos de envío"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Notas internas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.notasInternas}
                onChange={(e) => setFormData({...formData, notasInternas: e.target.value})}
                placeholder="Notas privadas solo para el admin..."
                rows={4}
              />
              <Button onClick={handleSaveEnvio} disabled={saving} className="w-full mt-3">
                <Save className="w-4 h-4 mr-2" />
                Guardar notas
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Historial de estados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pedido.historialEstados.map((h: any, i: number) => (
                  <div key={h.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      {i < pedido.historialEstados.length - 1 && (
                        <div className="w-px h-8 bg-border" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="font-medium">{estadoLabels[h.estado]}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(h.crearEn).toLocaleString("es-AR")}
                      </p>
                      {h.nota && <p className="text-sm mt-1">{h.nota}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={confirmModalOpen} onOpenChange={setConfirmModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar cambio de estado</DialogTitle>
            <DialogDescription>
              ¿Estás seguro que querés cambiar el estado a{" "}
              <strong>{selectedEstado && estadoLabels[selectedEstado]}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCambiarEstado} disabled={saving}>
              {saving ? "Guardando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rechazar comprobante</DialogTitle>
            <DialogDescription>
              Indicá el motivo del rechazo para notificar al cliente.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={rejectMotivo}
            onChange={(e) => setRejectMotivo(e.target.value)}
            placeholder="Motivo del rechazo (opcional)"
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleRechazarComprobante} disabled={saving}>
              {saving ? "Rechazando..." : "Rechazar comprobante"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-4xl p-0">
          <img src={lightboxUrl} alt="Comprobante" className="w-full h-auto" />
        </DialogContent>
      </Dialog>
    </div>
  );
}