"use client";

import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import { generateProductInquiryUrl } from "@/backend/whatsapp";
import {
  ShoppingBag,
  MessageCircle,
  Sparkles,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
  Minus,
  Plus,
} from "lucide-react";
import Link from "next/link";

interface ProductDetailClientProps {
  product: {
    id: number;
    nombre: string;
    slug: string;
    descripcion: string;
    precio: number;
    imagenUrl: string;
    stock: number;
    destacado: boolean;
    category: {
      id: number;
      nombre: string;
      slug: string;
    };
    variants: Array<{
      id: number;
      nombre: string;
      stockEstimado: number;
    }>;
  };
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { addItem } = useCart();
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(
    product.variants.length > 0 ? product.variants[0].id : null
  );
  const [cantidad, setCantidad] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId);

  const handleAddToCart = () => {
    addItem(
      {
        productId: product.id,
        productName: product.nombre,
        variantId: selectedVariant?.id || null,
        variantName: selectedVariant?.nombre || null,
        precioUnitario: product.precio,
        imagenUrl: product.imagenUrl,
      },
      cantidad
    );

    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  const whatsappInquiryUrl = generateProductInquiryUrl(
    product.nombre,
    selectedVariant?.nombre
  );

  const formatCOP = (val: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(val);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
      {/* Columna Izquierda: Galería y Preview (5 Columnas) */}
      {/* Columna Izquierda: Galería y Showcase Visual (Luxe Editorial) */}
      <div className="lg:col-span-6 space-y-4">
        {/* Imagen Principal */}
        <div className="aspect-square bg-white rounded-3xl overflow-hidden border border-[#d4c2c2]/40 shadow-sm relative group">
          <img
            src={product.imagenUrl}
            alt={product.nombre}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />

          <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
            {product.destacado && (
              <span className="bg-[#7b5455] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow">
                Más Vendido
              </span>
            )}
            {product.stock > 0 ? (
              <span className="bg-emerald-600/90 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full shadow-sm">
                En Stock: {product.stock} unids
              </span>
            ) : (
              <span className="bg-rose-600/90 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full shadow-sm">
                Agotado Temporalmente
              </span>
            )}
          </div>

          <div className="absolute bottom-4 left-4 right-4 bg-white/85 backdrop-blur-md p-3.5 rounded-2xl border border-white/60 text-xs text-gray-700 flex items-center justify-between shadow-sm">
            <span className="font-medium flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#7b5455]" />
              Fórmula Original Garantizada
            </span>
            <span className="text-[#7b5455] font-semibold">Entrega Hoy en Neiva</span>
          </div>
        </div>

        {/* Variantes Rápidas Visuales si existen */}
        {product.variants.length > 0 && (
          <div className="p-4 bg-white rounded-2xl border border-[#ebdcdc] space-y-2">
            <span className="text-[11px] uppercase tracking-wider text-gray-500 font-bold block">
              Variantes disponibles en catálogo:
            </span>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVariantId(v.id)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                    selectedVariantId === v.id
                      ? "bg-[#7b5455] text-white border-[#7b5455] font-semibold shadow-sm"
                      : "bg-[#FAF9F6] text-gray-700 border-gray-200 hover:border-[#7b5455]"
                  }`}
                >
                  {v.nombre}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Columna Derecha: Información, Variantes y Compra (7 Columnas) */}
      <div className="lg:col-span-6 space-y-6">
        {/* Breadcrumb de Categoría */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Link href="/tienda" className="hover:text-[#7b5455]">
            Tienda
          </Link>
          <span>/</span>
          <Link href={`/tienda?cat=${product.category.slug}`} className="hover:text-[#7b5455] font-medium text-[#7b5455]">
            {product.category.nombre}
          </Link>
        </div>

        {/* Título y Precio */}
        <div className="space-y-2">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
            {product.nombre}
          </h1>
          <div className="flex items-baseline gap-4 pt-1">
            <span className="font-serif text-3xl font-bold text-[#7b5455]">
              {formatCOP(product.precio)}
            </span>
            <span className="text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full font-semibold">
              Disponible para envío hoy en Neiva
            </span>
          </div>
        </div>

        {/* Descripción */}
        <div className="prose prose-sm text-[#504444] border-y border-[#d4c2c2]/40 py-4">
          <p className="leading-relaxed">{product.descripcion}</p>
        </div>

        {/* SELECTOR CRUCIAL DE TONALIDADES / VARIANTES */}
        {product.variants.length > 0 && (
          <div className="space-y-3 bg-[#FAF9F6] p-4 rounded-xl border border-[#d4c2c2]/40">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-800">
                Selecciona tu Tonalidad o Variante:
              </label>
              {selectedVariant && (
                <span className="text-xs font-semibold text-[#7b5455]">
                  {selectedVariant.nombre}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {product.variants.map((v) => {
                const isSelected = selectedVariantId === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVariantId(v.id)}
                    className={`relative p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? "border-[#7b5455] bg-white shadow-md ring-2 ring-[#7b5455]/20"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold ${
                          isSelected ? "text-[#7b5455]" : "text-gray-800"
                        }`}
                      >
                        {v.nombre}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#7b5455]" />}
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1">
                      {v.stockEstimado > 0 ? "En stock" : "Pocas unidades"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Selector de Cantidad y Botones de Compra */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-700">Cantidad:</span>
            <div className="flex items-center border border-gray-300 rounded-lg bg-white">
              <button
                type="button"
                onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                disabled={product.stock <= 0}
                aria-label="Disminuir cantidad"
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-l disabled:opacity-40"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-4 text-sm font-bold text-gray-800">{cantidad}</span>
              <button
                type="button"
                onClick={() => setCantidad(Math.min(product.stock || 10, cantidad + 1))}
                disabled={cantidad >= (product.stock || 10) || product.stock <= 0}
                aria-label="Aumentar cantidad"
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-r disabled:opacity-40"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {product.stock > 0 && cantidad >= product.stock && (
              <span className="text-[11px] text-amber-700 font-medium">Máximo stock disponible alcanzado</span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {/* Botón Agregar al Carrito */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-bold text-xs uppercase tracking-widest text-white transition-all shadow-md transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                addedAnimation
                  ? "bg-emerald-600 scale-102"
                  : "bg-[#7b5455] hover:bg-[#613d3e]"
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>
                {product.stock <= 0
                  ? "Producto Agotado"
                  : addedAnimation
                  ? "¡Agregado al Carrito!"
                  : `Agregar al Carrito • ${formatCOP(product.precio * cantidad)}`}
              </span>
            </button>

            {/* BOTÓN OBLIGATORIO: NECESITO ASESORÍA (WHATSAPP) */}
            <a
              href={whatsappInquiryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 py-4 px-6 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow-md transition-all transform active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Necesito Asesoría</span>
            </a>
          </div>
        </div>

        {/* Beneficios de Compra en Neiva */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-[#d4c2c2]/40 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#7b5455] shrink-0" />
            <span>Domicilio local en Neiva</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#7b5455] shrink-0" />
            <span>Garantía de originalidad</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#7b5455] shrink-0" />
            <span>Asesoría personalizada</span>
          </div>
        </div>
      </div>
    </div>
  );
}
