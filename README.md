# MascotasShop

Ecommerce de accesorios para mascotas construido con Next.js, TypeScript y Checkout Pro de Mercado Pago Chile. Incluye catálogo real importado desde el inventario entregado, carrito persistente, pedido por WhatsApp y enlaces a Instagram.

## Funcionalidades

- 35 productos con fotografías, precio, stock, categoría y página individual.
- Filtro por categoría y búsqueda por nombre.
- Carrito persistente en `localStorage`, con límite por stock.
- Pedido por WhatsApp con resumen y total precargados.
- Mercado Pago Checkout Pro en CLP mediante una ruta segura del servidor.
- Retornos para pagos aprobados, pendientes y fallidos.
- Diseño responsive y optimización de imágenes de Next.js.
- Panel privado `/admin` para crear, editar, dar de baja y reactivar productos.
- Actualización rápida de stock e imágenes almacenadas en Supabase Storage.

## Desarrollo local

Requiere Node.js 20 o superior y pnpm.

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Configuración

Completa estas variables en `.env.local` y en Vercel (Project Settings → Environment Variables):

| Variable | Uso |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Dominio público del sitio, por ejemplo `https://mascotashop.vercel.app` |
| `NEXT_PUBLIC_INSTAGRAM_USERNAME` | Usuario de Instagram, sin `@` |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Número con código de país, sólo dígitos, por ejemplo `56912345678` |
| `MERCADOPAGO_ACCESS_TOKEN` | Access Token privado de la aplicación de Mercado Pago |
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública `anon` del proyecto Supabase |

El `MERCADOPAGO_ACCESS_TOKEN` nunca debe usar el prefijo `NEXT_PUBLIC_` ni subirse al repositorio.

## Activar el catálogo administrable

1. Crea un proyecto en Supabase y copia sus variables públicas al entorno.
2. Vincula el proyecto y aplica la migración:

```bash
npx supabase login
npx supabase link --project-ref TU_PROJECT_REF
npx supabase db push
```

3. En Supabase Authentication crea el usuario administrador con correo y contraseña.
4. Copia su UUID y regístralo como administrador desde el SQL Editor:

```sql
insert into public.admin_users (user_id)
values ('UUID_DEL_USUARIO');
```

5. Ingresa en `/admin`. Si la tabla está vacía, usa **Importar catálogo inicial** para cargar los 35 productos entregados.

La migración activa Row Level Security: visitantes sólo pueden leer productos activos y únicamente los UUID registrados en `admin_users` pueden modificar catálogo o imágenes. Dar de baja es reversible y conserva la información del producto.

## Mercado Pago Chile

1. Crea una aplicación en **Mercado Pago → Tus integraciones**.
2. Copia primero el Access Token de prueba a `MERCADOPAGO_ACCESS_TOKEN`.
3. Ejecuta una compra de prueba con las cuentas de prueba de Mercado Pago.
4. En **Webhooks**, configura el evento de pagos para la futura URL `https://TU-DOMINIO/api/mercadopago/webhook` cuando se incorpore persistencia de órdenes.
5. Tras validar el flujo, reemplaza la credencial de prueba por la productiva en el ambiente Production de Vercel.

La API del checkout recibe sólo IDs y cantidades. Los nombres, precios y stock se vuelven a resolver en el servidor antes de crear cada preferencia, evitando confiar en valores manipulables desde el navegador.

## Despliegue en Vercel

1. Importa `devjaime/mascotashop` en Vercel.
2. Agrega las cuatro variables anteriores para Preview y Production.
3. Despliega y actualiza `NEXT_PUBLIC_SITE_URL` con el dominio definitivo.
4. Prueba Instagram, WhatsApp y una compra completa en Mercado Pago antes de activar credenciales productivas.

## Verificación

```bash
pnpm lint
pnpm test
pnpm build
```

## Actualizar el catálogo

Los datos están en `src/data/products.ts` y las fotografías en `public/products/<id>/`. El archivo Excel entregado se conserva como fuente externa y no se publica porque contiene el costo neto de los productos.
