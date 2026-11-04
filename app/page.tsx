import Link from "next/link";
import Image from "next/image";
import { getProducts } from "@/backend/actions/products";
import { getCategories } from "@/backend/actions/categories";
import ProductCard from "@/components/ProductCard";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  MessageCircle,
} from "lucide-react";

export const revalidate = 60; // ISR para rendimiento óptimo en Next.js 15+

export default async function HomePage() {
  const [featuredProducts, categories] = await Promise.all([
    getProducts({ featured: true }),
    getCategories(),
  ]);

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "573177780413";

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. HERO SECTION OPTIMIZADA PARA LCP (Next/Image con priority) (Punto 1) */}
      <section className="relative min-h-[520px] lg:min-h-[580px] flex items-center bg-[#F5F5DC]/80 overflow-hidden border-b border-[#d4c2c2]/40">
        {/* Fondo con gradientes suaves */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#F5F5DC] via-[#FAF9F6]/90 to-transparent z-10" />

        {/* Imagen Hero optimizada con Next/Image y priority (Punto 1) */}
        <div className="absolute right-0 top-0 bottom-0 w-full lg:w-3/5 z-0">
          <Image
            src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1600&q=85"
            alt="Dulce Cosmetics Neiva - Catálogo Oficial"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover object-center opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#F5F5DC] lg:bg-gradient-to-r lg:from-[#F5F5DC] via-transparent to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-20 w-full">
          <div className="max-w-xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/80 backdrop-blur-md rounded-full border border-[#d4c2c2]">
              <Sparkles className="w-3.5 h-3.5 text-[#735c00]" />
              <span className="text-xs uppercase tracking-widest text-[#7b5455] font-semibold">
                Cosméticos & Belleza Neiva
              </span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1a1c1c] tracking-tight leading-[1.15]">
              Realza Tu <br />
              <span className="italic font-normal text-[#7b5455]">Resplandor Natural.</span>
            </h1>

            <p className="font-sans text-base sm:text-lg text-[#504444] leading-relaxed max-w-lg">
              Fórmulas de larga duración resistentes al clima de Neiva. Pestañinas a prueba de
              agua, labiales indelebles y acabados de alta definición con entrega rápida en tu ciudad.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link
                href="/tienda"
                className="inline-flex items-center justify-center px-8 py-3.5 bg-[#7b5455] text-white text-xs uppercase tracking-widest font-semibold rounded-lg hover:bg-[#613d3e] transition-all shadow-md active:scale-95"
              >
                <span>Ver Catálogo Completo</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>

              <Link
                href="/checkout"
                className="inline-flex items-center justify-center px-8 py-3.5 bg-white text-[#7b5455] border border-[#7b5455]/40 text-xs uppercase tracking-widest font-semibold rounded-lg hover:bg-[#f4c2c2]/20 transition-all active:scale-95"
              >
                Tarifas de Domicilio
              </Link>
            </div>

            {/* Badges de Garantía Local */}
            <div className="pt-6 grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-[#d4c2c2]/50 text-xs text-[#504444]">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#7b5455] shrink-0" />
                <span>Domicilio en Neiva</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#7b5455] shrink-0" />
                <span>Pago Contraentrega</span>
              </div>
              <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                <MessageCircle className="w-4 h-4 text-[#7b5455] shrink-0" />
                <span>Pedidos por WhatsApp</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORÍAS PRINCIPALES (Imágenes con lazy loading estricto) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-[0.25em] text-[#735c00] font-bold block mb-2">
            Lo Esencial Para Tu Rutina
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1a1c1c]">
            Categorías Principales
          </h2>
          <div className="w-16 h-0.5 bg-[#D4AF37] mx-auto mt-3" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Card Principal: Pestañinas */}
          <Link
            href="/tienda?cat=pestaninas"
            className="group relative md:col-span-7 rounded-2xl overflow-hidden min-h-[340px] md:min-h-[420px] bg-[#2a1b1b] shadow-sm flex flex-col justify-end p-8 transition-transform hover:-translate-y-1 duration-300"
          >
            <Image
              src="/images/products/pestanina-4d.jpg"
              alt="Pestañinas Dulce Cosmetics"
              fill
              loading="lazy"
              sizes="(max-width: 768px) 100vw, 60vw"
              className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

            <div className="relative z-10 space-y-2">
              <span className="inline-block px-3 py-1 bg-[#D4AF37] text-black text-[11px] font-bold uppercase tracking-wider rounded">
                Categoría Estrella
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                Pestañinas de Alto Impacto
              </h3>
              <p className="text-sm text-gray-200 max-w-md">
                Resistentes al agua, calor y sudor. Volumen extremo y definición pestaña por pestaña
                sin grumos.
              </p>
              <div className="pt-2 flex items-center text-xs font-semibold uppercase tracking-widest text-[#ecbaba] group-hover:translate-x-1 transition-transform">
                <span>Ver Pestañinas</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </div>
            </div>
          </Link>

          {/* Columna Derecha: Labiales & Polvos */}
          <div className="md:col-span-5 flex flex-col gap-6">
            <Link
              href="/tienda?cat=labiales"
              className="group relative flex-1 rounded-2xl overflow-hidden min-h-[195px] bg-[#2a1b1b] shadow-sm flex flex-col justify-end p-6 transition-transform hover:-translate-y-1 duration-300"
            >
              <Image
                src="/images/products/labial-mate.jpg"
                alt="Labiales Dulce Cosmetics"
                fill
                loading="lazy"
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              <div className="relative z-10">
                <span className="text-[10px] text-[#f1ca50] font-semibold uppercase tracking-wider">
                  Tonos Nude & Rojos
                </span>
                <h3 className="font-serif text-xl font-bold text-white">Labiales Mate & Gloss</h3>
                <div className="flex items-center text-xs text-[#ecbaba] mt-1 group-hover:translate-x-1 transition-transform font-medium">
                  <span>Descubrir Tonos</span>
                  <ArrowRight className="w-3 h-3 ml-1" />
                </div>
              </div>
            </Link>

            <Link
              href="/tienda?cat=polvos"
              className="group relative flex-1 rounded-2xl overflow-hidden min-h-[195px] bg-[#2a1b1b] shadow-sm flex flex-col justify-end p-6 transition-transform hover:-translate-y-1 duration-300"
            >
              <Image
                src="/images/products/polvo-suelto-de-arroz.jpg"
                alt="Polvos Dulce Cosmetics"
                fill
                loading="lazy"
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              <div className="relative z-10">
                <span className="text-[10px] text-[#f1ca50] font-semibold uppercase tracking-wider">
                  Matificantes & Selladores
                </span>
                <h3 className="font-serif text-xl font-bold text-white">Polvos Traslúcidos HD</h3>
                <div className="flex items-center text-xs text-[#ecbaba] mt-1 group-hover:translate-x-1 transition-transform font-medium">
                  <span>Ver Opciones</span>
                  <ArrowRight className="w-3 h-3 ml-1" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. PRODUCTOS MÁS VENDIDOS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 pb-4 border-b border-[#d4c2c2]/40 gap-4">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-[#735c00] font-bold block mb-1">
              Catálogo Destacado
            </span>
            <h2 className="font-serif text-3xl font-bold text-[#1a1c1c]">
              Productos Más Vendidos
            </h2>
          </div>
          <Link
            href="/tienda"
            className="inline-flex items-center text-xs uppercase tracking-widest text-[#7b5455] font-semibold hover:text-[#D4AF37] transition-colors"
          >
            <span>Ver Catálogo Completo</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Link>
        </div>

        {featuredProducts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-sm text-gray-500">Cargando productos destacados...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 8).map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                nombre={product.nombre}
                slug={product.slug}
                precio={product.precio}
                imagenUrl={product.imagenUrl}
                destacado={product.destacado}
                category={product.category}
                variants={product.variants}
              />
            ))}
          </div>
        )}
      </section>

      {/* 4. BANNER DE PEDIDOS INMEDIATOS POR WHATSAPP (NEIVA) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#7b5455] text-white rounded-2xl p-8 sm:p-12 relative overflow-hidden shadow-xl">
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[#f1ca50]">
                <Sparkles className="w-3.5 h-3.5 text-[#f1ca50]" />
                Atención Directa en Neiva
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold">
                ¿Tienes dudas sobre disponibilidad o tonos?
              </h3>
              <p className="text-sm sm:text-base text-white/85 max-w-2xl leading-relaxed">
                Escríbenos directamente a nuestra línea de WhatsApp en Neiva para confirmar inventario,
                coordinar entregas urgentes el mismo día o resolver cualquier inquietud antes de tu compra.
              </p>
            </div>

            <div className="lg:col-span-4 flex lg:justify-end">
              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                  "¡Hola Dulce Cosmetics! Deseo consultar sobre disponibilidad de productos y entregas en Neiva."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-sm uppercase tracking-wider rounded-xl shadow-lg transition-all transform hover:scale-105 active:scale-95"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Contactar por WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
