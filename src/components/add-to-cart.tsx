"use client";

import { ShoppingBag } from "@phosphor-icons/react";
import { useCart } from "./cart-provider";

export function AddToCart({ productId, disabled = false }: { productId: string; disabled?: boolean }) {
  const { addItem } = useCart();
  return <button className="add-button" disabled={disabled} onClick={() => addItem(productId)}>
    <ShoppingBag weight="bold" /> {disabled ? "Agotado" : "Agregar"}
  </button>;
}
