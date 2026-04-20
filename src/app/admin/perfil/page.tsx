"use client";

import {useState, useEffect} from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {User, Lock, Loader2} from "lucide-react";

interface Admin {
  id: string;
  email: string;
  role: string;
}

export default function AdminPerfilPage() {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{type: "success" | "error"; text: string} | null>(null);

  const [passwordData, setPasswordData] = useState({
    passwordActual: "",
    passwordNuevo: "",
    confirmarPassword: "",
  });

  useEffect(() => {
    fetchPerfil();
  }, []);

  const fetchPerfil = async () => {
    try {
      const res = await fetch("/api/admin/perfil");
      if (res.ok) {
        const data = await res.json();
        setAdmin(data);
      }
    } catch (error) {
      console.error("Error fetching perfil:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    if (passwordData.passwordNuevo !== passwordData.confirmarPassword) {
      setMessage({type: "error", text: "Las contraseñas nuevas no coinciden"});
      setSaving(false);
      return;
    }

    if (passwordData.passwordNuevo.length < 6) {
      setMessage({type: "error", text: "La contraseña debe tener al menos 6 caracteres"});
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/perfil", {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          passwordActual: passwordData.passwordActual,
          passwordNuevo: passwordData.passwordNuevo,
        }),
      });

      if (res.ok) {
        setMessage({type: "success", text: "Contraseña actualizada correctamente"});
        setPasswordData({passwordActual: "", passwordNuevo: "", confirmarPassword: ""});
      } else {
        const data = await res.json();
        setMessage({type: "error", text: data.error || "Error al actualizar"});
      }
    } catch {
      setMessage({type: "error", text: "Error de conexión"});
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-playfair">Mi cuenta</h1>
        <p className="text-muted-foreground">Gestiona tu cuenta de administrador</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
          {message.text}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Datos de la cuenta
          </CardTitle>
          <CardDescription>Información de tu cuenta de administrador</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={admin?.email || ""} disabled />
          </div>
          <div className="space-y-2">
            <Label>Rol</Label>
            <Input value={admin?.role || ""} disabled />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Cambiar contraseña
          </CardTitle>
          <CardDescription>Actualizá tu contraseña de acceso</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="passwordActual">Contraseña actual</Label>
              <Input
                id="passwordActual"
                type="password"
                value={passwordData.passwordActual}
                onChange={(e) => setPasswordData({...passwordData, passwordActual: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="passwordNuevo">Nueva contraseña</Label>
              <Input
                id="passwordNuevo"
                type="password"
                value={passwordData.passwordNuevo}
                onChange={(e) => setPasswordData({...passwordData, passwordNuevo: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmarPassword">Confirmar nueva contraseña</Label>
              <Input
                id="confirmarPassword"
                type="password"
                value={passwordData.confirmarPassword}
                onChange={(e) => setPasswordData({...passwordData, confirmarPassword: e.target.value})}
                required
              />
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando..." : "Cambiar contraseña"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}