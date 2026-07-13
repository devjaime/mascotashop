import { cache } from "react";
import { products as fallbackProducts, type Product } from "@/data/products";
import { isSupabaseConfigured } from "./supabase/config";
import { createClient } from "./supabase/server";

type ProductRow = {
  slug: string;
  name: string;
  price: number;
  stock: number;
  category: Product["category"];
  description: string;
  images: string[];
  featured: boolean;
};

const fromRow = (row: ProductRow): Product => ({
  id: row.slug,
  name: row.name,
  price: row.price,
  stock: row.stock,
  category: row.category,
  description: row.description,
  images: row.images.length ? row.images : ["/products/mochilas-capsula/1.jpg"],
  featured: row.featured,
});

export const getProducts = cache(async (): Promise<Product[]> => {
  if (!isSupabaseConfigured()) return fallbackProducts;
  const supabase = await createClient();
  const { data, error } = await supabase.from("products").select("slug,name,price,stock,category,description,images,featured").eq("active", true).order("created_at");
  if (error) throw new Error(`No se pudo cargar el catálogo: ${error.message}`);
  return (data as ProductRow[]).map(fromRow);
});

export const getProductBySlug = cache(async (slug: string): Promise<Product | undefined> => {
  if (!isSupabaseConfigured()) return fallbackProducts.find((item) => item.id === slug);
  const supabase = await createClient();
  const { data, error } = await supabase.from("products").select("slug,name,price,stock,category,description,images,featured").eq("slug", slug).eq("active", true).maybeSingle();
  if (error) throw new Error(`No se pudo cargar el producto: ${error.message}`);
  return data ? fromRow(data as ProductRow) : undefined;
});
