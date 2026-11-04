"use client";

import { useCart } from "@/hooks/useCart";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CartDrawer() {
  const [mounted, setMounted] = useState(false);
  const { items, isOpen, closeCart, removeItem, updateQuantity, getSubtotal } = useCart();

  useEffect(() => {
    setMounted(true);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeCart();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeCart]);

  if (!mounted) return null;
  if (!isOpen) return null;

  const subtotal = getSubtotal();
  const metaEnvioGratis = 15000;
  const faltaParaGratis = Math.max(0, metaEnvioGratis - subtotal);
  const porcentajeGratis = Math.min(100, Math.round((subtotal / metaEnvioGratis) * 100));

  const formatCOP = (val: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(val);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Carrito de compras Dulce Cosmetics"
      className="fixed inset-0 z-50 overflow-hidden animate-fade-in"
    >
      {/* Backdrop oscuro translúcido */}
      <div
        onClick={closeCart}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header del Carrito */}
          <div className="p-6 bg-[#f9f9f9] border-b border-[#d4c2c2]/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#7b5455]" />
              <h2 className="font-serif text-xl font-bold text-[#1a1c1c]">Tu Carrito</h2>
              <span className="text-xs bg-[#f4c2c2] text-[#734e4e] px-2 py-0.5 rounded-full font-bold">
                {items.reduce((acc, i) => acc + i.cantidad, 0)}
              </span>
            </div>
            <button
              onClick={closeCart}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Cerrar carrito"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Barra de progreso para domicilio gratis en Las Granjas */}
          <div className="bg-[#e1e1c9]/40 p-3.5 border-b border-[#d4c2c2]/30">
            <div className="flex items-center justify-between text-xs text-[#5e604d] font-medium mb-1.5">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#735c00]" />
                {faltaParaGratis === 0
                  ? "¡Envío GRATIS en Las Granjas desbloqueado!"
                  : `Agrega ${formatCOP(faltaParaGratis)} más para domicilio GRATIS en Las Granjas`}
              </span>
              <span className="font-bold">{porcentajeGratis}%</span>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#7b5455] h-full transition-all duration-500 rounded-full"
                style={{ width: `${porcentajeGratis}%` }}
              />
            </div>
          </div>

          {/* Lista de Productos en el Carrito */}
          <div className="flex-1 overflow-y-auto p-6 divide-y divide-gray-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-500">
                <div className="w-16 h-16 bg-[#f4c2c2]/30 rounded-full flex items-center justify-center mb-4 text-[#7b5455]">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-lg font-bold text-gray-800 mb-1">
                  Tu carrito está vacío
                </h3>
                <p className="text-xs text-gray-500 mb-6 max-w-xs">
                  Explora nuestras colecciones de pestañinas, labiales y maquillaje para consentirte.
                </p>
                <button
                  onClick={closeCart}
                  className="px-6 py-2.5 bg-[#7b5455] text-white text-xs uppercase tracking-widest font-semibold rounded-md hover:bg-[#613d3e] transition-colors"
                >
                  Explorar Catálogo
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={`${item.productId}-${item.variantId || "default"}`} className="py-4 flex gap-4">
                  {/* Imagen */}
                  <div className="w-20 h-20 bg-gray-50 rounded-lg overflow-hidden shrink-0 border border-gray-100">
                    <img
                      src={
                        item.imagenUrl && (item.imagenUrl.startsWith("http://") || item.imagenUrl.startsWith("https://") || item.imagenUrl.startsWith("/"))
                          ? item.imagenUrl
                          : "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=200&q=80"
                      }
                      alt={item.productName}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=200&q=80";
                      }}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 leading-tight">
                          {item.productName}
                        </h4>
                        {item.variantName && (
                          <span className="inline-block mt-0.5 text-[11px] text-[#735c00] bg-[#ffe088]/30 px-2 py-0.5 rounded font-medium">
                            Tono: {item.variantName}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.productId, item.variantId)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        title="Eliminar producto"
                        aria-label={`Eliminar ${item.productName} del carrito`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Controles de Cantidad */}
                      <div className="flex items-center border border-gray-200 rounded-md bg-white">
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.variantId, item.cantidad - 1)
                          }
                          aria-label={`Reducir cantidad de ${item.productName}`}
                          className="p-1 text-gray-500 hover:bg-gray-100 transition-colors rounded-l"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 text-xs font-semibold text-gray-800">
                          {item.cantidad}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.variantId, item.cantidad + 1)
                          }
                          aria-label={`Aumentar cantidad de ${item.productName}`}
                          className="p-1 text-gray-500 hover:bg-gray-100 transition-colors rounded-r"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Precio Subtotal del Item */}
                      <span className="text-sm font-bold text-[#7b5455]">
                        {formatCOP(item.precioUnitario * item.cantidad)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer del Carrito con Subtotal y CTA */}
          {items.length > 0 && (
            <div className="p-6 bg-[#f9f9f9] border-t border-[#d4c2c2]/40 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-serif text-lg font-bold text-[#1a1c1c]">
                  {formatCOP(subtotal)}
                </span>
              </div>
              <p className="text-[11px] text-gray-500">
                El costo de domicilio se calculará en la siguiente pantalla según tu barrio en Neiva.
              </p>

              <Link
                href="/checkout"
                onClick={closeCart}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-[#7b5455] hover:bg-[#613d3e] text-white text-xs uppercase tracking-widest font-semibold rounded-lg shadow-md transition-all active:scale-[0.98]"
              >
                <span>Finalizar Pedido</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
