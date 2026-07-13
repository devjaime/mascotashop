export const siteConfig = {
  name: "MascotasShop",
  description: "Accesorios elegidos con cariño para perros, gatos y pequeñas mascotas.",
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_USERNAME ?? "tu_usuario",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "56912345678",
};

export const instagramUrl = `https://instagram.com/${siteConfig.instagram}`;
export const whatsappUrl = `https://wa.me/${siteConfig.whatsapp}`;
