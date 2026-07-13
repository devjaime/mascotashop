"use client";

import { useMemo, useState } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { categories, products } from "@/data/products";
import { ProductCard } from "./product-card";

export function Catalog() {
  const [category, setCategory] = useState("Todos");
  const [query, setQuery] = useState("");
  const visible = useMemo(() => products.filter((product) =>
    (category === "Todos" || product.category === category) &&
    product.name.toLowerCase().includes(query.toLowerCase())
  ), [category, query]);

  return <section id="catalogo" className="catalog-section section-shell">
    <div className="section-heading">
      <div><span className="eyebrow">Para regalonearlos</span><h2>Encuentra su nuevo favorito</h2></div>
      <label className="search"><MagnifyingGlass /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar productos" /></label>
    </div>
    <div className="category-tabs" role="group" aria-label="Filtrar por categoría">
      {categories.map((item) => <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}
    </div>
    <div className="product-grid">
      {visible.map((item) => <ProductCard key={item.id} product={item} />)}
    </div>
    {visible.length === 0 ? <p className="empty-state">No encontramos productos con esa búsqueda.</p> : null}
  </section>;
}
