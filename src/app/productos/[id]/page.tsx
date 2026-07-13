import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/add-to-cart";
import { products } from "@/data/products";
import { getProductBySlug } from "@/lib/products";
import { formatPrice } from "@/lib/format";
import { siteConfig } from "@/lib/site";

export const generateStaticParams = () => products.map(({ id }) => ({ id }));

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const product = await getProductBySlug((await params).id);
  return product ? { title: product.name, description: product.description } : {};
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const product = await getProductBySlug((await params).id);
  if (!product) notFound();
  const message = `¡Hola MascotasShop! Me interesa ${product.name} (${formatPrice(product.price)}). ¿Me cuentan más?`;
  return <main className="product-page section-shell">
    <Link href="/#catalogo" className="back-link"><ArrowLeft /> Volver al catálogo</Link>
    <div className="product-detail">
      <div className="detail-gallery">
        {product.images.map((image, index) => <div className={index === 0 ? "main-photo" : ""} key={image}><Image src={image} alt={`${product.name}${index ? `, vista ${index + 1}` : ""}`} fill sizes="(max-width: 800px) 100vw, 50vw" priority={index === 0} /></div>)}
      </div>
      <div className="detail-info"><span className="eyebrow">{product.category}</span><h1>{product.name}</h1><strong className="detail-price">{formatPrice(product.price)}</strong><p>{product.description}</p><span className={`availability ${product.stock > 0 ? "available" : ""}`}>{product.stock > 0 ? `${product.stock} unidades disponibles` : "Producto agotado"}</span><AddToCart product={product} disabled={product.stock === 0} /><a className="whatsapp-detail" href={`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(message)}`}><WhatsappLogo weight="fill" /> Consultar por WhatsApp</a><div className="safe-note"><ShieldCheck /><span><strong>Compra segura</strong><small>Paga a través de Mercado Pago o coordina directamente.</small></span></div></div>
    </div>
  </main>;
}
