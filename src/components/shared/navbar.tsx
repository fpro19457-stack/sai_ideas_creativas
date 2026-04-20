"use client";

import {useState, useEffect} from "react";
import {usePathname} from "next/navigation";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {Menu, X, ShoppingCart, User, LogOut} from "lucide-react";
import {Button} from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ClienteSession {
  nombre: string;
  email: string;
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cliente, setCliente] = useState<ClienteSession | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchClienteSession();
  }, [pathname]);

  const fetchClienteSession = async () => {
    try {
      const res = await fetch("/api/cliente/auth/session");
      if (res.ok) {
        const data = await res.json();
        if (data && data.id) {
          setCliente(data);
        } else {
          setCliente(null);
        }
      }
    } catch {
      setCliente(null);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/cliente/auth/logout", {method: "POST"});
    setCliente(null);
    router.push("/");
  };

  const initial = cliente?.nombre?.charAt(0).toUpperCase() || "?";

  return (
    <nav className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Sai Ideas Creativas" className="h-10 w-auto" />
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm hover:text-primary transition-colors">
              Inicio
            </Link>
            <Link href="/productos" className="text-sm hover:text-primary transition-colors">
              Productos
            </Link>
            <Link
              href="/#como-funciona"
              className="text-sm hover:text-primary transition-colors"
            >
              Cómo funciona
            </Link>
            <Link href="/#contacto" className="text-sm hover:text-primary transition-colors">
              Contacto
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {mounted && cliente ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full w-9 h-9">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm font-medium text-primary-foreground">
                      {initial}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/cuenta/perfil">Mi perfil</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/cuenta/pedidos">Mis pedidos</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" />
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/cuenta/login">Iniciar sesión</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/cuenta/registro">Registrarse</Link>
                </Button>
              </div>
            )}
            <Link href="/carrito">
              <Button variant="ghost" size="icon">
                <ShoppingCart className="w-5 h-5" />
              </Button>
            </Link>
            <button
              className="md:hidden p-2 hover:bg-muted rounded-lg"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t bg-background">
          <div className="px-4 py-3 space-y-2">
            <Link
              href="/"
              className="block py-2 text-sm hover:text-primary"
              onClick={() => setMobileOpen(false)}
            >
              Inicio
            </Link>
            <Link
              href="/productos"
              className="block py-2 text-sm hover:text-primary"
              onClick={() => setMobileOpen(false)}
            >
              Productos
            </Link>
            <Link
              href="/#como-funciona"
              className="block py-2 text-sm hover:text-primary"
              onClick={() => setMobileOpen(false)}
            >
              Cómo funciona
            </Link>
            <Link
              href="/#contacto"
className="block py-2 text-sm hover:text-primary"
            >
              Contacto
            </Link>
            {!cliente && (
              <>
                <Link
                  href="/cuenta/login"
                  className="block py-2 text-sm hover:text-primary"
                  onClick={() => setMobileOpen(false)}
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/cuenta/registro"
                  className="block py-2 text-sm hover:text-primary"
                  onClick={() => setMobileOpen(false)}
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}