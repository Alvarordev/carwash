import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { Order } from "@/lib/types/order";
import OrderDetailLayout from "@/components/ordenes/OrderDetailLayout";

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await params;
  return { title: `Orden ${p.id}` };
}

export default async function OrderPage({ params }: Props) {
  const p = await params;
  const res = await fetch(`http://localhost:3001/orders/${p.id}`);
  if (!res.ok) return notFound();
  const order: Order = await res.json();

  return <OrderDetailLayout order={order} />;
}
