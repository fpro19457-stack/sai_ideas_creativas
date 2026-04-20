"use client";

import {useState, useEffect} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import Link from "next/link";
import {ShoppingCart, Package, Clock, DollarSign} from "lucide-react";
import {PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend} from "recharts";

const ESTADO_COLORS: Record<string, string> = {
  PENDIENTE: "#F9C6C9",
  PAGO_PENDIENTE: "#FBBF24",
  PAGO_CONFIRMADO: "#A78BFA",
  EN_PRODUCCION: "#818CF8",
  LISTO: "#34D399",
  ENVIADO: "#D4B8E0",
  ENTREGADO: "#B8E0D2",
  CANCELADO: "#6B7280",
};

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

interface Stats {
  pedidosCount: number;
  productosCount: number;
  pedidosPendientes: number;
  pedidosRecientes: any[];
  pedidosPorEstado: any[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      const resPerfil = await fetch("/api/admin/perfil");
      if (cancelled) return;

      if (!resPerfil.ok) {
        window.location.href = "/admin/login";
        return;
      }
      const data = await resPerfil.json();
      if (cancelled) return;
      setAdminEmail(data.email);

      const resStats = await fetch("/api/admin/stats");
      if (resStats.ok) {
        const statsData = await resStats.json();
        if (cancelled) return;
        setStats(statsData);
      }
      if (!cancelled) setLoading(false);
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-playfair mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-playfair mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Bienvenido de vuelta, {adminEmail}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Pedidos</p>
                <p className="text-3xl font-bold">{stats?.pedidosCount || 0}</p>
              </div>
              <ShoppingCart className="w-10 h-10 text-[#F9C6C9]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Productos</p>
                <p className="text-3xl font-bold">{stats?.productosCount || 0}</p>
              </div>
              <Package className="w-10 h-10 text-[#D4B8E0]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendientes</p>
                <p className="text-3xl font-bold">{stats?.pedidosPendientes || 0}</p>
              </div>
              <Clock className="w-10 h-10 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ingresos</p>
                <p className="text-3xl font-bold">$0</p>
              </div>
              <DollarSign className="w-10 h-10 text-[#B8E0D2]" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Últimos Pedidos</CardTitle>
        </CardHeader>
        <CardContent>
          {!stats?.pedidosRecientes || stats.pedidosRecientes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No hay pedidos aún</div>
          ) : (
            <div className="space-y-4">
              {stats.pedidosRecientes.map((pedido: any) => (
                <div key={pedido.id} className="flex items-center justify-between p-4 rounded-xl border">
                  <div>
                    <p className="font-medium">{pedido.numero}</p>
                    <p className="text-sm text-muted-foreground">
                      {pedido.clienteNombre} • {pedido.clienteEmail}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={estadoColors[pedido.estado] as any}>{pedido.estado}</Badge>
                    <Link href={`/admin/pedidos/${pedido.id}`} className="text-sm text-primary hover:underline">
                      Ver
                    </Link>
                  </div>
                </div>
              ))}
              <Link href="/admin/pedidos" className="block text-center text-sm text-primary hover:underline pt-2">
                Ver todos los pedidos →
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {stats?.pedidosPorEstado && stats.pedidosPorEstado.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pedidos por Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.pedidosPorEstado.map((e: any) => ({
                      name: e.estado,
                      value: e._count?.estado || 0,
                      fill: ESTADO_COLORS[e.estado] || "#E5E7EB",
                    }))}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({name, value}) => `${name}: ${value}`}
                  >
                    {stats.pedidosPorEstado.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={ESTADO_COLORS[stats.pedidosPorEstado[index]?.estado] || "#E5E7EB"} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}