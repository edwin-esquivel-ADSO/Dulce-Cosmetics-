"use client";

import { useState, useEffect } from "react";
import { ProductStandardInput } from "@/backend/types";
import { Sparkles, Plus, Trash2, Image as ImageIcon } from "lucide-react";

interface CategoryOption {
  id: number;
  nombre: string;
}

interface ProductFormProps {
  initialData?: Partial<ProductStandardInput>;
  categories: CategoryOption[];
  onSubmit: (formData: ProductStandardInput) => Promise<void>;
  isSubmitting: boolean;
  submitButtonText: string;
  onCancel?: () => void;
  title: string;
}

export default function ProductForm({
  initialData,
  categories,
  onSubmit,
  isSubmitting,
  submitButtonText,
  onCancel,
  title,
}: ProductFormProps) {
  // 6 Campos obligatorios estandarizados (Puntos 9, 10)
  const [nombre, setNombre] = useState(initialData?.nombre || "");
  const [precio, setPrecio] = useState<number | string>(initialData?.precio || "");
  const [descripcion, setDescripcion] = useState(initialData?.descripcion || "");
  const [stock, setStock] = useState<number | string>(initialData?.stock ?? 10);
  const [categoryId, setCategoryId] = useState<number | string>(
    initialData?.categoryId || (categories.length > 0 ? categories[0].id : "")
  );
  const [imagenUrl, setImagenUrl] = useState(initialData?.imagenUrl || "");

  // Campos complementarios
  const [destacado, setDestacado] = useState(initialData?.destacado || false);
  const [estado, setEstado] = useState(initialData?.estado ?? true);
  const [variantes, setVariantes] = useState<Array<{ nombre: string; stockEstimado: number }>>(
    initialData?.variantes || []
  );

  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);

  const handleAddVariant = () => {
    setVariantes([...variantes, { nombre: "", stockEstimado: 10 }]);
  };

  const handleRemoveVariant = (index: number) => {
    setVariantes(variantes.filter((_, idx) => idx !== index));
  };

  const handleVariantChange = (
    index: number,
    field: "nombre" | "stockEstimado",
    value: string | number
  ) => {
    const updated = [...variantes];
    if (field === "nombre") {
      updated[index].nombre = String(value);
    } else {
      updated[index].stockEstimado = Number(value) || 0;
    }
    setVariantes(updated);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    // Validación rigurosa de los 6 campos estandarizados obligatorios (Puntos 9, 10)
    if (!nombre.trim()) {
      setFormError("El nombre del producto es obligatorio.");
      return;
    }

    if (!precio || Number(precio) <= 0) {
      setFormError("El precio debe ser un valor positivo en pesos colombianos.");
      return;
    }

    if (!descripcion.trim() || descripcion.trim().length < 5) {
      setFormError("La descripción debe tener al menos 5 caracteres.");
      return;
    }

    if (stock === "" || Number(stock) < 0) {
      setFormError("El stock debe ser un valor mayor o igual a 0.");
      return;
    }

    if (!categoryId || Number(categoryId) <= 0) {
      setFormError("Debes seleccionar una categoría válida.");
      return;
    }

    if (!imagenUrl.trim()) {
      setFormError("La URL de la imagen del producto es obligatoria.");
      return;
    }

    const payload: ProductStandardInput = {
      nombre: nombre.trim(),
      precio: Number(precio),
      descripcion: descripcion.trim(),
      stock: Number(stock),
      categoryId: Number(categoryId),
      imagenUrl: imagenUrl.trim(),
      destacado,
      estado,
      variantes: variantes.filter((v) => v.nombre.trim() !== ""),
    };

    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      <div className="border-b border-gray-100 pb-4">
        <h3 className="font-serif text-xl font-bold text-gray-900">{title}</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          Ingresa la información técnica y comercial para el catálogo de Neiva.
        </p>
      </div>

      {formError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
          {formError}
        </div>
      )}

      {/* Grid de los 6 campos estandarizados obligatorios */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 1. Nombre */}
        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
            1. Nombre del Producto *
          </label>
          <input
            type="text"
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Pestañina Waterproof Volumen Extremo 24H"
            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#7b5455]"
          />
        </div>

        {/* 2. Categoría */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
            2. Categoría *
          </label>
          <select
            required
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#7b5455]"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Precio */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
            3. Precio (COP) *
          </label>
          <input
            type="number"
            required
            min={0}
            step={100}
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            placeholder="Ej: 28000"
            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#7b5455]"
          />
        </div>

        {/* 4. Stock */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
            4. Stock Disponible *
          </label>
          <input
            type="number"
            required
            min={0}
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            placeholder="Ej: 15"
            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#7b5455]"
          />
        </div>

        {/* 5. URL de Imagen */}
        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center justify-between">
            <span>5. URL de la Imagen *</span>
            {imagenUrl && (
              <a
                href={imagenUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-[#7b5455] hover:underline"
              >
                Vista previa ↗
              </a>
            )}
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              required
              value={imagenUrl}
              onChange={(e) => setImagenUrl(e.target.value)}
              placeholder="https://images.unsplash.com/... o URL directa"
              className="flex-1 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#7b5455]"
            />
            {imagenUrl && (
              <div className="w-10 h-10 rounded border border-gray-200 overflow-hidden shrink-0 bg-white">
                <img src={imagenUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>

        {/* 6. Descripción */}
        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
            6. Descripción Comercial *
          </label>
          <textarea
            required
            rows={3}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Fórmula de larga duración resistente al calor de Neiva, no mancha ni deja grumos..."
            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#7b5455]"
          />
        </div>
      </div>

      {/* Variantes Opcionales (Tonos / Acabados) */}
      <div className="border-t border-gray-100 pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
            Variantes de Tonos (Opcional)
          </label>
          <button
            type="button"
            onClick={handleAddVariant}
            className="text-xs px-2.5 py-1 bg-[#f4c2c2]/40 text-[#7b5455] hover:bg-[#f4c2c2] rounded-md font-semibold flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span>Añadir Tono</span>
          </button>
        </div>

        {variantes.length === 0 ? (
          <p className="text-xs text-gray-400 italic">No hay tonos o variantes configuradas.</p>
        ) : (
          <div className="space-y-2">
            {variantes.map((v, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Nombre de tono (ej: Nude 01, Cereza)"
                  value={v.nombre}
                  onChange={(e) => handleVariantChange(idx, "nombre", e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-xs focus:outline-none focus:border-[#7b5455]"
                />
                <input
                  type="number"
                  placeholder="Stock"
                  min={0}
                  value={v.stockEstimado}
                  onChange={(e) => handleVariantChange(idx, "stockEstimado", e.target.value)}
                  className="w-20 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-xs focus:outline-none focus:border-[#7b5455]"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveVariant(idx)}
                  className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                  title="Eliminar variante"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Checkboxes de Estado y Destacado */}
      <div className="border-t border-gray-100 pt-4 flex flex-wrap gap-6 text-xs">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={destacado}
            onChange={(e) => setDestacado(e.target.checked)}
            className="w-4 h-4 accent-[#7b5455]"
          />
          <span className="font-medium text-gray-700">⭐ Producto Destacado (Top Ventas)</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={estado}
            onChange={(e) => setEstado(e.target.checked)}
            className="w-4 h-4 accent-[#7b5455]"
          />
          <span className="font-medium text-gray-700">🟢 Activo en Tienda</span>
        </label>
      </div>

      {/* Botones de Acción */}
      <div className="border-t border-gray-100 pt-4 flex flex-col-reverse sm:flex-row justify-end gap-2.5 sticky bottom-0 bg-white py-3 -mx-4 px-4 sm:-mx-6 sm:px-6 z-10">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-5 py-2.5 border border-gray-300 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto px-6 py-2.5 bg-[#7b5455] hover:bg-[#613d3e] text-white text-xs font-semibold uppercase tracking-wider rounded-xl shadow-md shadow-[#7b5455]/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Guardando...</span>
            </div>
          ) : (
            <span>{submitButtonText}</span>
          )}
        </button>
      </div>
    </form>
  );
}
