"use client";

import {useState, useEffect} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {DollarSign, CreditCard, Building, Banknote, TrendingDown} from "lucide-react";

interface Stats {
  resumen: {
    total: number;
    porMercadoPago: number;
    porTransferencia: number;
    porEfectivo: number;
    descuentos: number;
    pedidosCompletados: number;
  };
  porDia: {fecha: string; monto: number}[];
  porMetodo: {metodo: string; monto: number; cantidad: number}[];
  transacciones: any[];
}

const COLORS = ["#F9C6C9", "#D4B8E0", "#B8E0D2"];

export default function AdminFinanzasPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState("mes");

  useEffect(() => {
    fetchFinanzas();
  }, [periodo]);

  const getDateRange = () => {
    const now = new Date();
    let desde: Date;

    switch (periodo) {
      case "hoy":
        desde = now;
        break;
      case "semana":
        desde = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "mes":
      default:
        desde = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    return {desde: desde.toISOString(), hasta: now.toISOString()};
  };

  const fetchFinanzas = async () => {
    setLoading(true);
    try {
      const {desde, hasta} = getDateRange();
      const res = await fetch(`/api/admin/finanzas?desde=${desde}&hasta=${hasta}`);
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching finanzas:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (!stats) return;

    const headers = ["Número", "Fecha", "Cliente", "Email", "Método", "Subtotal", "Descuento", "Total", "Estado"];
    const rows = stats.transacciones.map((t: any) => [
      t.numero,
      new Date(t.creadoEn).toLocaleDateString("es-AR"),
      t.clienteNombre,
      t.clienteEmail,
      t.metodoPago,
      t.totalBruto,
      t.descuento,
      t.totalFinal,
      t.estado,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], {type: "text/csv"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ventas-${periodo}.csv`;
    a.click();
  };

  if (loading) {
    return <div className="text-center py-12">Cargando...</div>;
  }

  if (!stats) {
    return <div className="text-center py-12">Error cargando estadísticas</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-playfair">Finanzas</h1>
          <p className="text-muted-foreground">Reportes de ventas</p>
        </div>
        <Select value={periodo} onValueChange={setPeriodo}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hoy">Hoy</SelectItem>
            <SelectItem value="semana">Esta semana</SelectItem>
            <SelectItem value="mes">Este mes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total recaudado</p>
                <p className="text-2xl font-bold">${stats.resumen.total.toLocaleString()}</p>
              </div>
              <DollarSign className="w-10 h-10 text-[#F9C6C9]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">MercadoPago</p>
                <p className="text-2xl font-bold">${stats.resumen.porMercadoPago.toLocaleString()}</p>
              </div>
              <CreditCard className="w-10 h-10 text-[#F9C6C9]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Transferencia</p>
                <p className="text-2xl font-bold">${stats.resumen.porTransferencia.toLocaleString()}</p>
              </div>
              <Building className="w-10 h-10 text-[#D4B8E0]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Descuentos</p>
                <p className="text-2xl font-bold text-red-500">-${stats.resumen.descuentos.toLocaleString()}</p>
              </div>
              <TrendingDown className="w-10 h-10 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ventas por día</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{width: "100%", height: 300}}>
              <ResponsiveContainer width="100%" height="100%" minWidth={300} minHeight={200}>
                <BarChart data={stats.porDia}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fecha" tickFormatter={(v) => new Date(v).toLocaleDateString("es-AR", {day: "numeric"})} />
                  <YAxis />
                  <Tooltip formatter={(value) => {
                      const numValue = typeof value === "number" ? value : 0;
                      return [`$${numValue.toLocaleString()}`, "Ventas"];
                    }} />
                  <Bar dataKey="monto" fill="#F9C6C9" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Por método de pago</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{width: "100%", height: 300}}>
              <ResponsiveContainer width="100%" height="100%" minWidth={300} minHeight={200}>
                <PieChart>
                  <Pie
                    data={stats.porMetodo.filter((m) => m.monto > 0)}
                    dataKey="monto"
                    nameKey="metodo"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({name, percent}) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  >
                    {stats.porMetodo.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Transacciones</CardTitle>
          <Button variant="outline" onClick={exportCSV}>
            Exportar CSV
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Número</th>
                  <th className="text-left p-3">Fecha</th>
                  <th className="text-left p-3">Cliente</th>
                  <th className="text-left p-3">Método</th>
                  <th className="text-right p-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {stats.transacciones.slice(0, 20).map((t: any) => (
                  <tr key={t.id} className="border-b">
                    <td className="p-3">{t.numero}</td>
                    <td className="p-3">{new Date(t.createdAt).toLocaleDateString("es-AR")}</td>
                    <td className="p-3">{t.clienteNombre}</td>
                    <td className="p-3">{t.metodoPago}</td>
                    <td className="p-3 text-right font-medium">${t.totalFinal.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}