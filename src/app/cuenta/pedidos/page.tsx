"use client";

import {useState, useEffect} from "react";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Package, ChevronRight} from "lucide-react";

interface Pedido {
  id: string;
  numero: string;
  estado: string;
  totalFinal: number;
  items: any[];
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

const estadoBadgeVariant = (estado: string): "warning" | "success" | "secondary" | "destructive" => {
  if (estado === "LISTO" || estado === "ENTREGADO") return "success";
  if (estado === "CANCELADO") return "destructive";
  return "warning";
};

export default function ClientePedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPedidos();
  }, [page]);

  const fetchPedidos = async () => {
    try {
      const res = await fetch(`/api/cliente/pedidos?page=${page}`);
      const data = await res.json();
      setPedidos(data.pedidos || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error("Error fetching pedidos:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-playfair mb-8">Mis pedidos</h1>

        {pedidos.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-5xl mb-4">📦</div>
              <p className="text-muted-foreground mb-6">Todavía no realizaste ningún pedido</p>
              <Button asChild>
                <Link href="/productos">Ir a la tienda</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {pedidos.map((pedido) => (
              <Card key={pedido.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-medium">{pedido.numero}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(pedido.creadoEn).toLocaleDateString("es-AR")}
                      </p>
                    </div>
                    <Badge variant={estadoBadgeVariant(pedido.estado)}>
                      {estadoLabels[pedido.estado]}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Package className="w-4 h-4" />
                    <span>
                      {pedido.items.map((i: any) => i.producto?.nombre || "Producto").slice(0, 3).join(", ")}
                      {pedido.items.length > 3 && ` +${pedido.items.length - 3} más`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="font-bold">${pedido.totalFinal.toLocaleString()}</p>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/cuenta/pedidos/${pedido.id}`}>
                        Ver detalle
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                >
                  Anterior
                </Button>
                <span className="flex items-center px-4">
                  Página {page} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                >
                  Siguiente
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}