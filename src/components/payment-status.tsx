"use client";

import Link from "next/link";
import { useEffect } from "react";
import { CheckCircle, Clock, XCircle } from "@phosphor-icons/react";
import { useCart } from "./cart-provider";

const content = {
  exitoso: { icon: CheckCircle, title: "¡Pago recibido!", text: "Gracias por tu compra. Te contactaremos para coordinar el despacho.", className: "success" },
  pendiente: { icon: Clock, title: "Tu pago está pendiente", text: "Mercado Pago está procesando la operación. Te avisará cuando cambie su estado.", className: "pending" },
  fallido: { icon: XCircle, title: "No pudimos completar el pago", text: "Puedes volver al carrito e intentarlo nuevamente o pedir ayuda por WhatsApp.", className: "failure" },
};

export function PaymentStatus({ status }: { status: keyof typeof content }) {
  const { clear } = useCart();
  const item = content[status];
  useEffect(() => { if (status === "exitoso") clear(); }, [status, clear]);
  return <main className="status-page"><div className={`status-card ${item.className}`}><item.icon weight="fill" /><span className="eyebrow">Estado del pago</span><h1>{item.title}</h1><p>{item.text}</p><Link href="/">Volver a la tienda</Link></div></main>;
}
