"use client";

import Link from "next/link";
import { InstagramLogo, PawPrint, ShoppingBag } from "@phosphor-icons/react";
import { useCart } from "./cart-provider";
import { instagramUrl } from "@/lib/site";

export function Header() {
  const { count, setIsOpen } = useCart();
  return <>
    <div className="announcement">Despachos a coordinar · Paga seguro con Mercado Pago</div>
    <header className="site-header">
      <Link href="/" className="brand" aria-label="MascotasShop, inicio">
        <span className="brand-mark"><PawPrint weight="fill" /></span>
        <span>Mascotas<span>Shop</span></span>
      </Link>
      <nav aria-label="Navegación principal">
        <Link href="/#catalogo">Productos</Link>
        <Link href="/#nosotros">Nosotros</Link>
        <a href={instagramUrl} target="_blank" rel="noreferrer" aria-label="Instagram"><InstagramLogo /></a>
        <button className="cart-trigger" onClick={() => setIsOpen(true)} aria-label={`Abrir carrito con ${count} productos`}>
          <ShoppingBag />
          {count > 0 ? <span>{count}</span> : null}
        </button>
      </nav>
    </header>
  </>;
}
