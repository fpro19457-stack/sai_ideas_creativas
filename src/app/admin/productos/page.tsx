"use client";

import {useState, useEffect} from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Badge} from "@/components/ui/badge";
import {Card, CardContent} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {Switch} from "@/components/ui/switch";
import {Textarea} from "@/components/ui/textarea";
import {Plus, Pencil, Trash2} from "lucide-react";

interface Producto {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  tipo: string;
  precio: number;
  activo: boolean;
  imagenUrl: string | null;
  envioGratis: boolean;
  cantidadFotos: number | null;
  createdAt: string;
}

const tipoColors: Record<string, "rosa" | "lila" | "menta"> = {
  FOTO: "rosa",
  STICKER: "lila",
  PERSONALIZADO: "menta",
};

export default function AdminProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);

  const [formData, setFormData] = useState({
    nombre: "",
    slug: "",
    descripcion: "",
    tipo: "FOTO",
    precio: "",
    imagenUrl: "",
    activo: true,
    cantidadFotos: 0,
    envioGratis: false,
  });

  useEffect(() => {
    let cancelled = false;

    const fetchProductos = async () => {
      try {
        const resPerfil = await fetch("/api/admin/perfil");
        if (cancelled) return;
        if (!resPerfil.ok) {
          window.location.href = "/admin/login";
          return;
        }

        const res = await fetch("/api/productos");
        const data = await res.json();
        if (!cancelled) setProductos(data);
      } catch (error) {
        console.error("Error fetching productos:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProductos();

    return () => {
      cancelled = true;
    };
  }, []);

  const openModal = (producto?: Producto) => {
    if (producto) {
      setEditingProducto(producto);
      setFormData({
        nombre: producto.nombre,
        slug: producto.slug,
        descripcion: producto.descripcion || "",
        tipo: producto.tipo,
        precio: producto.precio.toString(),
        imagenUrl: producto.imagenUrl || "",
        activo: producto.activo,
        cantidadFotos: producto.cantidadFotos || 0,
        envioGratis: producto.envioGratis,
      });
    } else {
      setEditingProducto(null);
      setFormData({
        nombre: "",
        slug: "",
        descripcion: "",
        tipo: "FOTO",
        precio: "",
        imagenUrl: "",
        activo: true,
        cantidadFotos: 0,
        envioGratis: false,
      });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingProducto(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingProducto
        ? `/api/productos/${editingProducto.id}`
        : "/api/productos";
      const method = editingProducto ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const res = await fetch("/api/productos");
        const data = await res.json();
        setProductos(data);
        closeModal();
      }
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  };

  const handleDelete = async (producto: Producto) => {
    if (!confirm(`¿Eliminar "${producto.nombre}"?`)) return;
    try {
      const res = await fetch(`/api/productos/${producto.id}`, {method: "DELETE"});
      if (res.ok) {
        setProductos(productos.filter((p) => p.id !== producto.id));
      }
    } catch (error) {
      console.error("Error deleting producto:", error);
    }
  };

  const toggleActivo = async (producto: Producto) => {
    try {
      await fetch(`/api/productos/${producto.id}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({activo: !producto.activo}),
      });
      setProductos(
        productos.map((p) =>
          p.id === producto.id ? {...p, activo: !p.activo} : p
        )
      );
    } catch (error) {
      console.error("Error toggling producto:", error);
    }
  };

  const handleGenerateSlug = () => {
    const slug = formData.nombre
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    setFormData({...formData, slug});
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-playfair">Productos</h1>
          <p className="text-muted-foreground">Gestiona tu catálogo</p>
        </div>
        <Button onClick={() => openModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo producto
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-8">Cargando...</div>
          ) : productos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay productos aún
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Nombre</th>
                    <th className="text-left p-3">Tipo</th>
                    <th className="text-left p-3">Precio</th>
                    <th className="text-left p-3">Estado</th>
                    <th className="text-right p-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map((producto) => (
                    <tr key={producto.id} className="border-b">
                      <td className="p-3">
                        <div className="font-medium">{producto.nombre}</div>
                        <div className="text-sm text-muted-foreground">
                          /{producto.slug}
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant={tipoColors[producto.tipo]}>
                          {producto.tipo}
                        </Badge>
                      </td>
                      <td className="p-3">${producto.precio.toLocaleString()}</td>
                      <td className="p-3">
                        <Switch
                          checked={producto.activo}
                          onCheckedChange={() => toggleActivo(producto)}
                        />
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openModal(producto)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(producto)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingProducto ? "Editar producto" : "Nuevo producto"}
              </DialogTitle>
              <DialogDescription>
                {editingProducto
                  ? "Modificá los datos del producto"
                  : "Agregá un nuevo producto al catálogo"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({...formData, nombre: e.target.value})
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <div className="flex gap-2">
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({...formData, slug: e.target.value})
                    }
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGenerateSlug}
                    size="sm"
                  >
                    Generar
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) =>
                    setFormData({...formData, descripcion: e.target.value})
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(value) =>
                    setFormData({...formData, tipo: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FOTO">Foto</SelectItem>
                    <SelectItem value="STICKER">Sticker</SelectItem>
                    <SelectItem value="PERSONALIZADO">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="precio">Precio ($)</Label>
                <Input
                  id="precio"
                  type="number"
                  step="100"
                  value={formData.precio}
                  onChange={(e) =>
                    setFormData({...formData, precio: e.target.value})
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="imagenUrl">URL de imagen</Label>
                <Input
                  id="imagenUrl"
                  value={formData.imagenUrl}
                  onChange={(e) =>
                    setFormData({...formData, imagenUrl: e.target.value})
                  }
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cantidadFotos">Cantidad de fotos requeridas</Label>
                <p className="text-xs text-gray-500">Dejá en 0 si el producto no requiere fotos</p>
                <Input
                  id="cantidadFotos"
                  type="number"
                  min="0"
                  value={formData.cantidadFotos || 0}
                  onChange={(e) => setFormData({...formData, cantidadFotos: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="envioGratis">¿Este producto tiene envío gratis?</Label>
                  <p className="text-xs text-muted-foreground">El costo de envío no se cobrará si todos los productos del carrito tienen envío gratis</p>
                </div>
                <Switch
                  id="envioGratis"
                  checked={formData.envioGratis}
                  onCheckedChange={(checked) => setFormData({...formData, envioGratis: checked})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingProducto ? "Guardar cambios" : "Crear producto"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}