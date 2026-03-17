import { create } from "zustand";
import type { CartItem, Product, ProductVariant } from "./types";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (product: Product, variant: ProductVariant, quantity?: number) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalCents: () => number;
}

const loadCart = (): CartItem[] => {
  try {
    const raw = localStorage.getItem("cart");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveCart = (items: CartItem[]) => {
  localStorage.setItem("cart", JSON.stringify(items));
};

export const useCartStore = create<CartState>((set, get) => ({
  items: loadCart(),
  isOpen: false,
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),
  addItem: (product, variant, quantity = 1) => {
    set((state) => {
      const existing = state.items.find((i) => i.variant._id === variant._id);
      let newItems: CartItem[];
      if (existing) {
        newItems = state.items.map((i) =>
          i.variant._id === variant._id ? { ...i, quantity: i.quantity + quantity } : i
        );
      } else {
        newItems = [...state.items, { product, variant, quantity }];
      }
      saveCart(newItems);
      return { items: newItems, isOpen: true };
    });
  },
  removeItem: (variantId) => {
    set((state) => {
      const newItems = state.items.filter((i) => i.variant._id !== variantId);
      saveCart(newItems);
      return { items: newItems };
    });
  },
  updateQuantity: (variantId, quantity) => {
    set((state) => {
      const newItems = quantity <= 0
        ? state.items.filter((i) => i.variant._id !== variantId)
        : state.items.map((i) => (i.variant._id === variantId ? { ...i, quantity } : i));
      saveCart(newItems);
      return { items: newItems };
    });
  },
  clearCart: () => {
    saveCart([]);
    set({ items: [] });
  },
  totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
  totalCents: () => get().items.reduce((sum, i) => sum + (i.variant.price ?? i.variant.price ?? 0) * i.quantity, 0),
}));
