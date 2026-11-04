"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: number;
  productName: string;
  variantId?: number | null;
  variantName?: string | null;
  precioUnitario: number;
  imagenUrl: string;
  cantidad: number;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, "cantidad">, cantidad?: number) => void;
  removeItem: (productId: number, variantId?: number | null) => void;
  updateQuantity: (productId: number, variantId: number | null | undefined, cantidad: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  getSubtotal: () => number;
  getItemCount: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item, cantidad = 1) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (i) =>
              i.productId === item.productId &&
              (i.variantId ?? null) === (item.variantId ?? null)
          );

          if (existingIndex > -1) {
            const newItems = [...state.items];
            newItems[existingIndex].cantidad += cantidad;
            return { items: newItems, isOpen: true };
          } else {
            return {
              items: [...state.items, { ...item, cantidad }],
              isOpen: true,
            };
          }
        });
      },

      removeItem: (productId, variantId = null) => {
        set((state) => ({
          items: state.items.filter(
            (i) =>
              !(
                i.productId === productId &&
                (i.variantId ?? null) === (variantId ?? null)
              )
          ),
        }));
      },

      updateQuantity: (productId, variantId = null, cantidad) => {
        if (cantidad <= 0) {
          get().removeItem(productId, variantId);
          return;
        }

        set((state) => ({
          items: state.items.map((i) => {
            if (
              i.productId === productId &&
              (i.variantId ?? null) === (variantId ?? null)
            ) {
              return { ...i, cantidad };
            }
            return i;
          }),
        }));
      },

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      getSubtotal: () => {
        return get().items.reduce(
          (acc, item) => acc + item.precioUnitario * item.cantidad,
          0
        );
      },

      getItemCount: () => {
        return get().items.reduce((acc, item) => acc + item.cantidad, 0);
      },
    }),
    {
      name: "dulce-cosmetics-cart",
      partialize: (state) => ({ items: state.items }),
    }
  )
);
