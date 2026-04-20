"use client";

import {useState, useEffect} from "react";

export default function AdminConfiguracionPage() {
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
      if (!cancelled) setLoading(false);
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <div className="p-6">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-playfair">Configuración</h1>
        <p className="text-muted-foreground">Configuración del sistema</p>
      </div>
      <p className="text-muted-foreground">Próximamente...</p>
    </div>
  );
}