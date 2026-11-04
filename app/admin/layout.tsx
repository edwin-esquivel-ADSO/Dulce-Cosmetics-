"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Store,
  Sparkles,
  Users,
  LogOut,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Si estamos en la pantalla de login, renderizamos directamente sin sidebar
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const navLinks = [
    {
      name: "Dashboard & Métricas",
      href: "/admin",
      icon: LayoutDashboard,
      active: pathname === "/admin",
    },
    {
      name: "Gestión de Pedidos",
      href: "/admin/pedidos",
      icon: ShoppingBag,
      active: pathname === "/admin/pedidos",
    },
    {
      name: "Gestión de Productos",
      href: "/admin/productos",
      icon: Package,
      active: pathname === "/admin/productos",
    },
    {
      name: "Administradores",
      href: "/admin/administradores",
      icon: Users,
      active: pathname === "/admin/administradores",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f3f3f4] flex flex-col md:flex-row antialiased">
      {/* Barra Superior Móvil (< md) */}
      <header className="md:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#d4c2c2]/40 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 -ml-1 text-[#7b5455] hover:bg-[#f4c2c2]/20 rounded-xl transition-colors"
            aria-label="Abrir menú de administración"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="Dulce Cosmetics"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-[#f4c2c2]/50 shrink-0"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-lg font-bold text-[#7b5455]">Dulce Admin</span>
                <span className="px-1.5 py-0.5 text-[9px] font-bold bg-[#f4c2c2]/50 text-[#7b5455] rounded-full uppercase">
                  Panel
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            prefetch={true}
            className="p-2 text-gray-600 hover:text-[#7b5455] hover:bg-gray-100 rounded-lg transition-colors"
            title="Ir a la Tienda"
          >
            <Store className="w-4 h-4" />
          </Link>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Cerrar Sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Drawer / Fondo oscuro en Móvil */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-sm transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Lateral (Desktop fijo, Móvil Drawer deslizable) */}
      <aside
        className={`fixed md:sticky top-0 z-50 md:z-auto inset-y-0 left-0 w-72 md:w-64 bg-white border-r border-[#d4c2c2]/40 shrink-0 flex flex-col justify-between p-6 shadow-xl md:shadow-sm transition-transform duration-300 ease-in-out md:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } md:h-screen md:overflow-y-auto`}
      >
        <div className="space-y-7">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Dulce Cosmetics"
                className="w-10 h-10 rounded-full object-cover ring-2 ring-[#f4c2c2]/50 shrink-0 shadow-sm"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-serif text-xl font-bold text-[#7b5455]">
                    Dulce Admin
                  </span>
                  <span className="px-1.5 py-0.5 text-[9px] font-bold bg-[#f4c2c2]/50 text-[#7b5455] rounded-full uppercase">
                    Panel
                  </span>
                </div>
                <p className="text-[10px] uppercase tracking-widest text-[#735c00] font-semibold mt-0.5">
                  Control & Operaciones
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-1.5">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    item.active
                      ? "bg-[#7b5455] text-white shadow-sm shadow-[#7b5455]/20"
                      : "text-gray-700 hover:bg-[#f4c2c2]/25 hover:text-[#7b5455]"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${item.active ? "text-white" : "text-[#7b5455]"}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer del Sidebar con enlaces */}
        <div className="pt-6 border-t border-gray-100 space-y-2.5">
          <Link
            href="/"
            prefetch={true}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Store className="w-4 h-4 text-[#7b5455]" />
            <span>Volver a la Tienda</span>
          </Link>

          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Contenido Principal Responsive del Admin */}
      <main className="flex-1 p-3.5 sm:p-6 lg:p-8 overflow-x-hidden min-h-screen">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}

