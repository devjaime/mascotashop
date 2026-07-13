import type { Metadata } from "next";
import { Nunito_Sans, Playfair_Display } from "next/font/google";
import { CartProvider } from "@/components/cart-provider";
import { CartDrawer } from "@/components/cart-drawer";
import { Header } from "@/components/header";
import { siteConfig } from "@/lib/site";
import "./globals.css";

const nunito = Nunito_Sans({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: { default: "MascotasShop | Accesorios para mascotas", template: "%s | MascotasShop" },
  description: siteConfig.description,
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body className={`${nunito.variable} ${playfair.variable}`}>
    <CartProvider><Header />{children}<CartDrawer /></CartProvider>
  </body></html>;
}
