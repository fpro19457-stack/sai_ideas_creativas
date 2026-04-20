"use client";

import {useState, useEffect} from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Badge} from "@/components/ui/badge";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Switch} from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {Textarea} from "@/components/ui/textarea";
import {Plus, Pencil} from "lucide-react";

interface Cupon {
  id: string;
  codigo: string;
  descripcion: string | null;
  tipo: string;
  valor: number;
  minCompra: number | null;
  maxUsos: number | null;
  usosActuales: number;
  activo: boolean;
  fechaInicio: string | null;
  fechaFin: string | null;
  createdAt: string;
}

export default function AdminCuponesPage() {
  const [cupones, setCupones] = useState<Cupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCupon, setEditingCupon] = useState<Cupon | null>(null);

  const [formData, setFormData] = useState({
    codigo: "",
    descripcion: "",
    tipo: "PORCENTAJE",
    valor: "",
    minCompra: "",
    maxUsos: "",
    fechaInicio: "",
    fechaFin: "",
    activo: true,
  });

  useEffect(() => {
    fetchCupones();
  }, []);

  const fetchCupones = async () => {
    try {
      const res = await fetch("/api/cupones");
      const data = await res.json();
      setCupones(data);
    } catch (error) {
      console.error("Error fetching cupones:", error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (cupon?: Cupon) => {
    if (cupon) {
      setEditingCupon(cupon);
      setFormData({
        codigo: cupon.codigo,
        descripcion: cupon.descripcion || "",
        tipo: cupon.tipo,
        valor: cupon.valor.toString(),
        minCompra: cupon.minCompra?.toString() || "",
        maxUsos: cupon.maxUsos?.toString() || "",
        fechaInicio: cupon.fechaInicio?.split("T")[0] || "",
        fechaFin: cupon.fechaFin?.split("T")[0] || "",
        activo: cupon.activo,
      });
    } else {
      setEditingCupon(null);
      setFormData({
        codigo: "",
        descripcion: "",
        tipo: "PORCENTAJE",
        valor: "",
        minCompra: "",
        maxUsos: "",
        fechaInicio: "",
        fechaFin: "",
        activo: true,
      });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingCupon(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingCupon ? `/api/cupones/${editingCupon.id}` : "/api/cupones";
      const method = editingCupon ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await fetchCupones();
        closeModal();
      }
    } catch (error) {
      console.error("Error saving cupon:", error);
    }
  };

  const toggleActivo = async (cupon: Cupon) => {
    try {
      await fetch(`/api/cupones/${cupon.id}/toggle`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({activo: !cupon.activo}),
      });
      await fetchCupones();
    } catch (error) {
      console.error("Error toggling cupon:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-playfair">Cupones</h1>
          <p className="text-muted-foreground">Gestiona códigos de descuento</p>
        </div>
        <Button onClick={() => openModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo cupón
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-8">Cargando...</div>
          ) : cupones.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay cupones aún
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Código</th>
                    <th className="text-left p-3">Tipo</th>
                    <th className="text-left p-3">Valor</th>
                    <th className="text-left p-3">Usos</th>
                    <th className="text-left p-3">Vigencia</th>
                    <th className="text-left p-3">Estado</th>
                    <th className="text-right p-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {cupones.map((cupon) => (
                    <tr key={cupon.id} className="border-b">
                      <td className="p-3">
                        <div className="font-mono font-medium">{cupon.codigo}</div>
                        {cupon.descripcion && (
                          <div className="text-sm text-muted-foreground">
                            {cupon.descripcion}
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <Badge variant={cupon.tipo === "PORCENTAJE" ? "info" : "secondary"}>
                          {cupon.tipo === "PORCENTAJE" ? "%" : "$"}
                        </Badge>
                      </td>
                      <td className="p-3">
                        {cupon.tipo === "PORCENTAJE"
                          ? `${cupon.valor}%`
                          : `$${cupon.valor.toLocaleString()}`}
                      </td>
                      <td className="p-3">
                        {cupon.maxUsos
                          ? `${cupon.usosActuales}/${cupon.maxUsos}`
                          : `${cupon.usosActuales}/∞`}
                      </td>
                      <td className="p-3 text-sm">
                        {cupon.fechaFin
                          ? new Date(cupon.fechaFin).toLocaleDateString("es-AR")
                          : "Sin vencimiento"}
                      </td>
                      <td className="p-3">
                        <Switch checked={cupon.activo} onCheckedChange={() => toggleActivo(cupon)} />
                      </td>
                      <td className="p-3 text-right">
                        <Button variant="ghost" size="icon" onClick={() => openModal(cupon)}>
                          <Pencil className="w-4 h-4" />
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
                {editingCupon ? "Editar cupón" : "Nuevo cupón"}
              </DialogTitle>
              <DialogDescription>
                {editingCupon ? "Modificá los datos del cupón" : "Creá un nuevo código de descuento"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="codigo">Código</Label>
                <Input
                  id="codigo"
                  value={formData.codigo}
                  onChange={(e) => setFormData({...formData, codigo: e.target.value.toUpperCase()})}
                  className="font-mono"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción (opcional)</Label>
                <Input
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  placeholder="20% de descuento de cumpleaños"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo</Label>
                  <select
                    id="tipo"
                    value={formData.tipo}
                    onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                    className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="PORCENTAJE">Porcentaje (%)</option>
                    <option value="MONTO_FIJO">Monto fijo ($)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valor">Valor</Label>
                  <Input
                    id="valor"
                    type="number"
                    value={formData.valor}
                    onChange={(e) => setFormData({...formData, valor: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minCompra">Compra mínima ($)</Label>
                  <Input
                    id="minCompra"
                    type="number"
                    value={formData.minCompra}
                    onChange={(e) => setFormData({...formData, minCompra: e.target.value})}
                    placeholder="Opcional"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxUsos">Máximo de usos</Label>
                  <Input
                    id="maxUsos"
                    type="number"
                    value={formData.maxUsos}
                    onChange={(e) => setFormData({...formData, maxUsos: e.target.value})}
                    placeholder="0 = ilimitado"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fechaInicio">Fecha inicio</Label>
                  <Input
                    id="fechaInicio"
                    type="date"
                    value={formData.fechaInicio}
                    onChange={(e) => setFormData({...formData, fechaInicio: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fechaFin">Fecha vencimiento</Label>
                  <Input
                    id="fechaFin"
                    type="date"
                    value={formData.fechaFin}
                    onChange={(e) => setFormData({...formData, fechaFin: e.target.value})}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingCupon ? "Guardar cambios" : "Crear cupón"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}