"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Tag,
  DollarSign,
  LogOut,
  Menu,
  User,
  Settings,
} from "lucide-react";
import {useState, useEffect} from "react";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";

const navItems = [
  {href: "/admin", label: "Dashboard", icon: LayoutDashboard},
  {href: "/admin/pedidos", label: "Pedidos", icon: ShoppingCart},
  {href: "/admin/productos", label: "Productos", icon: Package},
  {href: "/admin/cupones", label: "Cupones", icon: Tag},
  {href: "/admin/finanzas", label: "Finanzas", icon: DollarSign},
  {href: "/admin/perfil", label: "Mi perfil", icon: User},
  {href: "/admin/configuracion", label: "Configuración", icon: Settings},
];

export default function AdminLayout({children}: {children: React.ReactNode}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (pathname === "/admin/login") {
      setChecking(false);
      return;
    }

    let cancelled = false;

    const checkSession = async () => {
      try {
        const res = await fetch("/api/admin/perfil");
        if (cancelled) return;
        if (res.ok) {
          const data = await res.json();
          setAdminEmail(data.email);
        } else {
          window.location.href = "/admin/login";
          return;
        }
      } catch {
        if (!cancelled) window.location.href = "/admin/login";
      } finally {
        if (!cancelled) setChecking(false);
      }
    };

    checkSession();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const handleSignOut = () => {
    document.cookie = "admin-session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "/admin/login";
  };

  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#3D2B1F] text-[#FFF8F2] transform transition-transform duration-200 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-2xl">✦</span>
              <span className="font-playfair text-xl">Admin Panel</span>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto min-h-0">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
                    isActive
                      ? "bg-[#F9C6C9] text-[#5C3D2E]"
                      : "hover:bg-white/10"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/10">
            <div className="px-4 py-2 text-sm text-white/60 mb-2">
              {adminEmail || "Admin"}
            </div>
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="w-full justify-start gap-3 text-white/80 hover:bg-white/10 hover:text-white"
            >
              <LogOut className="w-5 h-5" />
              Cerrar sesión
            </Button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b bg-background">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-muted rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-playfair">Admin</span>
          <div className="w-10" />
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}