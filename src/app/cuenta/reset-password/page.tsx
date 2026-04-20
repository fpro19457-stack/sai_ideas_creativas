"use client";

import {useState, Suspense} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Loader2} from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [step, setStep] = useState(token ? "reset" : "request");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: "success" | "error"; text: string} | null>(null);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("handleRequestReset called, email:", email);
    setLoading(true);
    setMessage(null);

    try {
      console.log("Making fetch request...");
      const res = await fetch("/api/cliente/auth/reset-password", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({email}),
      });
      console.log("Response status:", res.status);

      const data = await res.json();
      console.log("Response data:", data);

      if (res.ok) {
        setMessage({type: "success", text: "Revisá tu email para restablecer la contraseña"});
      } else {
        setMessage({type: "error", text: data.error || "Error"});
      }
    } catch (err) {
      console.error("Catch error:", err);
      setMessage({type: "error", text: "Error de conexión"});
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (password !== confirmPassword) {
      setMessage({type: "error", text: "Las contraseñas no coinciden"});
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setMessage({type: "error", text: "La contraseña debe tener al menos 6 caracteres"});
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/cliente/auth/reset-password", {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({token, password}),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({type: "success", text: "Contraseña actualizada. Ya podés iniciar sesión."});
        setTimeout(() => router.push("/cuenta/login"), 2000);
      } else {
        setMessage({type: "error", text: data.error || "Error"});
      }
    } catch {
      setMessage({type: "error", text: "Error de conexión"});
    } finally {
      setLoading(false);
    }
  };

  if (step === "request") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-crema p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-3xl">
              ✦
            </div>
            <CardTitle className="text-2xl font-playfair">Olvidé mi contraseña</CardTitle>
            <CardDescription>Ingresá tu email y te enviaremos un enlace para restablecerla</CardDescription>
          </CardHeader>
          <form>
            <CardContent className="space-y-4">
              {message && (
                <div className={`rounded-lg p-3 text-sm text-center ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-destructive/20 text-destructive"}`}>
                  {message.text}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="button" className="w-full" disabled={loading} onClick={handleRequestReset}>
                {loading ? "Enviando..." : "Enviar enlace"}
              </Button>
              <Link href="/cuenta/login" className="text-sm text-muted-foreground hover:text-foreground text-center">
                Volver a iniciar sesión
              </Link>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-crema p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-3xl">
            ✦
          </div>
          <CardTitle className="text-2xl font-playfair">Nueva contraseña</CardTitle>
          <CardDescription>Elegí una nueva contraseña para tu cuenta</CardDescription>
        </CardHeader>
        <form onSubmit={handleResetPassword}>
          <CardContent className="space-y-4">
            {message && (
              <div className={`rounded-lg p-3 text-sm text-center ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-destructive/20 text-destructive"}`}>
                {message.text}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="password">Nueva contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Guardando..." : "Guardar contraseña"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}