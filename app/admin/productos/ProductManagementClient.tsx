"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toggleProductStatus } from "@/backend/actions/products";
import CreateProduct from "@/components/admin/products/CreateProduct";
import EditProduct, { EditableProduct } from "@/components/admin/products/EditProduct";
import DeleteProductModal from "@/components/admin/products/DeleteProductModal";
import {
  Plus,
  Trash2,
  Edit,
  Package,
  Sparkles,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface ProductManagementClientProps {
  categories: Array<{ id: number; nombre: string }>;
  products: Array<{
    id: number;
    nombre: string;
    slug: string;
    descripcion: string;
    precio: number;
    imagenUrl: string;
    stock: number;
    destacado: boolean;
    estado: boolean;
    categoryId: number;
    category: { id: number; nombre: string };
    variants: Array<{ id: number; nombre: string; stockEstimado: number }>;
  }>;
}

export default function ProductManagementClient({
  categories,
  products: initialProducts,
}: ProductManagementClientProps) {
  const router = useRouter();
  const [productsList, setProductsList] = useState(initialProducts);

  // Estados de modales modulares (Puntos 9, 10)
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<EditableProduct | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<{ id: number; nombre: string } | null>(
    null
  );

  const [notification, setNotification] = useState<{ text: string; error: boolean } | null>(null);

  const showNotification = (text: string, error = false) => {
    setNotification({ text, error });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      const res = await toggleProductStatus(id, currentStatus);
      if (res.success) {
        setProductsList((prev) =>
          prev.map((p) => (p.id === id ? { ...p, estado: !currentStatus } : p))
        );
        showNotification(res.message);
      } else {
        showNotification(res.message, true);
      }
    } catch (err: any) {
      showNotification(err?.message || "Error al actualizar estado.", true);
    }
  };

  const refreshData = () => {
    router.refresh();
  };

  const formatCOP = (val: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-[#735c00] font-bold">
            Catálogo & Stock Neiva
          </span>
          <h1 className="font-serif text-3xl font-bold text-gray-900 mt-0.5">
            Gestión de Productos
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Crea, edita y administra los cosméticos visibles en la tienda online.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#7b5455] hover:bg-[#613d3e] text-white text-xs uppercase tracking-wider font-semibold rounded-xl shadow transition-all transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Producto</span>
        </button>
      </div>

      {/* Notificación Toast */}
      {notification && (
        <div
          className={`p-4 rounded-xl text-xs font-medium flex items-center gap-2.5 border ${
            notification.error
              ? "bg-red-50 text-red-800 border-red-200"
              : "bg-emerald-50 text-emerald-800 border-emerald-200"
          }`}
        >
          {notification.error ? (
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Tabla de Productos */}
      <div className="bg-white rounded-2xl border border-[#d4c2c2]/40 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-[#7b5455]" />
            <h2 className="font-serif text-base font-bold text-gray-900">
              Productos Registrados ({productsList.length})
            </h2>
          </div>
        </div>

        {/* Vista Móvil: Tarjetas de productos (< md) */}
        <div className="md:hidden divide-y divide-gray-100">
          {productsList.length === 0 ? (
            <div className="py-10 text-center text-gray-400 text-xs px-4">
              No hay productos en el catálogo. Haz clic en "Nuevo Producto" para agregar el primero.
            </div>
          ) : (
            productsList.map((product) => (
              <div key={product.id} className="p-4 space-y-3 bg-white">
                <div className="flex items-center gap-3">
                  <img
                    src={product.imagenUrl}
                    alt={product.nombre}
                    className="w-14 h-14 rounded-xl object-cover border border-gray-200 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 text-sm truncate">{product.nombre}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="px-2 py-0.5 rounded-full bg-gray-100 text-[10px] text-gray-600">
                        {product.category?.nombre || "Sin Categoría"}
                      </span>
                      <span className="text-[11px] font-mono text-gray-500">
                        {product.stock} en stock
                      </span>
                    </div>
                    <p className="font-bold text-[#7b5455] text-xs mt-1 font-[Arial]">
                      {formatCOP(product.precio)}
                    </p>
                  </div>
                </div>

                {/* Acciones y Estado en Móvil */}
                <div className="flex items-center justify-between pt-1 border-t border-gray-50">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(product.id, product.estado)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      product.estado
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-gray-100 text-gray-500 border border-gray-200"
                    }`}
                  >
                    {product.estado ? (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Activo</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Inactivo</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEditingProduct(product as any)}
                      className="p-2 text-gray-600 hover:text-[#7b5455] hover:bg-[#f4c2c2]/20 rounded-xl border border-gray-200 transition-colors"
                      title="Editar producto"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingProduct({ id: product.id, nombre: product.nombre })}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl border border-red-200 transition-colors"
                      title="Eliminar producto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Vista Desktop: Tabla completa (>= md) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-100 text-gray-500 uppercase tracking-wider">
                <th className="py-3 px-4">Producto</th>
                <th className="py-3 px-4">Categoría</th>
                <th className="py-3 px-4">Precio</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Variantes</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {productsList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-gray-400">
                    No hay productos en el catálogo. Haz clic en "Nuevo Producto" para agregar el primero.
                  </td>
                </tr>
              ) : (
                productsList.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.imagenUrl}
                          alt={product.nombre}
                          className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0"
                        />
                        <div className="min-w-0 max-w-xs">
                          <p className="font-semibold text-gray-900 truncate">{product.nombre}</p>
                          <p className="text-[10px] text-gray-400 font-mono">slug: {product.slug}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-gray-600">
                      <span className="px-2 py-0.5 rounded-full bg-gray-100 border border-gray-200 text-[10px]">
                        {product.category?.nombre || "Sin Categoría"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-[Arial] font-bold text-gray-900">
                      {formatCOP(product.precio)}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-gray-700">
                      {product.stock} unids
                    </td>

                    <td className="py-3.5 px-4 text-gray-500">
                      {product.variants?.length > 0 ? (
                        <span className="text-[11px] text-gray-600">
                          {product.variants.map((v) => v.nombre).join(", ")}
                        </span>
                      ) : (
                        <span className="text-[11px] text-gray-400 italic">Sin tonos</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleStatus(product.id, product.estado)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                          product.estado
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                            : "bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200"
                        }`}
                      >
                        {product.estado ? (
                          <>
                            <Eye className="w-3 h-3" />
                            <span>Activo</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3" />
                            <span>Inactivo</span>
                          </>
                        )}
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => setEditingProduct(product as any)}
                          className="p-1.5 text-gray-500 hover:text-[#7b5455] hover:bg-[#f4c2c2]/30 rounded-lg transition-colors"
                          title="Editar producto"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setDeletingProduct({ id: product.id, nombre: product.nombre })}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar producto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Componente Modular 1: Crear Producto (Puntos 9, 10) */}
      <CreateProduct
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        categories={categories}
        onSuccess={() => {
          showNotification("Producto creado con éxito.");
          refreshData();
        }}
      />

      {/* Componente Modular 2: Editar Producto (Puntos 9, 10) */}
      <EditProduct
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        product={editingProduct}
        categories={categories}
        onSuccess={() => {
          showNotification("Producto actualizado con éxito.");
          refreshData();
        }}
      />

      {/* Componente Modular 3: Eliminar Producto Modal (Puntos 9, 10) */}
      <DeleteProductModal
        isOpen={!!deletingProduct}
        onClose={() => setDeletingProduct(null)}
        productId={deletingProduct?.id || null}
        productName={deletingProduct?.nombre || ""}
        onSuccess={() => {
          if (deletingProduct) {
            setProductsList((prev) => prev.filter((p) => p.id !== deletingProduct.id));
            showNotification(`Producto "${deletingProduct.nombre}" eliminado.`);
          }
          refreshData();
        }}
      />
    </div>
  );
}
