"use client";

import Image from "next/image";
import { useState } from "react";
import { Minus, Plus, Trash, WhatsappLogo, X } from "@phosphor-icons/react";
import { formatPrice } from "@/lib/format";
import { siteConfig } from "@/lib/site";
import { useCart } from "./cart-provider";

export function CartDrawer() {
  const { items, total, isOpen, setIsOpen, updateItem } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const orderMessage = [
    "¡Hola MascotasShop! 🐾 Quiero hacer este pedido:",
    "",
    ...items.map((item) => `• ${item.quantity}x ${item.name} — ${formatPrice(item.price * item.quantity)}`),
    "",
    `Total productos: ${formatPrice(total)}`,
    "¿Me ayudan a coordinar el despacho?",
  ].join("\n");

  const pay = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: items.map(({ productId, quantity }) => ({ productId, quantity })) }),
      });
      const data = await response.json();
      if (!response.ok || !data.checkoutUrl) throw new Error(data.error ?? "No pudimos iniciar el pago");
      window.location.href = data.checkoutUrl;
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Ocurrió un error inesperado");
      setLoading(false);
    }
  };

  return <>
    <button className={`drawer-overlay ${isOpen ? "visible" : ""}`} aria-label="Cerrar carrito" onClick={() => setIsOpen(false)} />
    <aside className={`cart-drawer ${isOpen ? "open" : ""}`} aria-hidden={!isOpen}>
      <div className="drawer-header"><div><span>Tu selección</span><h2>Carrito</h2></div><button onClick={() => setIsOpen(false)} aria-label="Cerrar"><X /></button></div>
      <div className="drawer-items">
        {items.length === 0 ? <div className="cart-empty"><span>🐾</span><h3>Tu carrito está esperando</h3><p>Agrega productos y vuelve cuando quieras.</p></div> : items.map((item) => <div className="cart-item" key={item.productId}>
          <Image src={item.image} alt="" width={82} height={82} />
          <div><h3>{item.name}</h3><strong>{formatPrice(item.price)}</strong><div className="quantity-control">
            <button onClick={() => updateItem(item.productId, item.quantity - 1)} aria-label="Quitar uno">{item.quantity === 1 ? <Trash /> : <Minus />}</button>
            <span>{item.quantity}</span><button onClick={() => updateItem(item.productId, item.quantity + 1)} aria-label="Agregar uno" disabled={item.quantity >= item.stock}><Plus /></button>
          </div></div>
        </div>)}
      </div>
      {items.length > 0 ? <div className="drawer-footer">
        <div className="cart-total"><span>Total productos</span><strong>{formatPrice(total)}</strong></div>
        <p>El despacho se coordina después de tu compra.</p>
        {error ? <div className="checkout-error">{error}</div> : null}
        <button className="mercadopago-button" disabled={loading} onClick={pay}>{loading ? "Conectando…" : "Pagar con Mercado Pago"}</button>
        <a className="whatsapp-button" href={`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(orderMessage)}`} target="_blank" rel="noreferrer"><WhatsappLogo weight="fill" /> Pedir por WhatsApp</a>
      </div> : null}
    </aside>
  </>;
}
