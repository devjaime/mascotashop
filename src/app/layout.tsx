import type { Metadata } from "next";
import { Nunito_Sans, Playfair_Display } from "next/font/google";
import { CartProvider } from "@/components/cart-provider";
import { CartDrawer } from "@/components/cart-drawer";
import { Header } from "@/components/header";
import { siteConfig } from "@/lib/site";
import { getStoreSettings } from "@/lib/store-settings";
import "./globals.css";

const nunito = Nunito_Sans({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: { default: "MascotasShop | Accesorios para mascotas", template: "%s | MascotasShop" },
  description: siteConfig.description,
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const settings = await getStoreSettings();
  return <html lang="es"><body className={`${nunito.variable} ${playfair.variable}`}>
    <CartProvider><Header settings={settings} />{children}<CartDrawer whatsapp={settings.whatsapp} /></CartProvider>
  </body></html>;
}
