"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCart } from "@/hooks/useCart";
import { ShoppingBag, Search, Menu, X, Sparkles, ShieldCheck, User, LogIn } from "lucide-react";

interface NavbarProps {
  brandName?: string;
  announcementText?: string;
}

export default function Navbar({
  brandName = "Dulce Cosmetics",
  announcementText = "Envíos a todo Neiva • Domicilio GRATIS en Las Granjas por compras desde $15.000",
}: NavbarProps) {
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const isAdmin = mounted && (session?.user?.role === "ADMIN" || session?.user?.role === "SUB_ADMIN");

  const { toggleCart, getItemCount } = useCart();
  const itemCount = mounted ? getItemCount() : 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/tienda?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  // Ocultar Navbar en el panel de administración
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  // Enlaces optimizados: Se eliminaron botones individuales (pestañina, labiales, polvos) (Puntos 3, 4)
  const navLinks = [
    { name: "Inicio", href: "/" },
    { name: "Catálogo", href: "/tienda" },
    { name: "Domicilios Neiva", href: "/checkout" },
  ];

  return (
    <>
      {/* Top Banner de Anuncio Dinámico */}
      <div className="bg-[#7b5455] text-white text-xs py-2 px-4 text-center tracking-wider flex items-center justify-center gap-2 font-medium">
        <Sparkles className="w-3.5 h-3.5 text-[#f1ca50] shrink-0" />
        <span className="truncate">{announcementText}</span>
        <span className="hidden md:inline text-white/60">|</span>
        <span className="hidden md:inline">Pago Contraentrega en Neiva</span>
      </div>

      {/* Barra de Navegación Principal Ultraligera */}
      <header className="sticky top-0 z-40 bg-[#f9f9f9]/95 backdrop-blur-md border-b border-[#d4c2c2]/40 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Botón Menú Móvil */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#7b5455] hover:bg-[#f4c2c2]/30 rounded-lg transition-colors"
              aria-label="Abrir menú de navegación"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Enlaces de Navegación Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-xs uppercase tracking-widest transition-colors py-1 font-semibold ${
                    isActive
                      ? "text-[#7b5455] border-b-2 border-[#7b5455]"
                      : "text-[#504444] hover:text-[#7b5455]"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Logotipo Central Dinámico con Imagen Oficial */}
          <div className="flex-1 md:flex-initial text-center flex items-center justify-center">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden shadow-sm ring-2 ring-[#f4c2c2]/60 group-hover:scale-105 transition-transform duration-300">
                <Image
                  src="/logo.png"
                  alt="Dulce Cosmetics"
                  width={44}
                  height={44}
                  priority
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-left">
                <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#7b5455] group-hover:opacity-90 transition-opacity block leading-none">
                  {brandName}
                </span>
                <span className="block text-[9px] sm:text-[10px] tracking-[0.25em] uppercase text-[#735c00] font-sans font-medium mt-1">
                  Neiva • Belleza & Cuidado
                </span>
              </div>
            </Link>
          </div>

          {/* Acciones Derecha (Buscador, Carrito, Acceso Admin) */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Buscador Desktop */}
            <form onSubmit={handleSearchSubmit} className="relative hidden lg:block">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar cosméticos..."
                className="w-44 pl-8 pr-3 py-1.5 text-xs bg-white border border-[#d4c2c2] rounded-full focus:outline-none focus:border-[#7b5455] focus:w-56 transition-all placeholder:text-gray-400"
              />
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#827473]" />
            </form>

            {/* Buscador Móvil Trigger */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="lg:hidden p-2 text-[#7b5455] hover:bg-[#f4c2c2]/20 rounded-full transition-colors"
              aria-label="Buscar productos"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Botón de Acceso / Iniciar Sesión o Panel Admin si está autenticado */}
            {isAdmin ? (
              <Link
                href="/admin"
                className="hidden sm:inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-bold text-white bg-[#7b5455] hover:bg-[#623c3d] px-3 py-1.5 rounded-full shadow-sm hover:shadow transition-all duration-300 transform hover:scale-105 active:scale-95"
                title="Panel Administrativo"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#f1ca50]" />
                <span>Panel Admin</span>
              </Link>
            ) : (
              <Link
                href="/admin/login"
                className="group hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-[#7b5455] bg-[#f4c2c2]/25 hover:bg-[#7b5455] hover:text-white px-3.5 py-1.5 rounded-full border border-[#d4c2c2]/50 hover:border-[#7b5455] shadow-xs hover:shadow-md transition-all duration-300 transform hover:scale-105 active:scale-95"
                title="Iniciar Sesión en Dulce Cosmetics"
              >
                <User className="w-3.5 h-3.5 text-[#7b5455] group-hover:text-white transition-colors duration-300" />
                <span className="tracking-wide">Iniciar Sesión</span>
              </Link>
            )}

            {/* Botón Carrito con Badge Interactivo */}
            <button
              onClick={toggleCart}
              className="relative p-2.5 bg-[#f4c2c2]/40 hover:bg-[#f4c2c2] text-[#7b5455] rounded-full transition-all duration-300 transform active:scale-95 shadow-sm"
              aria-label="Ver carrito de compras"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#7b5455] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Input Desplegable en Móvil */}
        {searchOpen && (
          <div className="lg:hidden px-4 pb-3 pt-1 border-t border-[#d4c2c2]/30 bg-white">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar en el catálogo de Neiva..."
                autoFocus
                className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-[#d4c2c2] rounded-lg focus:outline-none focus:border-[#7b5455]"
              />
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </form>
          </div>
        )}

        {/* Menú Móvil */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#d4c2c2]/40 bg-white shadow-xl px-4 pt-4 pb-6 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="block text-base font-medium text-[#504444] hover:text-[#7b5455] hover:bg-[#f3f3f4] px-3 py-2 rounded-md transition-colors"
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
              {isAdmin ? (
                <Link
                  href="/admin"
                  className="flex items-center text-xs text-[#7b5455] font-bold py-2 px-3 bg-[#f4c2c2]/20 rounded-md"
                >
                  <ShieldCheck className="w-4 h-4 mr-2 text-[#7b5455]" />
                  <span>Panel Administrativo</span>
                </Link>
              ) : (
                <Link
                  href="/admin/login"
                  className="flex items-center text-xs text-[#504444] font-semibold py-2 px-3 hover:bg-[#f4c2c2]/20 rounded-md transition-colors"
                >
                  <User className="w-4 h-4 mr-2 text-[#7b5455]" />
                  <span>Iniciar Sesión</span>
                </Link>
              )}
              <span className="text-xs text-gray-500">Neiva, Huila</span>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
