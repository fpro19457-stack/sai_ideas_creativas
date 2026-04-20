"use client";

import {useState} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {useCart} from "@/lib/cart-context";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Minus, Plus, X, ShoppingCart, ArrowRight, Check, Tag} from "lucide-react";

interface CuponAplicado {
  cuponId: string;
  codigo: string;
  tipo: string;
  valor: number;
  descuento: number;
}

export default function CarritoPage() {
  const router = useRouter();
  const {items, updateQuantity, removeItem, total, itemCount} = useCart();
  const [cuponInput, setCuponInput] = useState("");
  const [cuponAplicado, setCuponAplicado] = useState<CuponAplicado | null>(null);
  const [cuponError, setCuponError] = useState("");
  const [cuponLoading, setCuponLoading] = useState(false);

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

  const subtotal = total;
  const descuento = cuponAplicado?.descuento || 0;
  const totalFinal = subtotal - descuento;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#B8E0D2]/30 flex items-center justify-center">
            <ShoppingCart className="w-12 h-12 text-[#5C3D2E]" />
          </div>
          <h1 className="text-2xl font-playfair mb-4 text-[#5C3D2E]">Tu carrito está vacío</h1>
          <p className="text-muted-foreground mb-6">
            Agregá productos para comenzar con tu pedido
          </p>
          <Button asChild size="lg" className="bg-[#F9C6C9] hover:bg-[#F9C6C9]/90 text-[#5C3D2E]">
            <Link href="/productos">
              Ver productos
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-playfair mb-8 text-[#5C3D2E]">Tu carrito</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                      {item.opciones?.imagenUrl ? (
                        <img
                          src={item.opciones.imagenUrl}
                          alt={item.nombre}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">✦</div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-lg">{item.nombre}</h3>
                          {item.opciones?.tamano && (
                            <p className="text-sm text-muted-foreground">Tamaño: {item.opciones.tamano}</p>
                          )}
                          {item.opciones?.papel && (
                            <p className="text-sm text-muted-foreground">Papel: {item.opciones.papel}</p>
                          )}
                          {item.cantidadFotos > 0 && (
                            <p className="text-sm text-[#D4B8E0]">Requiere {item.cantidadFotos} foto(s)</p>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 hover:bg-destructive/10 rounded-full transition-colors text-muted-foreground hover:text-destructive"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="flex justify-between items-end mt-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="w-8 h-8 rounded-full"
                            onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-8 text-center font-medium">{item.cantidad}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="w-8 h-8 rounded-full"
                            onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="font-bold text-lg">
                          ${(item.precio * item.cantidad).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-4">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Resumen del pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal ({itemCount} items)</span>
                    <span>${subtotal.toLocaleString()}</span>
                  </div>

                  {cuponAplicado ? (
                    <div className="flex justify-between text-green-600">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {cuponAplicado.codigo}
                      </span>
                      <span>-${descuento.toLocaleString()}</span>
                    </div>
                  ) : (
                    <div className="pt-2 border-t">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Código de descuento"
                          value={cuponInput}
                          onChange={(e) => setCuponInput(e.target.value.toUpperCase())}
                          disabled={cuponLoading}
                          className="text-sm"
                        />
                        <Button
                          size="sm"
                          onClick={aplicarCupon}
                          disabled={cuponLoading || !cuponInput.trim()}
                          variant="outline"
                        >
                          {cuponLoading ? "..." : "Aplicar"}
                        </Button>
                      </div>
                      {cuponError && (
                        <p className="text-xs text-destructive mt-1">{cuponError}</p>
                      )}
                    </div>
                  )}
                </div>

                {cuponAplicado && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-700 font-medium">{cuponAplicado.codigo}</span>
                    </div>
                    <button
                      onClick={quitarCupon}
                      className="text-xs text-green-600 hover:text-green-800"
                    >
                      Quitar
                    </button>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="flex justify-between font-bold text-xl">
                    <span>Total</span>
                    <span className="text-[#5C3D2E]">${totalFinal.toLocaleString()}</span>
                  </div>
                </div>

                <Button
                  asChild
                  size="lg"
                  className="w-full bg-[#F9C6C9] hover:bg-[#F9C6C9]/90 text-[#5C3D2E] font-semibold text-base py-6 mt-4"
                >
                  <Link href="/checkout" className="flex items-center justify-center gap-2">
                    Ir al checkout
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Impuestos calculados al finalizar
                </p>
              </CardContent>
            </Card>

            <Button asChild variant="outline" className="w-full">
              <Link href="/productos">
                <Plus className="w-4 h-4 mr-2" />
                Agregar más productos
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}