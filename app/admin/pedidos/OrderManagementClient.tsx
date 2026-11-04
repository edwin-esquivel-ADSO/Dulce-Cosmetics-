"use client";

import { useState } from "react";
import { updateOrderStatusAction } from "@/backend/actions/orders";
import {
  ShoppingBag,
  MessageCircle,
  Truck,
  CheckCircle2,
  Clock,
  Filter,
  ExternalLink,
  HelpCircle,
} from "lucide-react";

interface OrderItem {
  id: number;
  productName: string;
  variantName: string | null;
  cantidad: number;
  precioUnitario: number;
}

interface OrderData {
  id: number;
  nombreCliente: string;
  telefono: string;
  direccion: string;
  barrio: string;
  metodoPago: string;
  total: number;
  costoDomicilio: number;
  estado: string;
  notas: string | null;
  requiereAsesoria: boolean;
  createdAt: Date;
  items: OrderItem[];
}

interface OrderManagementClientProps {
  orders: OrderData[];
}

export default function OrderManagementClient({
  orders: initialOrders,
}: OrderManagementClientProps) {
  const [ordersList, setOrdersList] = useState(initialOrders);
  const [filterStatus, setFilterStatus] = useState<string>("todos");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await updateOrderStatusAction(orderId, newStatus);
      if (res.success) {
        setOrdersList((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, estado: newStatus } : o))
        );
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders =
    filterStatus === "todos"
      ? ordersList
      : ordersList.filter((o) => o.estado.toLowerCase() === filterStatus.toLowerCase());

  const formatCOP = (val: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(val);

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "573177780413";

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-900">
            Gestión de Pedidos
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Supervisa las entregas en Neiva, cambia los estados en tiempo real y contacta al
            cliente.
          </p>
        </div>

        {/* Filtros de Estado */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {["todos", "Pendiente", "Confirmado", "Enviado", "Entregado"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold capitalize transition-all whitespace-nowrap ${
                filterStatus === status
                  ? "bg-[#7b5455] text-white shadow-sm"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla de Pedidos */}
      <div className="bg-white rounded-2xl border border-[#d4c2c2]/40 shadow-sm overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-gray-700">
              No hay pedidos con el estado seleccionado
            </p>
          </div>
        ) : (
          <>
            {/* Vista Móvil: Tarjetas individuales táctiles (< md) */}
            <div className="md:hidden divide-y divide-gray-100">
              {filteredOrders.map((order) => {
                const clientWhatsapp = `https://wa.me/57${order.telefono.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                  `¡Hola ${order.nombreCliente}! Te saludamos de Dulce Cosmetics respecto a tu pedido #${order.id}. Tu estado actual es: ${order.estado}.`
                )}`;

                return (
                  <div key={order.id} className="p-4 space-y-3 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-gray-900 text-sm">
                          #{order.id}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString("es-CO", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <span className="font-bold text-[#7b5455] text-sm">
                        {formatCOP(order.total)}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-2 text-xs">
                      <div>
                        <p className="font-semibold text-gray-900">{order.nombreCliente}</p>
                        <p className="text-gray-500 font-mono text-[11px]">{order.telefono}</p>
                        <p className="text-[#7b5455] font-medium text-[11px] mt-0.5">
                          📍 {order.barrio} - <span className="text-gray-600">{order.direccion}</span>
                        </p>
                      </div>
                      {order.requiereAsesoria && (
                        <span className="shrink-0 px-2 py-0.5 bg-pink-100 text-pink-700 rounded text-[9px] font-bold uppercase">
                          Asesoría
                        </span>
                      )}
                    </div>

                    {/* Ítems del pedido */}
                    <div className="bg-gray-50 p-2.5 rounded-xl text-xs space-y-1">
                      {order.items.map((i) => (
                        <div key={i.id} className="flex justify-between text-gray-700 text-[11px]">
                          <span>
                            {i.cantidad}x {i.productName}
                            {i.variantName && (
                              <span className="text-[#735c00] ml-1">({i.variantName})</span>
                            )}
                          </span>
                          <span className="font-mono font-medium">
                            {formatCOP(i.precioUnitario * i.cantidad)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Acciones Móviles */}
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <select
                        value={order.estado}
                        disabled={updatingId === order.id}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`flex-1 px-3 py-2 rounded-xl font-bold text-xs border focus:outline-none transition-colors ${
                          order.estado === "Pendiente"
                            ? "bg-amber-50 text-amber-800 border-amber-300"
                            : order.estado === "Confirmado"
                            ? "bg-blue-50 text-blue-800 border-blue-300"
                            : order.estado === "Enviado"
                            ? "bg-purple-50 text-purple-800 border-purple-300"
                            : order.estado === "Entregado"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                            : "bg-gray-100 text-gray-800 border-gray-300"
                        }`}
                      >
                        <option value="Pendiente">Pendiente</option>
                        <option value="Confirmado">Confirmado</option>
                        <option value="Enviado">Enviado</option>
                        <option value="Entregado">Entregado</option>
                        <option value="Cancelado">Cancelado</option>
                      </select>

                      <a
                        href={clientWhatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#25D366] text-white rounded-xl text-xs font-semibold hover:opacity-90 shadow-sm shrink-0"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Vista Desktop: Tabla tradicional (>= md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF9F6] text-gray-600 uppercase tracking-wider font-semibold border-b border-gray-100">
                  <tr>
                    <th className="py-4 px-6">Pedido</th>
                    <th className="py-4 px-6">Cliente & Contacto</th>
                    <th className="py-4 px-6">Lugar de Entrega (Neiva)</th>
                    <th className="py-4 px-6">Ítems Solicitados</th>
                    <th className="py-4 px-6">Total & Pago</th>
                    <th className="py-4 px-6">Estado (Interactivo)</th>
                    <th className="py-4 px-6 text-right">Contacto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map((order) => {
                    const clientWhatsapp = `https://wa.me/57${order.telefono.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                      `¡Hola ${order.nombreCliente}! Te saludamos de Dulce Cosmetics respecto a tu pedido #${order.id}. Tu estado actual es: ${order.estado}.`
                    )}`;

                    return (
                      <tr key={order.id} className="hover:bg-gray-50/70 transition-colors">
                        {/* ID y Fecha */}
                        <td className="py-4 px-6 align-top">
                          <span className="font-mono font-bold text-gray-900 text-sm">
                            #{order.id}
                          </span>
                          <span className="block text-[10px] text-gray-400 mt-0.5">
                            {new Date(order.createdAt).toLocaleDateString("es-CO", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {order.requiereAsesoria && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-pink-100 text-pink-700 rounded text-[9px] font-bold uppercase tracking-wider">
                              Pide Asesoría
                            </span>
                          )}
                        </td>

                        {/* Cliente */}
                        <td className="py-4 px-6 align-top">
                          <span className="font-semibold text-gray-900 block">
                            {order.nombreCliente}
                          </span>
                          <span className="text-gray-500 font-mono text-[11px]">
                            {order.telefono}
                          </span>
                        </td>

                        {/* Dirección */}
                        <td className="py-4 px-6 align-top max-w-xs">
                          <span className="font-bold text-[#7b5455] block">
                            {order.barrio}
                          </span>
                          <span className="text-gray-600 block mt-0.5">
                            {order.direccion}
                          </span>
                          {order.notas && (
                            <span className="block text-[10px] text-gray-400 italic mt-1 bg-gray-50 p-1 rounded">
                              Nota: {order.notas}
                            </span>
                          )}
                        </td>

                        {/* Ítems */}
                        <td className="py-4 px-6 align-top">
                          <div className="space-y-1 max-w-xs">
                            {order.items.map((i) => (
                              <div key={i.id} className="text-gray-700">
                                <span className="font-semibold">{i.cantidad}x</span>{" "}
                                <span>{i.productName}</span>
                                {i.variantName && (
                                  <span className="text-[#735c00] text-[10px] font-medium ml-1">
                                    ({i.variantName})
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </td>

                        {/* Total */}
                        <td className="py-4 px-6 align-top">
                          <span className="font-bold text-[#7b5455] text-sm block">
                            {formatCOP(order.total)}
                          </span>
                          <span className="text-[10px] uppercase tracking-wider text-gray-500 block capitalize">
                            {order.metodoPago}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {order.costoDomicilio === 0
                              ? "Domicilio Gratis"
                              : `Envío: ${formatCOP(order.costoDomicilio)}`}
                          </span>
                        </td>

                        {/* Estado Interactivo */}
                        <td className="py-4 px-6 align-top">
                          <select
                            value={order.estado}
                            disabled={updatingId === order.id}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className={`px-3 py-1.5 rounded-lg font-bold text-xs border focus:outline-none transition-colors ${
                              order.estado === "Pendiente"
                                ? "bg-amber-50 text-amber-800 border-amber-300"
                                : order.estado === "Confirmado"
                                ? "bg-blue-50 text-blue-800 border-blue-300"
                                : order.estado === "Enviado"
                                ? "bg-purple-50 text-purple-800 border-purple-300"
                                : order.estado === "Entregado"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                : "bg-gray-100 text-gray-800 border-gray-300"
                            }`}
                          >
                            <option value="Pendiente">Pendiente</option>
                            <option value="Confirmado">Confirmado</option>
                            <option value="Enviado">Enviado</option>
                            <option value="Entregado">Entregado</option>
                            <option value="Cancelado">Cancelado</option>
                          </select>
                        </td>

                        {/* Acción Contactar */}
                        <td className="py-4 px-6 align-top text-right">
                          <a
                            href={clientWhatsapp}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] text-white rounded-lg text-xs font-semibold hover:opacity-90 shadow-sm"
                            title="Contactar al cliente por WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
