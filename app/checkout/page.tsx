"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useCart } from "@/hooks/useCart";
import { createOrderAction } from "@/backend/actions/orderActions";
import Link from "next/link";
import {
  ShoppingBag,
  Truck,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  MapPin,
  MessageCircle,
  AlertCircle,
  History,
  Info,
  Banknote,
  Smartphone,
  CreditCard,
} from "lucide-react";

interface LocationHistoryItem {
  barrio: string;
  ciudad: string;
  direccion: string;
  costo: number;
  tipoEnvio: string;
  fecha: string;
}

export default function CheckoutPage() {
  const [mounted, setMounted] = useState(false);
  const { items, getSubtotal, clearCart } = useCart();

  // Datos del cliente y formulario
  const [nombreCliente, setNombreCliente] = useState("");
  const [telefono, setTelefono] = useState("");
  const [ciudad, setCiudad] = useState("Neiva");
  const [barrio, setBarrio] = useState("Las Granjas");
  const [direccion, setDireccion] = useState("");
  const [metodoPago, setMetodoPago] = useState<"efectivo" | "nequi" | "daviplata">("efectivo");
  const [notas, setNotas] = useState("");
  const [requiereAsesoria, setRequiereAsesoria] = useState(false);

  // Historial de ubicaciones (Puntos 2, 12, 17)
  const [locationHistory, setLocationHistory] = useState<LocationHistoryItem[]>([]);

  // Estado de orden exitosa para confirmación local elegante (UX-01)
  const [orderSuccessData, setOrderSuccessData] = useState<{
    orderId: number;
    whatsappUrl: string;
    total: number;
    subtotal: number;
    costoDomicilio: number;
    direccion: string;
    barrio: string;
    metodoPago: string;
    itemsCount: number;
    nombreCliente: string;
  } | null>(null);

  // Estados de envío del pedido
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const subtotal = mounted ? getSubtotal() : 0;

  // Cargar historial de localStorage al montar
  useEffect(() => {
    setMounted(true);

    try {
      const savedHistory = localStorage.getItem("dulce_location_history");
      if (savedHistory) {
        const parsed: LocationHistoryItem[] = JSON.parse(savedHistory);
        setLocationHistory(parsed);
        if (parsed.length > 0) {
          const last = parsed[0];
          setBarrio(last.barrio);
          setCiudad(last.ciudad || "Neiva");
          if (last.direccion) setDireccion(last.direccion);
        }
      } else {
        const lastBarrio = localStorage.getItem("dulce_last_barrio");
        const lastAddress = localStorage.getItem("dulce_last_address");
        if (lastBarrio) setBarrio(lastBarrio);
        if (lastAddress) setDireccion(lastAddress);
      }
    } catch (err) {
      console.warn("No se pudo cargar el historial de ubicación:", err);
    }
  }, []);

  // Para envíos fuera de Neiva se exige pago 100% anticipado (no aplica contraentrega)
  useEffect(() => {
    if (ciudad.trim().toLowerCase() !== "neiva" && metodoPago === "efectivo") {
      setMetodoPago("nequi");
    }
  }, [ciudad, metodoPago]);

  // LÓGICA DE DOMICILIOS DINÁMICOS
  const shippingCalculation = useMemo(() => {
    const isNeiva = ciudad.trim().toLowerCase() === "neiva";
    const normalizedBarrio = barrio.trim().toLowerCase();

    // Caso 1: Fuera de Neiva (Pago 100% Anticipado)
    if (!isNeiva) {
      return {
        costo: 0,
        esGratis: false,
        esNacional: true,
        mensaje: "Envío Nacional / Regional (Pago 100% Anticipado)",
        detalle: "Requiere pago completo de productos previo al despacho. El flete de transportadora se cancela al recibir.",
      };
    }

    // Caso 2: Barrio "Granjas" o "Las Granjas" en Neiva
    if (normalizedBarrio.includes("granja")) {
      const gratis = subtotal >= 15000;
      return {
        costo: gratis ? 0 : 3000,
        esGratis: gratis,
        esNacional: false,
        mensaje: gratis ? "¡Domicilio GRATIS en Las Granjas!" : "Domicilio Sede Las Granjas ($3.000)",
        detalle: gratis
          ? "Entrega sin costo por compras desde $15.000 COP en sede central."
          : "Agrega más productos para domicilio gratis en Las Granjas.",
      };
    }

    // Caso 3: Barrios Centro, Altico, Prado Alto, Los Andes ($5.000 COP)
    if (
      normalizedBarrio.includes("centro") ||
      normalizedBarrio.includes("altico") ||
      normalizedBarrio.includes("prado") ||
      normalizedBarrio.includes("andes")
    ) {
      return {
        costo: 5000,
        esGratis: false,
        esNacional: false,
        mensaje: "Tarifa Zona Centro / Altico ($5.000 COP)",
        detalle: "Tarifa estándar calculada para tu sector en Neiva.",
      };
    }

    // Caso 4: Barrios Ipanema, Canaima, Oriente / Sur ($6.000 COP)
    if (
      normalizedBarrio.includes("ipanema") ||
      normalizedBarrio.includes("canaima")
    ) {
      return {
        costo: 6000,
        esGratis: false,
        esNacional: false,
        mensaje: "Tarifa Zona Ipanema / Canaima ($6.000 COP)",
        detalle: "Tarifa estándar calculada para tu sector en Neiva.",
      };
    }

    // Caso 5: Cándido, Santa Inés, Quirinal y resto ($4.000 COP)
    const costoEstimado = 4000;
    return {
      costo: costoEstimado,
      esGratis: false,
      esNacional: false,
      mensaje: "Tarifa Domicilio Neiva ($4.000 COP)",
      detalle: `Tarifa estándar para tu sector en Neiva.`,
    };
  }, [ciudad, barrio]);

  const costoDomicilio = shippingCalculation.costo;
  const totalFinal = subtotal + costoDomicilio;

  const formatCOP = (val: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(val);

  const popularBarriosNeiva = [
    "Las Granjas",
    "Centro",
    "Cándido Leguízamo",
    "Santa Inés",
    "Ipanema",
    "Quirinal",
    "Altico",
    "Prado Alto",
    "Canaima",
    "Las Catleyas",
  ];

  const handleApplyHistory = (item: LocationHistoryItem) => {
    setBarrio(item.barrio);
    setCiudad(item.ciudad);
    if (item.direccion) setDireccion(item.direccion);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (items.length === 0) {
      setErrorMessage("Tu carrito está vacío. Agrega productos antes de continuar.");
      return;
    }

    if (!nombreCliente.trim() || !telefono.trim() || !direccion.trim() || !barrio.trim()) {
      setErrorMessage("Por favor completa todos los datos obligatorios de entrega.");
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        nombreCliente: nombreCliente.trim(),
        telefono: telefono.trim(),
        ciudad: ciudad.trim(),
        direccion: direccion.trim(),
        barrio: barrio.trim(),
        metodoPago,
        notas: notas.trim(),
        requiereAsesoria,
        costoDomicilio,
        items: items.map((i) => ({
          productId: i.productId,
          productName: i.productName,
          variantId: i.variantId || null,
          variantName: i.variantName || null,
          cantidad: i.cantidad,
          precioUnitario: i.precioUnitario,
        })),
      };

      // Invocación a Server Action robusta (Punto 8)
      const res = await createOrderAction(orderPayload);

      if (!res.success || !res.data) {
        setErrorMessage(res.message || "Error al procesar el pedido en el servidor.");
        setIsSubmitting(false);
        return;
      }

      // Guardar en el historial de ubicación local de forma segura
      try {
        const newHistoryItem: LocationHistoryItem = {
          barrio: barrio.trim(),
          ciudad: ciudad.trim(),
          direccion: direccion.trim(),
          costo: costoDomicilio,
          tipoEnvio: shippingCalculation.mensaje,
          fecha: new Date().toLocaleDateString("es-CO"),
        };

        const updated = [
          newHistoryItem,
          ...locationHistory.filter(
            (h) => h.barrio.toLowerCase() !== barrio.trim().toLowerCase()
          ),
        ].slice(0, 5);

        localStorage.setItem("dulce_location_history", JSON.stringify(updated));
        localStorage.setItem("dulce_last_barrio", barrio.trim());
        localStorage.setItem("dulce_last_address", direccion.trim());
      } catch (storageErr) {
        console.warn("Error guardando historial:", storageErr);
      }

      // Limpiar carrito local tras éxito seguro
      clearCart();

      // Guardar datos para pantalla de confirmación local elegante (UX-01)
      setOrderSuccessData({
        orderId: res.data.orderId,
        whatsappUrl: res.data.whatsappUrl,
        total: res.data.total,
        subtotal: res.data.subtotal,
        costoDomicilio: res.data.costoDomicilio,
        direccion: direccion.trim(),
        barrio: barrio.trim(),
        metodoPago,
        itemsCount: items.length,
        nombreCliente: nombreCliente.trim(),
      });
      setIsSubmitting(false);

      // Intentar abrir WhatsApp en nueva pestaña sin bloquear el navegador
      if (typeof window !== "undefined") {
        window.open(res.data.whatsappUrl, "_blank");
      }
    } catch (err: any) {
      console.error("Error en checkout:", err);
      setErrorMessage(
        err?.message || "Ocurrió un error inesperado de conexión al procesar tu pedido."
      );
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  // Pantalla de Confirmación de Pedido Exitoso (UX-01: Evita Dead-End y pérdida de contexto)
  if (orderSuccessData) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 sm:py-16">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#d4c2c2]/50 shadow-xl shadow-[#7b5455]/5 space-y-8 animate-in fade-in zoom-in-95 duration-300">
          {/* Header de Éxito */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <span className="text-xs uppercase tracking-[0.25em] text-[#735c00] font-bold block">
              ¡Pedido Registrado con Éxito!
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900">
              Orden #{orderSuccessData.orderId}
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
              Tu pedido ha sido reservado en nuestro sistema en Neiva. Para coordinar el despacho inmediato, por favor confirma vía WhatsApp.
            </p>
          </div>

          {/* Resumen de Entrega y Facturación */}
          <div className="bg-[#FAF9F6] p-5 sm:p-6 rounded-2xl border border-[#ebdcdc] space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between items-center pb-2 border-b border-gray-200/60">
              <span className="text-gray-500">Cliente:</span>
              <strong className="text-gray-900 font-semibold">{orderSuccessData.nombreCliente}</strong>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-gray-200/60">
              <span className="text-gray-500">Dirección de Entrega:</span>
              <span className="text-gray-900 font-medium text-right">
                {orderSuccessData.direccion} (Barrio {orderSuccessData.barrio})
              </span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-gray-200/60">
              <span className="text-gray-500">Método de Pago:</span>
              <span className="text-gray-900 font-medium uppercase">{orderSuccessData.metodoPago}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-gray-200/60">
              <span className="text-gray-500">Subtotal Productos:</span>
              <span className="text-gray-900 font-medium">{formatCOP(orderSuccessData.subtotal)}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-gray-200/60">
              <span className="text-gray-500">Costo de Domicilio en Neiva:</span>
              <span className="text-emerald-700 font-semibold">
                {orderSuccessData.costoDomicilio === 0 ? "¡GRATIS!" : formatCOP(orderSuccessData.costoDomicilio)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 text-base font-bold text-[#7b5455]">
              <span>Total a Cancelar:</span>
              <span className="font-serif text-lg">{formatCOP(orderSuccessData.total)}</span>
            </div>
          </div>

          {/* Acción Principal: WhatsApp */}
          <div className="space-y-3 pt-2">
            <a
              href={orderSuccessData.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 px-6 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-[#25D366]/20 flex items-center justify-center gap-2.5 transition-all transform active:scale-98"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Abrir WhatsApp y Coordinar Entrega</span>
            </a>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/tienda"
                className="flex-1 py-3 px-4 bg-white border border-[#d4c2c2] hover:bg-gray-50 text-gray-700 text-xs font-semibold uppercase tracking-wider rounded-xl text-center transition-colors"
              >
                Seguir Comprando
              </Link>
              <Link
                href="/"
                className="flex-1 py-3 px-4 bg-[#7b5455] hover:bg-[#613d3e] text-white text-xs font-semibold uppercase tracking-wider rounded-xl text-center transition-colors"
              >
                Volver al Inicio
              </Link>
            </div>
          </div>

          {/* Nota de Tranquilidad */}
          <div className="text-center pt-2 border-t border-gray-100">
            <p className="text-[11px] text-gray-400">
              ¿No se abrió WhatsApp automáticamente? Haz clic en el botón verde superior. Tu número de pedido es <strong>#{orderSuccessData.orderId}</strong>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-20 h-20 bg-[#f4c2c2]/30 text-[#7b5455] rounded-full flex items-center justify-center mx-auto">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-gray-900">
          No tienes productos en tu carrito
        </h1>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          Explora nuestro catálogo de maquillaje y productos de belleza con entregas inmediatas en Neiva.
        </p>
        <Link
          href="/tienda"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#7b5455] text-white text-xs uppercase tracking-widest font-semibold rounded-lg hover:bg-[#613d3e] transition-colors"
        >
          <span>Ir a la Tienda</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10 flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
        <Image
          src="/logo.png"
          alt="Dulce Cosmetics"
          width={64}
          height={64}
          priority
          className="w-16 h-16 rounded-full object-cover shadow-md ring-2 ring-[#f4c2c2]/70 shrink-0"
        />
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-[#735c00] font-bold">
            Checkout Seguro • Dulce Cosmetics Neiva
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1a1c1c] mt-0.5">
            Finalizar Pedido
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Completa tus datos de entrega para calcular el domicilio y despachar tu compra.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Columna Izquierda: Formulario de Entrega y Pago (7 Columnas) */}
        <div className="lg:col-span-7 space-y-8">
          {/* Alerta de Error */}
          {errorMessage && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Sección 1: Datos de Contacto y Entrega */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#d4c2c2]/40 shadow-sm space-y-6">
            <h2 className="font-serif text-xl font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#7b5455]" />
              <span>1. Datos de Contacto y Destino</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: María Camila González"
                  value={nombreCliente}
                  onChange={(e) => setNombreCliente(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#7b5455]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Teléfono / WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Ej: 317 123 4567"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#7b5455]"
                />
              </div>
            </div>

            {/* Selector de Ciudad */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Ciudad / Municipio *
                </label>
                <select
                  value={ciudad}
                  onChange={(e) => setCiudad(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#7b5455]"
                >
                  <option value="Neiva">Neiva (Huila)</option>
                  <option value="Palermo">Palermo</option>
                  <option value="Rivera">Rivera</option>
                  <option value="Campoalegre">Campoalegre</option>
                  <option value="Pitalito">Pitalito</option>
                  <option value="Otra Ciudad">Otra Ciudad (Nacional)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Barrio o Sector *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Escribe tu barrio (ej. Las Granjas, Cándido...)"
                  value={barrio}
                  onChange={(e) => setBarrio(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#7b5455]"
                />
              </div>
            </div>

            {/* Sugerencias de Barrios Populares en Neiva */}
            {ciudad.toLowerCase() === "neiva" && (
              <div className="space-y-2">
                <span className="text-[11px] text-gray-400 block">Sugerencias rápidas en Neiva:</span>
                <div className="flex flex-wrap gap-1.5">
                  {popularBarriosNeiva.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setBarrio(b)}
                      className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                        barrio.toLowerCase() === b.toLowerCase()
                          ? "bg-[#7b5455] text-white border-[#7b5455]"
                          : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tarjeta de Cálculo Dinámico de Domicilio (Punto 2, 12, 17) */}
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 transition-colors ${
                shippingCalculation.esGratis
                  ? "bg-[#e1e1c9]/40 border-[#827473]/30 text-[#43483e]"
                  : shippingCalculation.esNacional
                  ? "bg-amber-50 border-amber-200 text-amber-900"
                  : "bg-blue-50/70 border-blue-200 text-blue-900"
              }`}
            >
              <Truck className="w-5 h-5 shrink-0 mt-0.5 text-[#7b5455]" />
              <div className="space-y-1 text-xs">
                <div className="font-bold flex items-center gap-2">
                  <span>{shippingCalculation.mensaje}</span>
                  {shippingCalculation.esGratis && (
                    <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full uppercase font-bold">
                      Costo $0
                    </span>
                  )}
                </div>
                <p className="text-[11px] opacity-90">{shippingCalculation.detalle}</p>
              </div>
            </div>

            {/* Historial de ubicaciones previas en LocalStorage (Punto 17) */}
            {locationHistory.length > 0 && (
              <div className="pt-2 border-t border-gray-100 space-y-2">
                <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                  <History className="w-3.5 h-3.5 text-[#7b5455]" />
                  <span>Historial de ubicaciones recientes:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {locationHistory.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyHistory(item)}
                      className="text-[11px] px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg border border-gray-200 flex items-center gap-1.5 transition-all"
                    >
                      <MapPin className="w-3 h-3 text-[#7b5455]" />
                      <span>
                        {item.barrio} ({item.ciudad})
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                Dirección Exacta de Residencia *
              </label>
              <input
                type="text"
                required
                placeholder="Calle, Carrera, Número, Conjunto, Bloque, Apto"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#7b5455]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                Instrucciones Adicionales de Entrega (Opcional)
              </label>
              <textarea
                rows={2}
                placeholder="Punto de referencia, horario preferido o indicaciones para el domiciliario"
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#7b5455]"
              />
            </div>
          </div>

          {/* Sección 2: Método de Pago y Asesoría */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#d4c2c2]/40 shadow-sm space-y-6">
            <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
              <h2 className="font-serif text-xl font-bold text-gray-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#7b5455]" />
                <span>2. Método de Pago</span>
              </h2>
              <span className="text-[11px] font-medium text-gray-500">
                {ciudad.trim().toLowerCase() === "neiva"
                  ? "Pago local contraentrega disponible"
                  : "Destino nacional: Pago 100% anticipado"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Opción Efectivo */}
              <label
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                  ciudad.trim().toLowerCase() !== "neiva"
                    ? "opacity-45 bg-gray-50 border-gray-200 cursor-not-allowed"
                    : metodoPago === "efectivo"
                    ? "border-[#7b5455] bg-[#f4c2c2]/10 ring-2 ring-[#7b5455]/20 cursor-pointer"
                    : "border-gray-200 hover:border-gray-300 cursor-pointer"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-[#f4c2c2]/30 flex items-center justify-center text-[#7b5455]">
                    <Banknote className="w-4 h-4" />
                  </div>
                  <input
                    type="radio"
                    name="metodoPago"
                    disabled={ciudad.trim().toLowerCase() !== "neiva"}
                    checked={metodoPago === "efectivo" && ciudad.trim().toLowerCase() === "neiva"}
                    onChange={() => setMetodoPago("efectivo")}
                    className="accent-[#7b5455]"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Efectivo</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {ciudad.trim().toLowerCase() === "neiva"
                      ? "Contraentrega en tu puerta"
                      : "Solo disponible en Neiva"}
                  </p>
                </div>
              </label>

              {/* Opción Nequi */}
              <label
                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  metodoPago === "nequi"
                    ? "border-[#b17ef8] bg-[#b17ef8]/10 ring-2 ring-[#b17ef8]/30"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-[#b17ef8]/20 flex items-center justify-center text-[#7b1bf0]">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <input
                    type="radio"
                    name="metodoPago"
                    checked={metodoPago === "nequi"}
                    onChange={() => setMetodoPago("nequi")}
                    className="accent-[#7b1bf0]"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Nequi</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Transferencia directa
                  </p>
                </div>
              </label>

              {/* Opción Daviplata */}
              <label
                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  metodoPago === "daviplata"
                    ? "border-[#e63946] bg-[#e63946]/10 ring-2 ring-[#e63946]/30"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-[#e63946]/20 flex items-center justify-center text-[#e63946]">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <input
                    type="radio"
                    name="metodoPago"
                    checked={metodoPago === "daviplata"}
                    onChange={() => setMetodoPago("daviplata")}
                    className="accent-[#e63946]"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Daviplata</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Transferencia ágil
                  </p>
                </div>
              </label>
            </div>

            {/* Aviso informativo si el destino es fuera de Neiva */}
            {ciudad.trim().toLowerCase() !== "neiva" && (
              <div className="p-3.5 bg-amber-50 border border-amber-200/80 rounded-xl text-amber-900 text-xs flex items-start gap-2.5 animate-fade-in">
                <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block mb-0.5">Política de Pago Fuera de Neiva:</span>
                  <p className="leading-relaxed text-[11px]">
                    Para despachos a otros municipios o nivel nacional se requiere el <strong>pago completo (100% anticipado)</strong> de los cosméticos antes del envío vía Nequi o Daviplata. El valor del flete de transporte se cancela contraentrega a la empresa de mensajería (Interrapidísimo / Envía).
                  </p>
                </div>
              </div>
            )}

            {/* Checkbox: Requiere Asesoría de Belleza */}
            <div className="p-4 bg-[#FAF9F6] rounded-xl border border-[#d4c2c2]/40 flex items-start gap-3">
              <input
                type="checkbox"
                id="requiereAsesoria"
                checked={requiereAsesoria}
                onChange={(e) => setRequiereAsesoria(e.target.checked)}
                className="mt-1 w-4 h-4 text-[#7b5455] rounded accent-[#7b5455] cursor-pointer"
              />
              <label htmlFor="requiereAsesoria" className="text-xs text-gray-700 cursor-pointer">
                <strong className="text-gray-900 block font-semibold mb-0.5">
                  ✨ Deseo confirmación y asesoría antes del despacho
                </strong>
                Nuestra asesora confirmará contigo vía WhatsApp los tonos seleccionados antes de enviar el pedido.
              </label>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Resumen de Pedido y Confirmación (5 Columnas) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#d4c2c2]/40 shadow-sm sticky top-28 space-y-6">
            <h2 className="font-serif text-xl font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center justify-between">
              <span>Resumen de Compra</span>
              <span className="text-xs font-normal text-gray-500">
                ({items.reduce((acc, i) => acc + i.cantidad, 0)} productos)
              </span>
            </h2>

            {/* Lista de Items */}
            <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto pr-1">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.variantId}`}
                  className="py-3 flex gap-3 text-xs items-center"
                >
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
                    className="w-12 h-12 rounded object-cover border border-gray-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-800 truncate">{item.productName}</h4>
                    {item.variantName && (
                      <p className="text-gray-500">Tono: {item.variantName}</p>
                    )}
                    <p className="text-gray-400">Cant: {item.cantidad}</p>
                  </div>
                  <span className="font-[Arial] font-bold text-gray-900">
                    {formatCOP(item.precioUnitario * item.cantidad)}
                  </span>
                </div>
              ))}
            </div>

            {/* Desglose Financiero con Domicilio Dinámico */}
            <div className="border-t border-gray-100 pt-4 space-y-2.5 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal Productos</span>
                <span className="font-[Arial] font-semibold text-gray-800">
                  {formatCOP(subtotal)}
                </span>
              </div>

              <div className="flex justify-between items-start">
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-[#7b5455]" />
                  <span>Domicilio ({barrio})</span>
                </span>
                <div className="text-right">
                  {shippingCalculation.esGratis ? (
                    <span className="font-bold text-emerald-600 uppercase">¡GRATIS!</span>
                  ) : shippingCalculation.esNacional ? (
                    <span className="font-semibold text-amber-700">Por Cobrar</span>
                  ) : (
                    <span className="font-[Arial] font-bold text-gray-800">
                      {formatCOP(costoDomicilio)}
                    </span>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-3 flex justify-between items-baseline">
                <span className="font-serif text-base font-bold text-gray-900">Total a Pagar</span>
                <span className="font-[Arial] text-2xl font-bold text-[#7b5455]">
                  {formatCOP(totalFinal)}
                </span>
              </div>
            </div>

            {/* Botón de Confirmación por WhatsApp */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 transform active:scale-95 disabled:opacity-50"
            >
              <MessageCircle className="w-5 h-5" />
              <span>
                {isSubmitting ? "Procesando pedido..." : "Confirmar Pedido por WhatsApp"}
              </span>
            </button>

            <div className="space-y-2 text-[11px] text-gray-500 bg-gray-50 p-3.5 rounded-lg border border-gray-100">
              <div className="flex items-center gap-1.5 font-medium text-gray-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Pedido registrado en la base de datos Neon</span>
              </div>
              <p>
                Al confirmar, se abrirá la conversación de WhatsApp con el resumen listo para despachar en Neiva.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
