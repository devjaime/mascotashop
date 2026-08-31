"use client";

import Link from "next/link";
import { InstagramLogo, PawPrint, ShoppingBag } from "@phosphor-icons/react";
import { useCart } from "./cart-provider";
import type { StoreSettings } from "@/lib/store-settings";

export function Header({ settings }: { settings: StoreSettings }) {
  const { count, setIsOpen } = useCart();
  return <>
    <div className="announcement">{settings.shipping_notice} · Paga seguro con Mercado Pago</div>
    <header className="site-header">
      <Link href="/" className="brand" aria-label="MascotasShop, inicio">
        <span className="brand-mark"><PawPrint weight="fill" /></span>
        <span>Mascotas<span>Shop</span></span>
      </Link>
      <nav aria-label="Navegación principal">
        <Link href="/#catalogo">Productos</Link>
        <Link href="/#nosotros">Nosotros</Link>
        <a href={`https://instagram.com/${settings.instagram}`} target="_blank" rel="noreferrer" aria-label="Instagram"><InstagramLogo /></a>
        <button className="cart-trigger" onClick={() => setIsOpen(true)} aria-label={`Abrir carrito con ${count} productos`}>
          <ShoppingBag />
          {count > 0 ? <span>{count}</span> : null}
        </button>
      </nav>
    </header>
  </>;
}
