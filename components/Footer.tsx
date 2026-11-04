"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, MapPin, Heart, Sparkles, Phone, Clock, Truck } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "573177780413";

  // Oculta el footer general en todo el dashboard administrativo (Punto 16)
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="bg-[#1a1c1c] text-[#f0f1f1] border-t border-[#827473]/30 pt-16 pb-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Columna 1: Marca y Filosofía */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Dulce Cosmetics"
                className="w-12 h-12 rounded-full object-cover ring-2 ring-[#ecbaba]/60"
              />
              <div>
                <span className="font-serif text-2xl font-bold tracking-tight text-[#ecbaba] block">
                  Dulce Cosmetics
                </span>
                <p className="text-[10px] tracking-[0.2em] uppercase text-[#f1ca50]">
                  Editorial Luxe • Neiva
                </p>
              </div>
            </div>
            <p className="text-sm text-[#dadada] leading-relaxed">
              Cosméticos de alta calidad diseñados para realzar tu belleza natural.
              Fórmulas ligeras, duraderas y perfectas para el clima de nuestra ciudad.
            </p>
            <div className="pt-2">
              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                  "¡Hola Dulce Cosmetics! Quiero más información sobre sus productos."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 bg-[#25D366] text-white rounded-full hover:opacity-90 transition-opacity"
              >
                <MessageCircle className="w-4 h-4" />
                Asesoría WhatsApp (+57 317 778 0413)
              </a>
            </div>
          </div>

          {/* Columna 2: Cobertura Local Neiva */}
          <div className="space-y-3">
            <h4 className="font-serif text-base font-semibold text-white tracking-wide border-b border-[#827473]/40 pb-2">
              Sede & Domicilios Neiva
            </h4>
            <div className="flex items-start gap-2 text-sm text-[#dadada]">
              <MapPin className="w-4 h-4 text-[#ecbaba] mt-1 shrink-0" />
              <div>
                <p className="font-medium text-white">Carrera 7 #38-16</p>
                <p className="text-xs text-[#dadada]/80">Barrio Las Granjas • Neiva, Huila</p>
              </div>
            </div>
            <div className="flex items-start gap-2 text-sm text-[#dadada]">
              <Phone className="w-4 h-4 text-[#f1ca50] mt-1 shrink-0" />
              <div>
                <p className="font-medium text-white">Líneas de Domicilio</p>
                <p className="text-xs text-[#dadada]/80">317 778 0413 • 320 436 0859</p>
              </div>
            </div>
            <div className="flex items-start gap-2 text-sm text-[#dadada]">
              <Truck className="w-4 h-4 text-[#ecbaba] mt-1 shrink-0" />
              <div>
                <p className="font-medium text-white">Domicilio Gratis en Las Granjas</p>
                <p className="text-xs text-[#dadada]/80">Por compras desde $15.000 COP</p>
              </div>
            </div>
          </div>

          {/* Columna 3: Categorías Rápidas */}
          <div className="space-y-3">
            <h4 className="font-serif text-base font-semibold text-white tracking-wide border-b border-[#827473]/40 pb-2">
              Colecciones
            </h4>
            <ul className="space-y-2 text-sm text-[#dadada]">
              <li>
                <Link href="/tienda?cat=pestaninas" className="hover:text-[#ecbaba] transition-colors flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-[#f1ca50]" />
                  Pestañinas 24H Waterproof
                </Link>
              </li>
              <li>
                <Link href="/tienda?cat=labiales" className="hover:text-[#ecbaba] transition-colors flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-[#f1ca50]" />
                  Labiales Mate & Lip Gloss
                </Link>
              </li>
              <li>
                <Link href="/tienda?cat=polvos" className="hover:text-[#ecbaba] transition-colors flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-[#f1ca50]" />
                  Polvos Traslúcidos & Compactos
                </Link>
              </li>
              <li>
                <Link href="/tienda" className="hover:text-[#ecbaba] transition-colors flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-[#f1ca50]" />
                  Todo el Catálogo
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 4: Métodos de Pago Locales */}
          <div className="space-y-3">
            <h4 className="font-serif text-base font-semibold text-white tracking-wide border-b border-[#827473]/40 pb-2">
              Métodos de Pago
            </h4>
            <p className="text-xs text-[#dadada] leading-relaxed">
              Paga como te sea más cómodo al momento de recibir o por transferencia segura:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-[#2f3131] p-2.5 rounded border border-[#827473]/40 text-center">
                <span className="font-bold text-white block">💵 Efectivo</span>
                <span className="text-[10px] text-[#dadada]">Contraentrega</span>
              </div>
              <div className="bg-[#2f3131] p-2.5 rounded border border-[#827473]/40 text-center">
                <span className="font-bold text-[#b17ef8] block">🟣 Nequi</span>
                <span className="text-[10px] text-[#dadada]">Transferencia</span>
              </div>
              <div className="bg-[#2f3131] p-2.5 rounded border border-[#827473]/40 text-center">
                <span className="font-bold text-[#e63946] block">🔴 Daviplata</span>
                <span className="text-[10px] text-[#dadada]">Transferencia</span>
              </div>
              <div className="bg-[#2f3131] p-2.5 rounded border border-[#827473]/40 text-center">
                <span className="font-bold text-[#f1ca50] block">✨ Asesoría</span>
                <span className="text-[10px] text-[#dadada]">Personalizada</span>
              </div>
            </div>
          </div>
        </div>

        {/* Barra Inferior de Copyright */}
        <div className="border-t border-[#827473]/20 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#dadada]/70 gap-4">
          <p>© {new Date().getFullYear()} Dulce Cosmetics. Todos los derechos reservados. Neiva, Huila.</p>
          <div className="flex items-center gap-1 text-xs">
            <span>Hecho con</span>
            <Heart className="w-3.5 h-3.5 text-[#ecbaba] fill-[#ecbaba]" />
            <span>para el mercado local de Neiva</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
