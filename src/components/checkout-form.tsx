"use client";

import { useState } from "react";
import Link from "next/link";
import { LockKey, Truck } from "@phosphor-icons/react";
import { formatPrice } from "@/lib/format";
import type { StoreSettings } from "@/lib/store-settings";
import { useCart } from "./cart-provider";

const regions = ["Arica y Parinacota","Tarapacá","Antofagasta","Atacama","Coquimbo","Valparaíso","Metropolitana","O’Higgins","Maule","Ñuble","Biobío","La Araucanía","Los Ríos","Los Lagos","Aysén","Magallanes"];
const calculateShipping = (settings: StoreSettings, subtotal: number) => settings.free_shipping_threshold && subtotal >= settings.free_shipping_threshold ? 0 : settings.shipping_mode === "flat_rate" ? settings.flat_shipping_rate : 0;

export function CheckoutForm({ settings }: { settings: StoreSettings }) {
  const { items, total } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const freight = calculateShipping(settings, total);
  async function submit(formData: FormData) {
    setLoading(true); setError("");
    const customer = Object.fromEntries(formData.entries());
    const response = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ customer, items: items.map(({ productId, quantity }) => ({ productId, quantity })) }) });
    const data = await response.json();
    if (!response.ok || !data.checkoutUrl) { setError(data.error ?? "No pudimos iniciar el pago"); setLoading(false); return; }
    window.location.href = data.checkoutUrl;
  }
  if (!items.length) return <div className="checkout-empty"><h1>Tu carrito está vacío</h1><Link href="/#catalogo">Volver a productos</Link></div>;
  return <form action={submit} className="checkout-grid">
    <section className="checkout-card"><span className="eyebrow">Datos de entrega</span><h1>Completa tu compra</h1><div className="checkout-fields">
      <label>Nombre completo<input name="name" required minLength={3} /></label><label>Correo<input name="email" type="email" required /></label>
      <label>Teléfono<input name="phone" inputMode="tel" required /></label><label>Región<select name="region" required defaultValue=""><option value="" disabled>Selecciona</option>{regions.map(r=><option key={r}>{r}</option>)}</select></label>
      <label>Comuna<input name="commune" required /></label><label>Dirección<input name="address" required /></label>
      <label className="full-field">Indicaciones<textarea name="notes" rows={3} maxLength={500} /></label>
    </div><div className="shipping-choice"><Truck weight="fill"/><div><strong>{settings.shipping_notice}</strong><small>{settings.shipping_mode === "coordinate" ? "El valor se coordina después de la compra" : freight ? `Tarifa: ${formatPrice(freight)}` : "Envío gratis"}</small></div></div></section>
    <aside className="order-summary"><h2>Resumen</h2>{items.map(i=><div className="summary-item" key={i.productId}><span>{i.quantity}× {i.name}</span><strong>{formatPrice(i.price*i.quantity)}</strong></div>)}<div className="summary-line"><span>Productos</span><strong>{formatPrice(total)}</strong></div><div className="summary-line"><span>Envío</span><strong>{settings.shipping_mode === "coordinate" ? "Por coordinar" : formatPrice(freight)}</strong></div><div className="summary-total"><span>Total a pagar ahora</span><strong>{formatPrice(total+freight)}</strong></div>{error?<p className="checkout-error">{error}</p>:null}<button disabled={loading}><LockKey/>{loading?"Conectando…":"Pagar con Mercado Pago"}</button><small>Pago procesado de forma segura por Mercado Pago.</small></aside>
  </form>;
}
