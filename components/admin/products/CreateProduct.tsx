"use client";

import { useState, useEffect } from "react";
import ProductForm from "./ProductForm";
import { createProductAction } from "@/backend/actions/products";
import { ProductStandardInput } from "@/backend/types";
import { PlusCircle, X } from "lucide-react";

interface CategoryOption {
  id: number;
  nombre: string;
}

interface CreateProductProps {
  categories: CategoryOption[];
  onSuccess?: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateProduct({
  categories,
  onSuccess,
  isOpen,
  onClose,
}: CreateProductProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverMessage, setServerMessage] = useState<{ text: string; error: boolean } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const handleCreate = async (formData: ProductStandardInput) => {
    setIsSubmitting(true);
    setServerMessage(null);

    try {
      const res = await createProductAction(formData);

      if (res.success) {
        setServerMessage({ text: res.message, error: false });
        setTimeout(() => {
          onClose();
          if (onSuccess) onSuccess();
        }, 800);
      } else {
        setServerMessage({ text: res.message, error: true });
      }
    } catch (err: any) {
      setServerMessage({
        text: err?.message || "Error inesperado al conectar con el servidor.",
        error: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Crear nuevo producto"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex min-h-full items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-2xl w-full p-4 sm:p-6 md:p-8 shadow-2xl border border-gray-100 relative max-h-[92vh] sm:max-h-[90vh] overflow-y-auto flex flex-col my-0 sm:my-auto animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors z-10"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {serverMessage && (
          <div
            className={`mb-4 p-3 rounded-xl text-xs font-medium ${
              serverMessage.error
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
            }`}
          >
            {serverMessage.text}
          </div>
        )}

        <ProductForm
          title="Crear Nuevo Producto en Neiva"
          categories={categories}
          onSubmit={handleCreate}
          isSubmitting={isSubmitting}
          submitButtonText="Publicar en Catálogo"
          onCancel={onClose}
        />
      </div>
    </div>
  );
}
