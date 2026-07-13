import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import type { Product } from "@/data/products";
import { requireAdminUser } from "@/lib/admin";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { supabase } = await requireAdminUser();
  const { data } = await supabase.from("products").select("id,slug,name,description,category,price,stock,images,featured,active").eq("id", (await params).id).maybeSingle();
  if (!data) notFound();
  const product: Product & { databaseId: string; active: boolean } = { databaseId: data.id, id: data.slug, name: data.name, description: data.description, category: data.category, price: data.price, stock: data.stock, images: data.images, featured: data.featured, active: data.active };
  return <main className="admin-editor"><Link href="/admin" className="back-link"><ArrowLeft /> Volver a productos</Link><span className="eyebrow">Catálogo</span><h1>Editar producto</h1><p>Modifica los datos, stock, visibilidad o agrega imágenes.</p><ProductForm product={product} /></main>;
}
