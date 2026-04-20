"use client";

import {useState, useEffect} from "react";
import {useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Badge} from "@/components/ui/badge";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {Search, ChevronLeft, ChevronRight} from "lucide-react";

interface Pedido {
  id: string;
  numero: string;
  clienteNombre: string;
  clienteEmail: string;
  estado: string;
  tipoEntrega: string;
  totalFinal: number;
  creadoEn: string;
  items: any[];
}

const estadoColors: Record<string, string> = {
  PENDIENTE: "warning",
  PAGO_PENDIENTE: "warning",
  PAGO_CONFIRMADO: "info",
  EN_PRODUCCION: "info",
  LISTO: "success",
  ENVIADO: "lila",
  ENTREGADO: "menta",
  CANCELADO: "secondary",
};

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

export default function AdminPedidosPage() {
  const router = useRouter();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [estado, setEstado] = useState("all");
  const [tipoEntrega, setTipoEntrega] = useState("all");
  const [search, setSearch] = useState("");

  const fetchPedidos = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (estado !== "all") params.set("estado", estado);
      if (tipoEntrega !== "all") params.set("tipoEntrega", tipoEntrega);
      if (search) params.set("search", search);
      params.set("page", page.toString());

      const res = await fetch(`/api/pedidos?${params}`);
      const data = await res.json();
      setPedidos(data.pedidos);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error fetching pedidos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
  }, [page, estado, tipoEntrega]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchPedidos();
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return "Hace instantes";
    if (hours < 24) return `Hace ${hours}h`;
    return d.toLocaleDateString("es-AR", {day: "numeric", month: "short"});
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-playfair">Pedidos</h1>
        <p className="text-muted-foreground">Gestiona todos los pedidos</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por número, nombre o email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={estado} onValueChange={setEstado}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                <SelectItem value="PAGO_PENDIENTE">Pago Pendiente</SelectItem>
                <SelectItem value="PAGO_CONFIRMADO">Pago Confirmado</SelectItem>
                <SelectItem value="EN_PRODUCCION">En Producción</SelectItem>
                <SelectItem value="LISTO">Listo</SelectItem>
                <SelectItem value="ENVIADO">Enviado</SelectItem>
                <SelectItem value="ENTREGADO">Entregado</SelectItem>
                <SelectItem value="CANCELADO">Cancelado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={tipoEntrega} onValueChange={setTipoEntrega}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Entrega" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="ENVIO">Envío</SelectItem>
                <SelectItem value="RETIRO_LOCAL">Retiro</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit">Buscar</Button>
          </form>

          {loading ? (
            <div className="text-center py-8">Cargando...</div>
          ) : pedidos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay pedidos que coincidan con los filtros
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Número</th>
                      <th className="text-left p-3">Cliente</th>
                      <th className="text-left p-3">Productos</th>
                      <th className="text-left p-3">Estado</th>
                      <th className="text-left p-3">Entrega</th>
                      <th className="text-left p-3">Fecha</th>
                      <th className="text-right p-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedidos.map((pedido) => (
                      <tr key={pedido.id} className="border-b">
                        <td className="p-3 font-medium">{pedido.numero}</td>
                        <td className="p-3">
                          <div>{pedido.clienteNombre}</div>
                          <div className="text-sm text-muted-foreground">
                            {pedido.clienteEmail}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="text-sm">
                            {pedido.items.length} item(s)
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant={estadoColors[pedido.estado] as any}>
                            {estadoLabels[pedido.estado]}
                          </Badge>
                        </td>
                        <td className="p-3">
                          {pedido.tipoEntrega === "ENVIO" ? "📦 Envío" : "🏪 Retiro"}
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">
                          {formatDate(pedido.creadoEn)}
                        </td>
                        <td className="p-3 text-right">
                          <Button
                            variant="ghost"
                            onClick={() => router.push(`/admin/pedidos/${pedido.id}`)}
                          >
                            Ver
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Mostrando {pedidos.length} de {total} pedidos
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="px-3 py-2 text-sm">
                    Página {page} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}