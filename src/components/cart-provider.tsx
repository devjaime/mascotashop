"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { products as initialProducts, type Product } from "@/data/products";

export type CartItem = { productId: string; quantity: number; name: string; price: number; stock: number; image: string };
type CartContextValue = {
  items: CartItem[];
  count: number;
  total: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addItem: (product: Product) => void;
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
      if (stored) {
        const parsed = JSON.parse(stored) as Array<Partial<CartItem> & { productId: string; quantity: number }>;
        storedItems = parsed.flatMap((item) => {
          if (item.name && typeof item.price === "number" && typeof item.stock === "number" && item.image) return [item as CartItem];
          const legacyProduct = initialProducts.find((product) => product.id === item.productId);
          return legacyProduct ? [{ productId: legacyProduct.id, quantity: Math.min(item.quantity, legacyProduct.stock), name: legacyProduct.name, price: legacyProduct.price, stock: legacyProduct.stock, image: legacyProduct.images[0] }] : [];
        });
      }
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

  const addItem = useCallback((product: Product) => {
    setItems((current) => {
      const existing = current.find((item) => item.productId === product.id);
      if (product.stock < 1) return current;
      if (existing) return current.map((item) => item.productId === product.id
        ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) }
        : item);
      return [...current, { productId: product.id, quantity: 1, name: product.name, price: product.price, stock: product.stock, image: product.images[0] }];
    });
    setIsOpen(true);
  }, []);

  const updateItem = useCallback((productId: string, quantity: number) => {
    setItems((current) => quantity <= 0
      ? current.filter((item) => item.productId !== productId)
      : current.map((item) => item.productId === productId
        ? { ...item, quantity: Math.min(quantity, item.stock) }
        : item));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(() => ({
    items,
    count: items.reduce((sum, item) => sum + item.quantity, 0),
    total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    isOpen,
    setIsOpen,
    addItem,
    updateItem,
    clear,
  }), [items, isOpen, addItem, updateItem, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart debe usarse dentro de CartProvider");
  return context;
}
