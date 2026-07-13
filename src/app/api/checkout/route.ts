import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { z } from "zod";
import { getProduct } from "@/data/products";

export const runtime = "nodejs";

const checkoutSchema = z.object({
  items: z.array(z.object({
    productId: z.string().min(1),
    quantity: z.number().int().min(1).max(20),
  })).min(1).max(30),
});

const getSiteUrl = (request: Request) => {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return new URL(request.url).origin;
};

export async function POST(request: Request) {
  try {
    const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!token) return NextResponse.json({ error: "Mercado Pago aún no está configurado. Puedes completar el pedido por WhatsApp." }, { status: 503 });

    const parsed = checkoutSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "El carrito no es válido." }, { status: 400 });

    const items = parsed.data.items.map(({ productId, quantity }) => {
      const product = getProduct(productId);
      if (!product || product.stock < quantity) throw new Error("Uno de los productos ya no tiene stock suficiente.");
      return {
        id: product.id,
        title: product.name,
        description: product.description,
        quantity,
        currency_id: "CLP",
        unit_price: product.price,
      };
    });

    const siteUrl = getSiteUrl(request);
    const client = new MercadoPagoConfig({ accessToken: token, options: { timeout: 8000 } });
    const preference = await new Preference(client).create({
      body: {
        items,
        back_urls: {
          success: `${siteUrl}/pago/exitoso`,
          failure: `${siteUrl}/pago/fallido`,
          pending: `${siteUrl}/pago/pendiente`,
        },
        auto_return: "approved",
        external_reference: crypto.randomUUID(),
        statement_descriptor: "MASCOTASSHOP",
      },
    });

    if (!preference.init_point) throw new Error("Mercado Pago no devolvió una URL de pago.");
    return NextResponse.json({ checkoutUrl: preference.init_point });
  } catch (error) {
    console.error("checkout_error", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "No pudimos iniciar el pago." }, { status: 500 });
  }
}
