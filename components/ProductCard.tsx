"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/hooks/useCart";
import { ShoppingBag, Eye, Sparkles } from "lucide-react";
import { useState } from "react";

export interface ProductCardProps {
  id: number;
  nombre: string;
  slug: string;
  precio: number;
  imagenUrl: string;
  destacado?: boolean;
  category?: {
    nombre: string;
    slug?: string;
  };
  variants?: Array<{
    id: number;
    nombre: string;
    stockEstimado: number;
  }>;
}

export default function ProductCard({
  id,
  nombre,
  slug,
  precio,
  imagenUrl,
  destacado,
  category,
  variants = [],
}: ProductCardProps) {
  const { addItem } = useCart();
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(
    variants.length > 0 ? variants[0].id : null
  );

  const selectedVariant = variants.find((v) => v.id === selectedVariantId);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addItem({
      productId: id,
      productName: nombre,
      variantId: selectedVariant?.id || null,
      variantName: selectedVariant?.nombre || null,
      precioUnitario: precio,
      imagenUrl: imagenUrl,
    });
  };

  const formatCOP = (val: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(val);

  return (
    <div className="group relative bg-[#F5F5DC]/40 hover:bg-white rounded-xl border border-[#d4c2c2]/40 hover:border-[#7b5455]/40 transition-all duration-300 flex flex-col overflow-hidden hover:shadow-lg">
      {/* Contenedor de Imagen con Next/Image optimizado */}
      <Link href={`/producto/${slug}`} className="relative block aspect-square overflow-hidden bg-white/70">
        <Image
          src={imagenUrl}
          alt={nombre}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          loading="lazy"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Badges superiores */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          {destacado && (
            <span className="inline-flex items-center gap-1 bg-[#7b5455] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow">
              <Sparkles className="w-2.5 h-2.5 text-[#f1ca50]" />
              Top Ventas
            </span>
          )}
          {category && (
            <span className="bg-white/90 backdrop-blur-sm text-[#504444] text-[10px] font-medium px-2 py-0.5 rounded shadow-sm border border-gray-100">
              {category.nombre}
            </span>
          )}
        </div>

        {/* Botón Flotante Ver Detalle en Hover / Indicador visual */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 pointer-events-none">
          <span className="p-3 bg-white/95 text-[#7b5455] rounded-full shadow-lg transform group-hover:scale-110 transition-transform flex items-center gap-1.5 text-xs font-semibold px-4">
            <Eye className="w-4 h-4" />
            <span>Ver Ficha</span>
          </span>
        </div>
      </Link>

      {/* Contenido de la Tarjeta */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Selector de variantes rápido si existen */}
          {variants.length > 0 && (
            <div className="mb-2">
              <div className="flex flex-wrap gap-1">
                {variants.slice(0, 3).map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedVariantId(v.id);
                    }}
                    className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${
                      selectedVariantId === v.id
                        ? "border-[#7b5455] bg-[#f4c2c2]/50 text-[#734e4e] font-semibold"
                        : "border-gray-200 text-gray-600 hover:border-gray-400 bg-white"
                    }`}
                  >
                    {v.nombre}
                  </button>
                ))}
                {variants.length > 3 && (
                  <span className="text-[10px] text-gray-400 self-center">
                    +{variants.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Título */}
          <Link href={`/producto/${slug}`}>
            <h3 className="font-sans text-sm font-semibold text-gray-900 group-hover:text-[#7b5455] transition-colors line-clamp-2 leading-snug mb-1">
              {nombre}
            </h3>
          </Link>
        </div>

        {/* Precio y Botón Agregar (Punto 13: fuente Arial obligatoria para precios) */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-gray-400 block font-sans">
              Precio
            </span>
            <span className="font-[Arial] text-lg font-bold text-[#7b5455] tracking-tight">
              {formatCOP(precio)}
            </span>
          </div>

          <button
            onClick={handleQuickAdd}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#7b5455] hover:bg-[#613d3e] text-white text-xs font-semibold rounded-lg shadow-sm transition-all transform active:scale-95"
            aria-label={`Agregar ${nombre} al carrito`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Agregar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
