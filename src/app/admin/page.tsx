import Image from "next/image";
import Link from "next/link";
import { Archive, ArrowSquareOut, Package, PencilSimple, Plus, SignOut, Warning } from "@phosphor-icons/react/dist/ssr";
import { redirect } from "next/navigation";
import { formatPrice } from "@/lib/format";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { importInitialCatalog, logout, toggleProduct, updateStock } from "./actions";

export default async function AdminPage() {
  if (!isSupabaseConfigured()) return <main className="admin-shell"><div className="admin-setup"><Warning weight="fill" /><h1>Falta configurar Supabase</h1><p>Agrega las variables indicadas en <code>.env.example</code> y ejecuta la migración antes de usar el panel.</p></div></main>;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data: admin } = await supabase.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!admin) return <main className="admin-shell"><div className="admin-setup"><Warning weight="fill" /><h1>Acceso no autorizado</h1><p>El usuario {user.email} existe, pero no está registrado como administrador.</p><form action={logout}><button>Salir</button></form></div></main>;
  const { data: products, error } = await supabase.from("products").select("id,slug,name,price,stock,category,images,active,updated_at").order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  const activeCount = products.filter((item) => item.active).length;
  const lowStockCount = products.filter((item) => item.active && item.stock <= 2).length;

  return <main className="admin-shell">
    <aside className="admin-sidebar"><Link href="/admin" className="admin-brand">🐾 Mascotas<span>Shop</span></Link><nav><Link href="/admin" className="active"><Package /> Productos</Link><Link href="/" target="_blank"><ArrowSquareOut /> Ver tienda</Link></nav><form action={logout}><button><SignOut /> Cerrar sesión</button></form></aside>
    <section className="admin-content">
      <header><div><span className="eyebrow">Panel de gestión</span><h1>Productos</h1><p>Actualiza stock, publica novedades o retira productos de la tienda.</p></div><Link href="/admin/productos/nuevo" className="admin-primary"><Plus /> Nuevo producto</Link></header>
      <div className="admin-stats"><div><small>Productos activos</small><strong>{activeCount}</strong></div><div><small>Stock bajo o agotado</small><strong>{lowStockCount}</strong></div><div><small>Total registrados</small><strong>{products.length}</strong></div></div>
      {products.length === 0 ? <div className="admin-empty"><Package /><h2>Tu catálogo está vacío</h2><p>Importa los productos entregados originalmente o comienza uno nuevo.</p><form action={importInitialCatalog}><button>Importar catálogo inicial</button></form></div> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Producto</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Estado</th><th></th></tr></thead><tbody>{products.map((product) => <tr key={product.id} className={!product.active ? "inactive-row" : ""}><td><div className="admin-product-cell">{product.images[0] ? <Image src={product.images[0]} alt="" width={54} height={54} /> : <span className="image-placeholder">🐾</span>}<div><strong>{product.name}</strong><small>/{product.slug}</small></div></div></td><td>{product.category}</td><td>{formatPrice(product.price)}</td><td><form action={updateStock} className="stock-form"><input type="hidden" name="id" value={product.id} /><input name="stock" type="number" min="0" defaultValue={product.stock} aria-label={`Stock de ${product.name}`} /><button>Guardar</button></form></td><td><span className={product.active ? "status-active" : "status-inactive"}>{product.active ? "Activo" : "Dado de baja"}</span></td><td><div className="row-actions"><Link href={`/admin/productos/${product.id}`} aria-label={`Editar ${product.name}`}><PencilSimple /></Link><form action={toggleProduct}><input type="hidden" name="id" value={product.id} /><input type="hidden" name="active" value={String(!product.active)} /><button aria-label={product.active ? `Dar de baja ${product.name}` : `Reactivar ${product.name}`}><Archive /></button></form></div></td></tr>)}</tbody></table></div>}
    </section>
  </main>;
}
