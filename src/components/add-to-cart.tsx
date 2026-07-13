"use client";

import { ShoppingBag } from "@phosphor-icons/react";
import type { Product } from "@/data/products";
import { useCart } from "./cart-provider";

export function AddToCart({ product, disabled = false }: { product: Product; disabled?: boolean }) {
  const { addItem } = useCart();
  return <button className="add-button" disabled={disabled} onClick={() => addItem(product)}>
    <ShoppingBag weight="bold" /> {disabled ? "Agotado" : "Agregar"}
  </button>;
}
