import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart, InstagramLogo, ShieldCheck, Truck, WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import { Catalog } from "@/components/catalog";
import { getProducts } from "@/lib/products";
import { getStoreSettings } from "@/lib/store-settings";

export default async function Home() {
  const [products, settings] = await Promise.all([getProducts(), getStoreSettings()]);
  return <main>
    <section className="hero section-shell"><span className="hero-paw paw-one">🐾</span><span className="hero-paw paw-two">🐾</span>
      <div className="hero-copy"><span className="eyebrow">Todo para su mundo</span><h1>Más juego.<br/><em>Más cariño.</em></h1><p>Accesorios escogidos para acompañar sus paseos, sus siestas y cada pequeña aventura.</p><Link href="#catalogo" className="primary-link">Ver productos <ArrowRight /></Link>
        <div className="hero-proof"><span><Heart weight="fill" /> Selección con cariño</span><span><ShieldCheck weight="fill" /> Pago protegido</span></div>
      </div>
      <div className="hero-visual"><div className="hero-blob"/><Image src="/products/mochilas-capsula/1.jpg" alt="Mochila cápsula para transportar mascotas" fill priority loading="eager" sizes="(max-width: 800px) 100vw, 50vw" /><div className="floating-note"><span>🐾</span><div><strong>Productos útiles</strong><small>para días más felices</small></div></div></div>
    </section>
    <section className="benefits"><div><Truck /><span><strong>Despacho coordinado</strong><small>Te contactamos después de comprar</small></span></div><div><WhatsappLogo /><span><strong>Atención cercana</strong><small>Resolvemos tus dudas por WhatsApp</small></span></div><div><ShieldCheck /><span><strong>Compra protegida</strong><small>Pago seguro con Mercado Pago</small></span></div></section>
    <Catalog products={products} />
    <section id="nosotros" className="story section-shell"><div className="story-image"><Image src="/products/corrales/1.jpg" alt="Corral para pequeñas mascotas" fill sizes="(max-width: 800px) 100vw, 50vw" /></div><div className="story-copy"><span className="eyebrow">Nuestra tienda</span><h2>Elegimos como si fuera para los nuestros</h2><p>En MascotasShop creemos que los mejores momentos están en lo cotidiano: un paseo tranquilo, un juego nuevo y un rincón cómodo para descansar.</p><p>Por eso reunimos accesorios prácticos para perros, gatos y pequeñas mascotas, con atención directa y cercana.</p><a className="text-link" href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noreferrer">Conversemos por WhatsApp <ArrowRight /></a></div></section>
    <section className="instagram section-shell"><div><InstagramLogo /><span><small>Síguenos en Instagram</small><strong>@{settings.instagram}</strong></span></div><a href={`https://instagram.com/${settings.instagram}`} target="_blank" rel="noreferrer">Ver Instagram <ArrowRight /></a></section>
    <footer><div className="brand-footer">🐾 Mascotas<span>Shop</span></div><p>Accesorios para hacer más feliz su día.</p><div><Link href="#catalogo">Productos</Link><a href={`https://instagram.com/${settings.instagram}`}>Instagram</a><a href={`https://wa.me/${settings.whatsapp}`}>WhatsApp</a>{settings.contact_email?<a href={`mailto:${settings.contact_email}`}>Correo</a>:null}</div><small>© {new Date().getFullYear()} MascotasShop. Todos los derechos reservados.</small></footer>
  </main>;
}
