"use client";

import { useState, useEffect } from "react";
import { deleteProductAction } from "@/backend/actions/products";
import { AlertTriangle, Trash2, X } from "lucide-react";

interface DeleteProductModalProps {
  productId: number | null;
  productName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function DeleteProductModal({
  productId,
  productName,
  isOpen,
  onClose,
  onSuccess,
}: DeleteProductModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isDeleting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen || !productId) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    setErrorMessage("");

    try {
      const res = await deleteProductAction(productId);

      if (res.success) {
        onClose();
        if (onSuccess) onSuccess();
      } else {
        setErrorMessage(res.message || "No se pudo eliminar el producto.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Error al conectar con el servidor.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-gray-100 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 rounded-full transition-colors"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <h3 id="delete-modal-title" className="font-serif text-lg font-bold text-gray-900">
              ¿Eliminar este producto?
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Estás a punto de eliminar{" "}
              <strong className="text-gray-800 font-semibold">"{productName}"</strong> (ID: #{productId})
              del catálogo de Dulce Cosmetics. Esta acción no se puede deshacer.
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
            {errorMessage}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold uppercase tracking-wider rounded-lg shadow transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDeleting ? "Eliminando..." : "Confirmar Eliminación"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
