import { getAdminKPIs, getOrdersAdmin } from "@/backend/actions/orders";
import Link from "next/link";
import {
  DollarSign,
  Clock,
  CheckCircle2,
  Package,
  TrendingUp,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Users,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [kpis, recentOrders] = await Promise.all([
    getAdminKPIs(),
    getOrdersAdmin(),
  ]);

  const formatCOP = (val: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-900">
            Panel de Control General
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Métricas clave y estado de ventas en tiempo real para Dulce Cosmetics en Neiva.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/administradores"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#FAF9F6] border border-[#d4c2c2]/60 text-[#7b5455] text-xs font-semibold rounded-xl hover:bg-[#f4c2c2]/30 transition-colors shadow-sm"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Administradores</span>
          </Link>
          <Link
            href="/admin/productos"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#7b5455] text-white text-xs font-semibold rounded-xl hover:bg-[#613d3e] transition-colors shadow-sm"
          >
            <Package className="w-3.5 h-3.5" />
            <span>Gestionar Productos</span>
          </Link>
          <Link
            href="/admin/pedidos"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
          >
            <span>Ver Todos los Pedidos</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Grid de KPIs Solicitados */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Ventas del Día */}
        <div className="bg-white p-6 rounded-2xl border border-[#d4c2c2]/40 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-gray-400 font-bold">
              Ventas del Día
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">
            {formatCOP(kpis.ventasHoy)}
          </p>
          <span className="text-[11px] text-gray-500 block">
            Facturado hoy en Neiva
          </span>
        </div>

        {/* KPI 2: Pedidos Pendientes */}
        <div className="bg-white p-6 rounded-2xl border border-[#d4c2c2]/40 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-gray-400 font-bold">
              Pedidos Pendientes
            </span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-[#7b5455]">
            {kpis.pedidosPendientes}
          </p>
          <span className="text-[11px] text-amber-700 font-medium block">
            Por confirmar o coordinar despacho
          </span>
        </div>

        {/* KPI 3: Total Ventas Acumuladas */}
        <div className="bg-white p-6 rounded-2xl border border-[#d4c2c2]/40 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-gray-400 font-bold">
              Ventas Totales
            </span>
            <div className="p-2 bg-[#f4c2c2]/40 text-[#7b5455] rounded-lg">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">
            {formatCOP(kpis.totalVentas)}
          </p>
          <span className="text-[11px] text-gray-500 block">
            {kpis.totalPedidos} pedido(s) registrados
          </span>
        </div>

        {/* KPI 4: Productos Activos */}
        <div className="bg-white p-6 rounded-2xl border border-[#d4c2c2]/40 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-gray-400 font-bold">
              Catálogo Activo
            </span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">
            {kpis.totalProductos}
          </p>
          <span className="text-[11px] text-gray-500 block">
            Productos en base de datos Neon
          </span>
        </div>
      </div>

      {/* Tabla Resumen de Últimos Pedidos Recibidos */}
      <div className="bg-white rounded-2xl border border-[#d4c2c2]/40 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg font-bold text-gray-900">
              Últimos Pedidos Registrados
            </h2>
            <p className="text-xs text-gray-500">
              Clientes que han solicitado productos a domicilio en Neiva
            </p>
          </div>
          <Link
            href="/admin/pedidos"
            className="text-xs text-[#7b5455] font-semibold hover:underline flex items-center gap-1"
          >
            <span>Administrar Todos</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-xs">
            Aún no se han registrado pedidos en la tienda.
          </div>
        ) : (
          <>
            {/* Vista Móvil: Tarjetas de pedidos recientes (< md) */}
            <div className="md:hidden divide-y divide-gray-100">
              {recentOrders.slice(0, 6).map((order) => (
                <div key={order.id} className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-gray-900 text-sm">
                      #{order.id}
                    </span>
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        order.estado === "Pendiente"
                          ? "bg-amber-100 text-amber-800"
                          : order.estado === "Confirmado"
                          ? "bg-blue-100 text-blue-800"
                          : order.estado === "Enviado"
                          ? "bg-purple-100 text-purple-800"
                          : order.estado === "Entregado"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {order.estado}
                    </span>
                  </div>

                  <div className="flex items-start justify-between text-xs">
                    <div>
                      <p className="font-semibold text-gray-900">{order.nombreCliente}</p>
                      <p className="text-[11px] text-gray-500">{order.barrio} - {order.direccion}</p>
                    </div>
                    <p className="font-bold text-[#7b5455] text-sm">{formatCOP(order.total)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Vista Desktop: Tabla completa (>= md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF9F6] text-gray-600 uppercase tracking-wider font-semibold border-b border-gray-100">
                  <tr>
                    <th className="py-3.5 px-6">ID</th>
                    <th className="py-3.5 px-6">Cliente</th>
                    <th className="py-3.5 px-6">Barrio / Dirección</th>
                    <th className="py-3.5 px-6">Pago</th>
                    <th className="py-3.5 px-6">Total</th>
                    <th className="py-3.5 px-6">Estado</th>
                    <th className="py-3.5 px-6">Asesoría</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentOrders.slice(0, 6).map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3.5 px-6 font-mono font-bold text-gray-700">
                        #{order.id}
                      </td>
                      <td className="py-3.5 px-6 font-medium text-gray-900">
                        {order.nombreCliente}
                        <span className="block text-[10px] text-gray-400 font-normal">
                          {order.telefono}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-gray-600">
                        <span className="font-semibold text-gray-800">{order.barrio}</span>
                        <span className="block text-[10px] text-gray-400 truncate max-w-xs">
                          {order.direccion}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 capitalize text-gray-700">
                        {order.metodoPago}
                      </td>
                      <td className="py-3.5 px-6 font-bold text-[#7b5455]">
                        {formatCOP(order.total)}
                      </td>
                      <td className="py-3.5 px-6">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            order.estado === "Pendiente"
                              ? "bg-amber-100 text-amber-800"
                              : order.estado === "Confirmado"
                              ? "bg-blue-100 text-blue-800"
                              : order.estado === "Enviado"
                              ? "bg-purple-100 text-purple-800"
                              : order.estado === "Entregado"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {order.estado}
                        </span>
                      </td>
                      <td className="py-3.5 px-6">
                        {order.requiereAsesoria ? (
                          <span className="text-[10px] bg-pink-100 text-pink-700 px-2 py-0.5 rounded font-semibold">
                            Requiere
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-400">No</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
