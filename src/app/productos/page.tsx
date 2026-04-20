"use client";

import {useState, useEffect} from "react";
import {useCart} from "@/lib/cart-context";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Card, CardContent} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {Textarea} from "@/components/ui/textarea";
import {Plus, Minus, Trash2, ShoppingCart} from "lucide-react";
import Link from "next/link";

interface Producto {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  descripcionLarga: string | null;
  tipo: string;
  precio: number;
  activo: boolean;
  imagenUrl: string | null;
  opciones: any;
  cantidadFotos: number | null;
}

const tipoColors: Record<string, "rosa" | "lila" | "menta"> = {
  FOTO: "rosa",
  STICKER: "lila",
  PERSONALIZADO: "menta",
};

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);
  const [cantidad, setCantidad] = useState(1);
  const [opcionesTexto, setOpcionesTexto] = useState("");
  const {items, addItem, removeItem, updateQuantity, total} = useCart();

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    try {
      const res = await fetch("/api/productos");
      const data = await res.json();
      setProductos(data.filter((p: Producto) => p.activo));
    } catch (error) {
      console.error("Error fetching productos:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProductos =
    filtroTipo === "all"
      ? productos
      : productos.filter((p) => p.tipo === filtroTipo);

  const openModal = (producto: Producto) => {
    setSelectedProducto(producto);
    setCantidad(1);
    setOpcionesTexto("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedProducto(null);
  };

  const handleAddToCart = () => {
    if (!selectedProducto) return;

    addItem({
      productoId: selectedProducto.id,
      nombre: selectedProducto.nombre,
      precio: selectedProducto.precio,
      cantidad,
      cantidadFotos: (selectedProducto as any).cantidadFotos || 0,
      opciones: selectedProducto.tipo === "PERSONALIZADO" ? opcionesTexto : {cantidad},
      envioGratis: (selectedProducto as any).envioGratis || false,
    });

    closeModal();
  };

  const precioTotal = selectedProducto ? selectedProducto.precio * cantidad : 0;

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {["all", "FOTO", "STICKER", "PERSONALIZADO"].map((tipo) => (
              <Button
                key={tipo}
                variant={filtroTipo === tipo ? "default" : "outline"}
                onClick={() => setFiltroTipo(tipo)}
                size="sm"
              >
                {tipo === "all" ? "Todos" : tipo === "FOTO" ? "Fotos" : tipo === "STICKER" ? "Stickers" : "Personalizado"}
              </Button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-12">Cargando...</div>
          ) : filteredProductos.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No hay productos en esta categoría
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProductos.map((producto) => (
                <Card
                  key={producto.id}
                  className="group hover:shadow-lg transition-shadow overflow-hidden"
                >
                  <div className="aspect-square bg-muted relative">
                    {producto.imagenUrl ? (
                      <img
                        src={producto.imagenUrl}
                        alt={producto.nombre}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl">
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
                    <h3 className="font-playfair text-xl mb-1">{producto.nombre}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {producto.descripcion}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-xl">
                        {producto.precio === 0
                          ? "A consultar"
                          : `$${producto.precio.toLocaleString()}`}
                      </p>
                      <Button onClick={() => openModal(producto)}>
                        Agregar al carrito
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          {selectedProducto && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddToCart();
              }}
            >
              <DialogHeader>
                <DialogTitle>{selectedProducto.nombre}</DialogTitle>
                <DialogDescription>{selectedProducto.descripcion}</DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                {selectedProducto.tipo === "PERSONALIZADO" ? (
                  <div className="space-y-2">
                    <Label>¿Qué tenés en mente?</Label>
                    <Textarea
                      value={opcionesTexto}
                      onChange={(e) => setOpcionesTexto(e.target.value)}
                      placeholder="Contame tu idea: tamaño, cantidad, temática..."
                      rows={4}
                      required
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>Cantidad</Label>
                    <div className="flex items-center gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <Input
                        type="number"
                        value={cantidad}
                        onChange={(e) => setCantidad(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-20 text-center"
                        min="1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setCantidad(cantidad + 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-medium">Total:</span>
                  <span className="text-xl font-bold">
                    {selectedProducto.precio === 0
                      ? "A consultar"
                      : `$${precioTotal.toLocaleString()}`}
                  </span>
                </div>
                <Button type="submit" className="w-full" size="lg">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Agregar al carrito
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}