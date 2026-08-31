"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { products as initialProducts, type Category } from "@/data/products";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createAdminClient } from "@/lib/supabase/admin";
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

export async function updateStoreSettings(formData: FormData) {
  const supabase = await requireAdmin();
  const rate = Number(formData.get("flat_shipping_rate") || 0);
  const thresholdValue = String(formData.get("free_shipping_threshold") || "");
  const mode = String(formData.get("shipping_mode"));
  if (!["coordinate", "flat_rate", "shipit"].includes(mode) || !Number.isInteger(rate) || rate < 0) throw new Error("Configuración de envío inválida.");
  const { error } = await supabase.from("store_settings").update({ contact_email:String(formData.get("contact_email")||"").trim(), whatsapp:String(formData.get("whatsapp")||"").replace(/\D/g,""), instagram:String(formData.get("instagram")||"").replace(/^@/,""), facebook:String(formData.get("facebook")||"").trim(), tiktok:String(formData.get("tiktok")||"").replace(/^@/,""), shipping_mode:mode, flat_shipping_rate:rate, free_shipping_threshold:thresholdValue?Number(thresholdValue):null, pickup_enabled:formData.get("pickup_enabled")==="on", pickup_instructions:String(formData.get("pickup_instructions")||"").trim(), shipping_notice:String(formData.get("shipping_notice")||"").trim() }).eq("id",true);
  if(error) throw new Error(error.message); revalidatePath("/","layout"); revalidatePath("/admin/configuracion");
}

export async function updateOrder(formData: FormData) {
  const supabase = await requireAdmin(); const id=String(formData.get("id")); const status=String(formData.get("status"));
  const allowed=["paid","preparing","shipped","delivered","cancelled"]; if(!allowed.includes(status)) throw new Error("Estado inválido.");
  const fulfillment_status=status==="paid"?"unfulfilled":status==="cancelled"?"cancelled":status;
  const {error}=await supabase.from("orders").update({status,fulfillment_status,tracking_code:String(formData.get("tracking_code")||"").trim(),tracking_url:String(formData.get("tracking_url")||"").trim()}).eq("id",id);
  if(error) throw new Error(error.message); revalidatePath("/admin/pedidos");
}

function parseAdminPassword(value: string) {
  if (value.length < 8) throw new Error("La contraseña debe tener al menos 8 caracteres.");
  return value;
}

async function requireAdminService() {
  const supabase = await requireAdmin();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  return { user, admin: createAdminClient() };
}

export async function createAdminUser(formData: FormData) {
  const { admin } = await requireAdminService();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = parseAdminPassword(String(formData.get("password") ?? ""));
  if (!email.includes("@")) throw new Error("Correo inválido.");
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (error || !data.user) throw new Error(error?.message ?? "No se pudo crear el usuario.");
  const { error: roleError } = await admin.from("admin_users").insert({ user_id: data.user.id });
  if (roleError) throw new Error(roleError.message);
  revalidatePath("/admin/usuarios");
}

export async function updateAdminPassword(formData: FormData) {
  const { admin } = await requireAdminService();
  const id = String(formData.get("id") ?? "");
  const password = parseAdminPassword(String(formData.get("password") ?? ""));
  const { error } = await admin.auth.admin.updateUserById(id, { password });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/usuarios");
}

export async function deleteAdminUser(formData: FormData) {
  const { user, admin } = await requireAdminService();
  const id = String(formData.get("id") ?? "");
  if (id === user.id) throw new Error("No puedes eliminar tu propio usuario.");
  const { count } = await admin.from("admin_users").select("user_id", { count: "exact", head: true });
  if ((count ?? 0) <= 1) throw new Error("Debe quedar al menos un administrador.");
  const { error: roleError } = await admin.from("admin_users").delete().eq("user_id", id);
  if (roleError) throw new Error(roleError.message);
  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/usuarios");
}
