import { CheckoutForm } from "@/components/checkout-form";
import { getStoreSettings } from "@/lib/store-settings";

export default async function CheckoutPage() { return <main className="checkout-page section-shell"><CheckoutForm settings={await getStoreSettings()} /></main>; }
