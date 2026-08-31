import { cache } from "react";
import { createClient } from "./supabase/server";

export type StoreSettings = {
  contact_email: string; whatsapp: string; instagram: string; facebook: string; tiktok: string;
  shipping_mode: "coordinate" | "flat_rate" | "shipit"; flat_shipping_rate: number;
  free_shipping_threshold: number | null; pickup_enabled: boolean; pickup_instructions: string; shipping_notice: string;
};

const fallback: StoreSettings = { contact_email: "", whatsapp: "56912345678", instagram: "tu_usuario", facebook: "", tiktok: "", shipping_mode: "coordinate", flat_shipping_rate: 0, free_shipping_threshold: null, pickup_enabled: false, pickup_instructions: "", shipping_notice: "Despachos a todo Chile" };

export const getStoreSettings = cache(async (): Promise<StoreSettings> => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return fallback;
  const supabase = await createClient();
  const { data, error } = await supabase.from("store_settings").select("contact_email,whatsapp,instagram,facebook,tiktok,shipping_mode,flat_shipping_rate,free_shipping_threshold,pickup_enabled,pickup_instructions,shipping_notice").eq("id", true).maybeSingle();
  if (error || !data) return fallback;
  return { ...fallback, ...data, whatsapp: data.whatsapp || fallback.whatsapp, instagram: data.instagram || fallback.instagram } as StoreSettings;
});

export function shippingCost(settings: StoreSettings, subtotal: number) {
  if (settings.free_shipping_threshold && subtotal >= settings.free_shipping_threshold) return 0;
  return settings.shipping_mode === "flat_rate" ? settings.flat_shipping_rate : 0;
}
