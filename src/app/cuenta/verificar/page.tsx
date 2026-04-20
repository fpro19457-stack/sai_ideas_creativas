"use client";

import {useState, useEffect, Suspense} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";

function VerificarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMsg("Token requerido");
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(`/api/cliente/auth/verificar?token=${token}`);
        const data = await res.json();

        if (res.ok) {
          setStatus("success");
        } else {
          setStatus("error");
          setErrorMsg(data.error || "Token inválido o expirado");
        }
      } catch {
        setStatus("error");
        setErrorMsg("Error de conexión");
      }
    };

    verify();
  }, [token]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-crema p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Verificando tu email...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-crema p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/20 text-3xl">
              ✦
            </div>
            <CardTitle className="text-2xl font-playfair">Token inválido</CardTitle>
            <CardDescription>{errorMsg}</CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col gap-4">
            <Button onClick={() => router.push("/cuenta/registro")} className="w-full">
              Crear nueva cuenta
            </Button>
            <Link href="/cuenta/login" className="text-sm text-muted-foreground hover:text-foreground text-center">
              Ir a login
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-crema p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
            ✦
          </div>
          <CardTitle className="text-2xl font-playfair">¡Email verificado!</CardTitle>
          <CardDescription>Ya podés iniciar sesión con tu cuenta</CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col gap-4">
          <Button onClick={() => router.push("/cuenta/login")} className="w-full">
            Iniciar sesión
          </Button>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground text-center">
            Ir a la tienda
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function VerificarPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-crema p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Verificando tu email...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <VerificarContent />
    </Suspense>
  );
}