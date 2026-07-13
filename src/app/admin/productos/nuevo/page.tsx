import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { ProductForm } from "@/components/admin/product-form";
import { requireAdminUser } from "@/lib/admin";

export default async function NewProductPage() {
  await requireAdminUser();
  return <main className="admin-editor"><Link href="/admin" className="back-link"><ArrowLeft /> Volver a productos</Link><span className="eyebrow">Catálogo</span><h1>Nuevo producto</h1><p>Completa la información que se mostrará en la tienda.</p><ProductForm /></main>;
}
