'use client';

import { create } from 'zustand';
import { Product } from './api';

interface CartItem extends Product {
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  
  addToCart: (product: Product) => {
    const { items } = get();
    const existingItem = items.find((item: CartItem) => item.id === product.id);
    
    if (existingItem) {
      set({
        items: items.map((item: CartItem) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
      });
    } else {
      set({ items: [...items, { ...product, quantity: 1 }] });
    }
  },
  
  removeFromCart: (productId: number) => {
    set({
      items: get().items.filter((item: CartItem) => item.id !== productId),
    });
  },
  
  updateQuantity: (productId: number, quantity: number) => {
    if (quantity <= 0) {
      get().removeFromCart(productId);
      return;
    }
    
    set({
      items: get().items.map((item: CartItem) =>
        item.id === productId ? { ...item, quantity } : item
      ),
    });
  },
  
  clearCart: () => set({ items: [] }),
  
  getTotalItems: () => {
    return get().items.reduce((total: number, item: CartItem) => total + item.quantity, 0);
  },
  
  getTotalPrice: () => {
    return get().items.reduce((total: number, item: CartItem) => total + item.price * item.quantity, 0);
  },
}));
