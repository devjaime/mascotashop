"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getProduct } from "@/data/products";

type CartItem = { productId: string; quantity: number };
type CartContextValue = {
  items: CartItem[];
  count: number;
  total: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addItem: (productId: string) => void;
  updateItem: (productId: string, quantity: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "mascotasshop-cart-v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let storedItems: CartItem[] = [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) storedItems = JSON.parse(stored);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
    const frame = requestAnimationFrame(() => {
      setItems(storedItems);
      setReady(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  const addItem = useCallback((productId: string) => {
    setItems((current) => {
      const existing = current.find((item) => item.productId === productId);
      const product = getProduct(productId);
      if (!product || product.stock < 1) return current;
      if (existing) return current.map((item) => item.productId === productId
        ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) }
        : item);
      return [...current, { productId, quantity: 1 }];
    });
    setIsOpen(true);
  }, []);

  const updateItem = useCallback((productId: string, quantity: number) => {
    const product = getProduct(productId);
    setItems((current) => quantity <= 0
      ? current.filter((item) => item.productId !== productId)
      : current.map((item) => item.productId === productId
        ? { ...item, quantity: Math.min(quantity, product?.stock ?? quantity) }
        : item));
  }, []);

  const value = useMemo(() => ({
    items,
    count: items.reduce((sum, item) => sum + item.quantity, 0),
    total: items.reduce((sum, item) => sum + (getProduct(item.productId)?.price ?? 0) * item.quantity, 0),
    isOpen,
    setIsOpen,
    addItem,
    updateItem,
    clear: () => setItems([]),
  }), [items, isOpen, addItem, updateItem]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart debe usarse dentro de CartProvider");
  return context;
}
