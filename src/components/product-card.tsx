import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/data/products";
import { formatPrice } from "@/lib/format";
import { AddToCart } from "./add-to-cart";

export function ProductCard({ product }: { product: Product }) {
  return <article className="product-card">
    <Link href={`/productos/${product.id}`} className="product-image">
      <Image src={product.images[0]} alt={product.name} fill sizes="(max-width: 700px) 50vw, (max-width: 1100px) 33vw, 25vw" />
      {product.stock === 0 ? <span className="stock-badge">Agotado</span> : product.stock <= 2 ? <span className="stock-badge low">Últimas unidades</span> : null}
    </Link>
    <div className="product-info">
      <p>{product.category}</p>
      <Link href={`/productos/${product.id}`}><h3>{product.name}</h3></Link>
      <div className="product-bottom">
        <strong>{formatPrice(product.price)}</strong>
        <AddToCart product={product} disabled={product.stock === 0} />
      </div>
    </div>
  </article>;
}
