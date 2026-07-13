"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { products as initialProducts, type Category } from "@/data/products";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

const categories: Category[] = ["Perros", "Gatos", "Pequeñas mascotas", "Higiene"];

const slugify = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

async function requireAdmin() {
  if (!isSupabaseConfigured()) throw new Error("Supabase no está configurado.");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data: admin } = await supabase.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!admin) throw new Error("Tu usuario no tiene permisos de administrador.");
  return supabase;
}

async function uploadImages(supabase: Awaited<ReturnType<typeof createClient>>, files: File[]) {
  const urls: string[] = [];
  for (const file of files) {
    if (!file.size) continue;
    if (file.size > 5 * 1024 * 1024) throw new Error("Cada imagen debe pesar menos de 5 MB.");
    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) throw new Error("Formato de imagen no permitido.");
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `${new Date().getFullYear()}/${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file, { contentType: file.type, upsert: false });
    if (error) throw new Error(`No se pudo subir ${file.name}: ${error.message}`);
    urls.push(supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl);
  }
  return urls;
}

const parseProduct = (formData: FormData) => {
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "") as Category;
  const price = Number(formData.get("price"));
  const stock = Number(formData.get("stock"));
  const description = String(formData.get("description") ?? "").trim();
  if (name.length < 2 || !categories.includes(category) || !Number.isInteger(price) || price <= 0 || !Number.isInteger(stock) || stock < 0) throw new Error("Revisa nombre, categoría, precio y stock.");
  return { name, slug: slugify(String(formData.get("slug") || name)), category, price, stock, description, featured: formData.get("featured") === "on", active: formData.get("active") === "on" };
};

export async function login(formData: FormData) {
  if (!isSupabaseConfigured()) redirect("/admin/login?error=config");
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: String(formData.get("email")), password: String(formData.get("password")) });
  if (error) redirect("/admin/login?error=credentials");
  redirect("/admin");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function createProduct(formData: FormData) {
  const supabase = await requireAdmin();
  const values = parseProduct(formData);
  const images = await uploadImages(supabase, formData.getAll("images").filter((value): value is File => value instanceof File));
  const { error } = await supabase.from("products").insert({ ...values, images });
  if (error) throw new Error(`No se pudo crear el producto: ${error.message}`);
  revalidatePath("/", "layout");
  redirect("/admin");
}

export async function updateProduct(formData: FormData) {
  const supabase = await requireAdmin();
  const id = String(formData.get("id"));
  const values = parseProduct(formData);
  const currentImages = JSON.parse(String(formData.get("currentImages") || "[]")) as string[];
  const newImages = await uploadImages(supabase, formData.getAll("images").filter((value): value is File => value instanceof File));
  const { error } = await supabase.from("products").update({ ...values, images: [...currentImages, ...newImages] }).eq("id", id);
  if (error) throw new Error(`No se pudo actualizar el producto: ${error.message}`);
  revalidatePath("/", "layout");
  redirect("/admin");
}

export async function updateStock(formData: FormData) {
  const supabase = await requireAdmin();
  const stock = Number(formData.get("stock"));
  if (!Number.isInteger(stock) || stock < 0) throw new Error("Stock inválido.");
  const { error } = await supabase.from("products").update({ stock }).eq("id", String(formData.get("id")));
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
  revalidatePath("/admin");
}

export async function toggleProduct(formData: FormData) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("products").update({ active: formData.get("active") === "true" }).eq("id", String(formData.get("id")));
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
  revalidatePath("/admin");
}

export async function importInitialCatalog() {
  const supabase = await requireAdmin();
  const rows = initialProducts.map((product) => ({ slug: product.id, name: product.name, description: product.description, category: product.category, price: product.price, stock: product.stock, images: product.images, featured: product.featured ?? false, active: true }));
  const { error } = await supabase.from("products").upsert(rows, { onConflict: "slug", ignoreDuplicates: true });
  if (error) throw new Error(`No se pudo importar el catálogo: ${error.message}`);
  revalidatePath("/", "layout");
  revalidatePath("/admin");
}
