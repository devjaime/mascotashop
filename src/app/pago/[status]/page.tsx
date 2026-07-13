import { notFound } from "next/navigation";
import { PaymentStatus } from "@/components/payment-status";

const statuses = ["exitoso", "pendiente", "fallido"] as const;
export const generateStaticParams = () => statuses.map((status) => ({ status }));

export default async function StatusPage({ params }: { params: Promise<{ status: string }> }) {
  const { status } = await params;
  if (!statuses.includes(status as (typeof statuses)[number])) notFound();
  return <PaymentStatus status={status as (typeof statuses)[number]} />;
}
