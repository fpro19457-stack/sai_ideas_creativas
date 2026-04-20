"use client";

import {useState, useEffect} from "react";
import {useRouter} from "next/navigation";
import {useCart} from "@/lib/cart-context";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Textarea} from "@/components/ui/textarea";
import {ChevronLeft, ChevronRight, Check, MapPin, Banknote, CheckCircle, X, Camera, Trash2} from "lucide-react";
import Link from "next/link";

const pasos = ["Datos", "Entrega", "Pago", "Fotos", "Confirmación"];

interface CuponAplicado {
  cuponId: string;
  codigo: string;
  tipo: string;
  valor: number;
  descuento: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const {items, total, clearCart} = useCart();
  const [paso, setPaso] = useState(0);
  const [loading, setLoading] = useState(true);
  const [cliente, setCliente] = useState<{id: string; nombre: string; email: string; telefono: string | null} | null>(null);
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    fetchCliente();
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/configuracion");
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      }
    } catch {
    }
  };

  const fetchCliente = async () => {
    try {
      const res = await fetch("/api/cliente/auth/session");
      if (res.ok) {
        const data = await res.json();
        if (!data.email) {
          router.push("/cuenta/login?redirect=/checkout");
          return;
        }
        setCliente(data);
        setFormData(prev => ({
          ...prev,
          nombre: data.nombre || "",
          email: data.email || "",
          telefono: data.telefono || "",
        }));
      } else {
        router.push("/cuenta/login?redirect=/checkout");
      }
    } catch {
      router.push("/cuenta/login?redirect=/checkout");
    } finally {
      setLoading(false);
    }
  };

  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    tipoEntrega: "ENVIO",
    direccion: "",
    codigoPostal: "",
    notas: "",
    metodoPago: "MERCADOPAGO",
  });

  const [cuponInput, setCuponInput] = useState("");
  const [cuponAplicado, setCuponAplicado] = useState<CuponAplicado | null>(null);
  const [cuponError, setCuponError] = useState("");
  const [cuponLoading, setCuponLoading] = useState(false);

  const [fotosPorProducto, setFotosPorProducto] = useState<Record<string, File[]>>({});
  const [fotosPreviewPorProducto, setFotosPreviewPorProducto] = useState<Record<string, {url: string, nombre: string}[]>>({});

  const [postalCode, setPostalCode] = useState("");
  const [costoEnvio, setCostoEnvio] = useState<number | null>(null);
  const [costoEnvioCalculado, setCostoEnvioCalculado] = useState(false);

  const todosEnvioGratis = items.length > 0 && items.every((item: any) => item.envioGratis);

  const calcularEnvio = () => {
    if (!postalCode.trim()) return;
    const cp = parseInt(postalCode.trim());
    if (isNaN(cp)) return;

    if (todosEnvioGratis) {
      setCostoEnvio(0);
      setCostoEnvioCalculado(true);
      return;
    }

    if (!config?.entrega?.envio?.costos) return;

    const costos = config.entrega.envio.costos;
    if (cp >= costos.CABA.min && cp <= costos.CABA.max) {
      setCostoEnvio(costos.CABA.costo);
    } else if (cp >= costos.GBA.min && cp <= costos.GBA.max) {
      setCostoEnvio(costos.GBA.costo);
    } else {
      setCostoEnvio(costos.INTERIOR.costo);
    }
    setCostoEnvioCalculado(true);
  };

  const totalConDescuento = cuponAplicado ? total - cuponAplicado.descuento : total;
  const totalFinal = costoEnvio !== null ? totalConDescuento + costoEnvio : totalConDescuento;
  const cantidadFotosRequeridas = items.reduce((sum: number, item: any) => sum + (item.cantidadFotos || 0), 0);
  const necesitaFotos = cantidadFotosRequeridas > 0;
  const fotosCompletadas = Object.values(fotosPorProducto).reduce((sum, files) => sum + files.length, 0);

  useEffect(() => {
    if (formData.tipoEntrega === "RETIRO_LOCAL") {
      setCostoEnvio(null);
      setCostoEnvioCalculado(false);
      setPostalCode("");
    } else if (formData.tipoEntrega === "ENVIO" && formData.metodoPago === "EFECTIVO") {
      setFormData(prev => ({...prev, metodoPago: "MERCADOPAGO"}));
    }
  }, [formData.tipoEntrega, formData.metodoPago]);

  const aplicarCupon = async () => {
    if (!cuponInput.trim()) return;
    setCuponLoading(true);
    setCuponError("");
    try {
      const res = await fetch("/api/cupones/validar", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({codigo: cuponInput.trim(), total}),
      });
      const data = await res.json();
      if (data.valido) {
        setCuponAplicado({
          cuponId: data.cuponId,
          codigo: cuponInput.trim().toUpperCase(),
          tipo: data.tipo,
          valor: data.valor,
          descuento: data.descuento,
        });
        setCuponInput("");
      } else {
        setCuponError(data.mensaje || "Cupón inválido");
        setTimeout(() => setCuponError(""), 3000);
      }
    } catch {
      setCuponError("Error al validar cupón");
      setTimeout(() => setCuponError(""), 3000);
    } finally {
      setCuponLoading(false);
    }
  };

  const quitarCupon = () => {
    setCuponAplicado(null);
    setCuponInput("");
  };

  const handleFotosDrop = async (productoId: string, e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(
      (f) => ["image/jpeg", "image/png", "image/webp", "image/heic"].includes(f.type) && f.size <= 20 * 1024 * 1024
    );

    if (validFiles.length === 0) return;

    setFotosPorProducto(prev => ({
      ...prev,
      [productoId]: [...(prev[productoId] || []), ...validFiles],
    }));
    setFotosPreviewPorProducto(prev => ({
      ...prev,
      [productoId]: [...(prev[productoId] || []), ...validFiles.map(f => ({ url: URL.createObjectURL(f), nombre: f.name }))],
    }));
  };

  const handleFotosInputChange = (productoId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const validFiles = files.filter(
      (f) => ["image/jpeg", "image/png", "image/webp", "image/heic"].includes(f.type) && f.size <= 20 * 1024 * 1024
    );
    if (validFiles.length === 0) return;
    setFotosPorProducto(prev => ({
      ...prev,
      [productoId]: [...(prev[productoId] || []), ...validFiles],
    }));
    setFotosPreviewPorProducto(prev => ({
      ...prev,
      [productoId]: [...(prev[productoId] || []), ...validFiles.map(f => ({ url: URL.createObjectURL(f), nombre: f.name }))],
    }));
  };

  const eliminarFoto = (productoId: string, index: number) => {
    const preview = fotosPreviewPorProducto[productoId];
    if (preview && preview[index]) {
      URL.revokeObjectURL(preview[index].url);
    }
    setFotosPorProducto(prev => ({
      ...prev,
      [productoId]: (prev[productoId] || []).filter((_, i) => i !== index),
    }));
    setFotosPreviewPorProducto(prev => ({
      ...prev,
      [productoId]: (prev[productoId] || []).filter((_, i) => i !== index),
    }));
  };

  const fotosCompletas = items
    .filter(item => (item.cantidadFotos || 0) > 0)
    .every(item => (fotosPorProducto[item.productoId]?.length || 0) >= item.cantidadFotos);

  const handleSubmit = async () => {
    if (items.length === 0) return;
    setLoading(true);

    try {
      const res = await fetch("/api/pedidos", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          clienteId: cliente?.id,
          clienteEmail: formData.email,
          clienteNombre: formData.nombre,
          clienteTel: formData.telefono,
          items: items.map((item) => ({
            productoId: item.productoId,
            cantidad: item.cantidad,
            precio: item.precio,
            opciones: item.opciones,
          })),
          tipoEntrega: formData.tipoEntrega,
          direccion: formData.direccion,
          costoEnvio: formData.tipoEntrega === "ENVIO" ? costoEnvio : null,
          notas: formData.notas,
          metodoPago: formData.metodoPago,
          cuponId: cuponAplicado?.cuponId,
          descuento: cuponAplicado?.descuento,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.error || error.message || "Error al crear el pedido");
        setLoading(false);
        return;
      }

      const pedido = await res.json();

      for (const item of items.filter(i => (i.cantidadFotos || 0) > 0)) {
        const archivos = fotosPorProducto[item.productoId] || [];
        if (archivos.length > 0) {
          const formData = new FormData();
          formData.append("pedidoId", pedido.id);
          formData.append("productoNombre", item.nombre);
          archivos.forEach(f => formData.append("files", f));
          await fetch("/api/upload/fotos", { method: "POST", body: formData });
        }
      }

      if (formData.metodoPago === "MERCADOPAGO") {
        const prefRes = await fetch("/api/pagos/mercadopago/create-preference", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({pedidoId: pedido.id}),
        });

        if (prefRes.ok) {
          const {initPoint} = await prefRes.json();
          window.location.href = initPoint;
          return;
        }
      }

      clearCart();
      router.push(`/pedido/${pedido.id}`);
    } catch (error) {
      console.error("Error creating pedido:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-playfair mb-4">Tu carrito está vacío</h1>
          <p className="text-muted-foreground mb-6">
            Agregá productos antes de continuar con el checkout.
          </p>
          <Button asChild>
            <Link href="/productos">Ver productos</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b py-4">
        <div className="max-w-3xl mx-auto px-4">
          <Link href="/productos" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" />
            Volver
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center gap-2 mb-8">
          {pasos.map((nombre, i) => (
            <div key={nombre} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                  i <= paso
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {i < paso ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-sm hidden sm:inline ${i <= paso ? "" : "text-muted-foreground"}`}>
                {nombre}
              </span>
              {i < pasos.length - 1 && <div className="w-8 h-px bg-border" />}
            </div>
          ))}
        </div>

        {paso === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Tus datos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre completo *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono (opcional)</Label>
                <Input
                  id="telefono"
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notas">Notas del pedido (opcional)</Label>
                <Textarea
                  id="notas"
                  value={formData.notas}
                  onChange={(e) => setFormData({...formData, notas: e.target.value})}
                  placeholder="Alguna especificación especial..."
                />
              </div>
            </CardContent>
          </Card>
        )}

        {paso === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>¿Cómo querés recibir tu pedido?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup
                value={formData.tipoEntrega}
                onValueChange={(value) => setFormData({...formData, tipoEntrega: value})}
              >
                {config?.entrega?.envio?.activo && (
                  <div className="flex items-start gap-3 p-4 border rounded-xl">
                    <RadioGroupItem value="ENVIO" id="envio" />
                    <Label htmlFor="envio" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-primary" />
                        <span className="font-medium">Envío a domicilio</span>
                      </div>
                    </Label>
                  </div>
                )}
                {config?.entrega?.retiroLocal?.activo && (
                  <div className="flex items-start gap-3 p-4 border rounded-xl">
                    <RadioGroupItem value="RETIRO_LOCAL" id="retiro" />
                    <Label htmlFor="retiro" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-primary" />
                        <span className="font-medium">Retiro en local</span>
                      </div>
                    </Label>
                  </div>
                )}
              </RadioGroup>

              {formData.tipoEntrega === "ENVIO" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="codigoPostal">Código postal *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="codigoPostal"
                        value={postalCode}
                        onChange={(e) => {
                          setPostalCode(e.target.value);
                          setCostoEnvioCalculado(false);
                          setCostoEnvio(null);
                        }}
                        placeholder="Ej: 1425"
                        className="max-w-[200px]"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={calcularEnvio}
                        disabled={!postalCode.trim() || costoEnvioCalculado}
                      >
                        {costoEnvioCalculado ? "Calculado" : "Calcular envío"}
                      </Button>
                    </div>
                    {todosEnvioGratis && (
                      <div className="bg-[#B8E0D2] text-[#5C3D2E] rounded-lg p-3 text-sm font-medium">
                        🎉 Todos tus productos tienen envío gratis
                      </div>
                    )}
                    {costoEnvioCalculado && !todosEnvioGratis && costoEnvio !== null && (
                      <div className="bg-[#B8E0D2] text-[#5C3D2E] rounded-lg p-3 text-sm font-medium">
                        Costo de envío: ${costoEnvio.toLocaleString()}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="direccion">Dirección completa *</Label>
                    <Textarea
                      id="direccion"
                      value={formData.direccion}
                      onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                      placeholder="Calle, número, piso, barrio, ciudad..."
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {formData.tipoEntrega === "RETIRO_LOCAL" && (
                <div className="p-4 bg-muted rounded-xl text-sm">
                  <p className="font-medium mb-2">Dirección de retiro:</p>
                  <p>{config?.entrega?.retiroLocal?.direccion || "Consultar dirección"}</p>
                  <p className="text-muted-foreground">{config?.entrega?.retiroLocal?.horarios || "Consultar horarios"}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {paso === 2 && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Método de pago</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup
                  value={formData.metodoPago}
                  onValueChange={(value) => setFormData({...formData, metodoPago: value})}
                >
                  {config?.metodosPago?.mercadopago && (
                    <div className="flex items-start gap-3 p-4 border rounded-xl">
                      <RadioGroupItem value="MERCADOPAGO" id="mp" />
                      <Label htmlFor="mp" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Banknote className="w-5 h-5 text-primary" />
                          <span className="font-medium">MercadoPago</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Tarjetas de crédito, débito, o efectivo en puntos de pago
                        </p>
                      </Label>
                    </div>
                  )}
                  {formData.tipoEntrega === "RETIRO_LOCAL" && config?.metodosPago?.efectivo && (
                    <div className="flex items-start gap-3 p-4 border rounded-xl">
                      <RadioGroupItem value="EFECTIVO" id="efectivo" />
                      <Label htmlFor="efectivo" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Banknote className="w-5 h-5 text-primary" />
                          <span className="font-medium">Efectivo</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Solo para retiro en local
                        </p>
                      </Label>
                    </div>
                  )}
                </RadioGroup>

                {formData.tipoEntrega === "RETIRO_LOCAL" && formData.metodoPago === "EFECTIVO" && (
                  <Card className="bg-yellow-50 border-yellow-200">
                    <CardContent className="py-4">
                      <p className="text-sm text-yellow-800">
                        <strong>Pagás al retirar:</strong> Podés abonar en efectivo cuando passes a retirar tu pedido por nuestro local.
                      </p>
                    </CardContent>
                  </Card>
                )}
            </CardContent>
          </Card>

            <Card>
              <CardHeader>
                <CardTitle>¿Tenés un código de descuento?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cuponAplicado ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-700">{cuponAplicado.codigo}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={quitarCupon}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Código de descuento"
                      value={cuponInput}
                      onChange={(e) => setCuponInput(e.target.value.toUpperCase())}
                      disabled={cuponLoading}
                    />
                    <Button onClick={aplicarCupon} disabled={cuponLoading || !cuponInput.trim()}>
                      {cuponLoading ? "Validando..." : "Aplicar"}
                    </Button>
                  </div>
                )}
                {cuponError && (
                  <p className="text-sm text-destructive bg-destructive/10 rounded-lg p-3">{cuponError}</p>
                )}
                {cuponAplicado && (
                  <p className="text-sm text-green-600 font-medium">
                    ¡Cupón aplicado! Ahorrás ${cuponAplicado.descuento.toLocaleString()}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {paso === 3 && necesitaFotos && (
          <div className="space-y-4">
            {items.filter(item => (item.cantidadFotos || 0) > 0).map(item => {
              const previews = fotosPreviewPorProducto[item.productoId] || [];
              const fotosCount = fotosPorProducto[item.productoId]?.length || 0;
              const inputId = `fotos-input-${item.productoId}`;

              return (
                <Card key={item.productoId}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Camera className="w-5 h-5" />
                      Fotos para "{item.nombre}"
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Subí exactamente {item.cantidadFotos} fotos para este producto
                    </p>
                    <div className="bg-[#F9C6C9]/20 rounded-lg p-2 text-sm">
                      <span className={fotosCount >= item.cantidadFotos ? "text-green-600 font-medium" : "text-[#5C3D2E]"}>
                        {fotosCount} de {item.cantidadFotos} fotos
                      </span>
                      {fotosCount >= item.cantidadFotos && (
                        <span className="ml-2 text-green-600">✓ Completo</span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div
                      className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleFotosDrop(item.productoId, e)}
                    >
                      <input
                        type="file"
                        id={inputId}
                        accept="image/jpeg,image/png,image/webp,image/heic"
                        multiple
                        className="hidden"
                        onChange={(e) => handleFotosInputChange(item.productoId, e)}
                      />
                      <label htmlFor={inputId} className="cursor-pointer flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                          <Camera className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <span className="text-sm text-muted-foreground">Arrastrá fotos aquí o click para seleccionar</span>
                        <span className="text-xs text-muted-foreground">JPG, PNG, WEBP (máx 20MB c/u)</span>
                      </label>
                    </div>

                    {previews.length > 0 && (
                      <div className="grid grid-cols-4 gap-3">
                        {previews.map((foto, index) => (
                          <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                            <img src={foto.url} alt={foto.nombre} className="w-full h-full object-cover" />
                            <button
                              onClick={() => eliminarFoto(item.productoId, index)}
                              className="absolute top-1 left-1 w-5 h-5 rounded-full bg-destructive flex items-center justify-center hover:bg-destructive/80"
                            >
                              <Trash2 className="w-3 h-3 text-white" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {((!necesitaFotos && paso === 3) || (necesitaFotos && paso === 4)) && (
          <Card>
            <CardHeader>
              <CardTitle>Confirmá tu pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h3 className="font-medium">Tus datos:</h3>
                <p className="text-sm text-muted-foreground">
                  {formData.nombre} • {formData.email}
                  {formData.telefono && ` • ${formData.telefono}`}
                </p>
              </div>
              <div className="space-y-3">
                <h3 className="font-medium">Entrega:</h3>
                <p className="text-sm text-muted-foreground">
                  {formData.tipoEntrega === "ENVIO"
                    ? `Envío a: ${formData.direccion}${postalCode ? ` (CP: ${postalCode})` : ""}`
                    : "Retiro en local"}
                </p>
                {formData.tipoEntrega === "ENVIO" && costoEnvio !== null && (
                  <p className="text-sm text-[#B8E0D2] font-medium">
                    {costoEnvio === 0 ? "🎉 ¡Envío gratis!" : `Costo de envío: $${costoEnvio.toLocaleString()}`}
                  </p>
                )}
              </div>
              <div className="space-y-3">
                <h3 className="font-medium">Productos:</h3>
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>
                      {item.nombre} x {item.cantidad}
                    </span>
                    <span>${(item.precio * item.cantidad).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              {cuponAplicado && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Descuento ({cuponAplicado.codigo})</span>
                  <span>-${cuponAplicado.descuento.toLocaleString()}</span>
                </div>
              )}
              <div className="border-t pt-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${totalFinal.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => setPaso(Math.max(0, paso - 1))}
            disabled={paso === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Atrás
          </Button>
          {(() => {
            const maxPaso = necesitaFotos ? 4 : 3;
            if (paso < maxPaso) {
              let puedeContinuar = true;
              if (paso === 1) {
                if (formData.tipoEntrega === "ENVIO") {
                  puedeContinuar = costoEnvioCalculado && !!postalCode.trim() && !!formData.direccion.trim();
                }
              } else if (paso === 3) {
                puedeContinuar = fotosCompletas;
              }
              return (
                <Button onClick={() => setPaso(paso + 1)} disabled={!puedeContinuar}>
                  Continuar
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              );
            }
            const puedeConfirmar = !necesitaFotos || fotosCompletas;
            return (
              <Button
                onClick={handleSubmit}
                disabled={loading || !puedeConfirmar}
              >
                {loading ? "Creando pedido..." : "Confirmar pedido"}
              </Button>
            );
          })()}
        </div>
      </main>
    </div>
  );
}