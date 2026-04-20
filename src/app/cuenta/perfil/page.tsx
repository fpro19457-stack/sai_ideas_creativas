"use client";

import {useState, useEffect} from "react";
import {useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {User, Lock, Loader2, ChevronLeft} from "lucide-react";
import Link from "next/link";

interface Cliente {
  id: string;
  email: string;
  nombre: string;
  telefono: string | null;
}

export default function PerfilPage() {
  const router = useRouter();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingDatos, setSavingDatos] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [message, setMessage] = useState<{type: "success" | "error"; text: string} | null>(null);

  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
  });

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
      const res = await fetch("/api/cliente/perfil");
      if (res.ok) {
        const data = await res.json();
        setCliente(data);
        setFormData({
          nombre: data.nombre || "",
          telefono: data.telefono || "",
        });
      } else if (res.status === 401) {
        router.push("/cuenta/login");
      }
    } catch (error) {
      console.error("Error fetching perfil:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitDatos = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingDatos(true);
    setMessage(null);

    try {
      const res = await fetch("/api/cliente/perfil", {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          nombre: formData.nombre,
          telefono: formData.telefono,
        }),
      });

      if (res.ok) {
        setMessage({type: "success", text: "Datos actualizados correctamente"});
      } else {
        const data = await res.json();
        setMessage({type: "error", text: data.error || "Error al actualizar"});
      }
    } catch {
      setMessage({type: "error", text: "Error de conexión"});
    } finally {
      setSavingDatos(false);
    }
  };

  const handleSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPassword(true);
    setMessage(null);

    if (passwordData.passwordNuevo !== passwordData.confirmarPassword) {
      setMessage({type: "error", text: "Las contraseñas nuevas no coinciden"});
      setSavingPassword(false);
      return;
    }

    if (passwordData.passwordNuevo.length < 6) {
      setMessage({type: "error", text: "La contraseña debe tener al menos 6 caracteres"});
      setSavingPassword(false);
      return;
    }

    try {
      const res = await fetch("/api/cliente/perfil", {
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
        setMessage({type: "error", text: data.error || "Error al actualizar contraseña"});
      }
    } catch {
      setMessage({type: "error", text: "Error de conexión"});
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF8F2] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#5C3D2E]" />
      </div>
    );
  }

  const initial = cliente?.nombre?.charAt(0).toUpperCase() || "?";

  return (
    <div className="min-h-screen bg-[#FFF8F2]">
      <header className="bg-white border-b border-[#E5E5E5] py-4">
        <div className="max-w-2xl mx-auto px-4">
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-[#737373] hover:text-[#5C3D2E] transition-colors">
            <ChevronLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="w-24 h-24 rounded-full bg-[#F9C6C9] flex items-center justify-center mx-auto mb-4 shadow-md">
            <span className="text-4xl font-playfair text-[#5C3D2E]">{initial}</span>
          </div>
          <h1 className="text-2xl font-playfair text-[#5C3D2E]">{cliente?.nombre}</h1>
          <p className="text-[#737373]">{cliente?.email}</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-xl ${message.type === "success" ? "bg-[#B8E0D2]/30 text-[#5C3D2E]" : "bg-[#F9C6C9]/30 text-[#5C3D2E]"}`}>
            <p className="text-center font-medium">{message.text}</p>
          </div>
        )}

        <Card className="mb-6 shadow-sm border-0 bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg text-[#5C3D2E]">
              <User className="w-5 h-5" />
              Datos personales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm text-[#737373]">Email</Label>
              <Input
                id="email"
                type="email"
                value={cliente?.email || ""}
                disabled
                className="bg-[#F5F5F5] border-[#E5E5E5] text-[#737373]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nombre" className="text-sm text-[#737373]">Nombre completo</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                className="border-[#E5E5E5]"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefono" className="text-sm text-[#737373]">Teléfono</Label>
              <Input
                id="telefono"
                value={formData.telefono}
                onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                placeholder="Ej: 11 1234 5678"
                className="border-[#E5E5E5]"
              />
            </div>
            <div className="pt-2">
              <Button
                onClick={handleSubmitDatos}
                disabled={savingDatos}
                className="w-full bg-[#F9C6C9] hover:bg-[#F0B8BC] text-[#5C3D2E]"
              >
                {savingDatos ? "Guardando..." : "Guardar datos"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="h-px bg-[#E5E5E5] my-8" />

        <Card className="shadow-sm border-0 bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg text-[#5C3D2E]">
              <Lock className="w-5 h-5" />
              Cambiar contraseña
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="passwordActual" className="text-sm text-[#737373]">Contraseña actual</Label>
              <Input
                id="passwordActual"
                type="password"
                value={passwordData.passwordActual}
                onChange={(e) => setPasswordData({...passwordData, passwordActual: e.target.value})}
                className="border-[#E5E5E5]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="passwordNuevo" className="text-sm text-[#737373]">Nueva contraseña</Label>
              <Input
                id="passwordNuevo"
                type="password"
                value={passwordData.passwordNuevo}
                onChange={(e) => setPasswordData({...passwordData, passwordNuevo: e.target.value})}
                className="border-[#E5E5E5]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmarPassword" className="text-sm text-[#737373]">Confirmar nueva contraseña</Label>
              <Input
                id="confirmarPassword"
                type="password"
                value={passwordData.confirmarPassword}
                onChange={(e) => setPasswordData({...passwordData, confirmarPassword: e.target.value})}
                className="border-[#E5E5E5]"
              />
            </div>
            <div className="pt-2">
              <Button
                onClick={handleSubmitPassword}
                disabled={savingPassword}
                className="w-full bg-[#F9C6C9] hover:bg-[#F0B8BC] text-[#5C3D2E]"
              >
                {savingPassword ? "Guardando..." : "Cambiar contraseña"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}