import type { Product } from "@/data/products";
import { createProduct, updateProduct } from "@/app/admin/actions";

type AdminProduct = Product & { databaseId?: string; active?: boolean };

export function ProductForm({ product }: { product?: AdminProduct }) {
  const action = product ? updateProduct : createProduct;
  return <form action={action} className="product-form">
    {product?.databaseId ? <input type="hidden" name="id" value={product.databaseId} /> : null}
    <input type="hidden" name="currentImages" value={JSON.stringify(product?.images ?? [])} />
    <div className="form-grid">
      <label>Nombre del producto<input name="name" defaultValue={product?.name} minLength={2} maxLength={120} required /></label>
      <label>Identificador URL<input name="slug" defaultValue={product?.id} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="se-genera-del-nombre" /></label>
      <label>Categoría<select name="category" defaultValue={product?.category ?? "Perros"}><option>Perros</option><option>Gatos</option><option>Pequeñas mascotas</option><option>Higiene</option></select></label>
      <label>Precio de venta (CLP)<input name="price" type="number" min="1" step="1" defaultValue={product?.price} required /></label>
      <label>Stock disponible<input name="stock" type="number" min="0" step="1" defaultValue={product?.stock ?? 0} required /></label>
      <label>Imágenes nuevas<input name="images" type="file" accept="image/jpeg,image/png,image/webp" multiple /></label>
      <label className="full-field">Descripción<textarea name="description" maxLength={1000} rows={5} defaultValue={product?.description} /></label>
    </div>
    <div className="form-checks"><label><input name="active" type="checkbox" defaultChecked={product?.active ?? true} /> Producto visible</label><label><input name="featured" type="checkbox" defaultChecked={product?.featured} /> Producto destacado</label></div>
    {product?.images.length ? <p className="image-help">Tiene {product.images.length} imagen(es). Las nuevas se agregarán a las existentes.</p> : null}
    <div className="form-actions"><a href="/admin">Cancelar</a><button type="submit">{product ? "Guardar cambios" : "Crear producto"}</button></div>
  </form>;
}
