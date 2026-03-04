import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OrderDetailLayout from "@/components/ordenes/OrderDetailLayout";
import type { Order } from "@/lib/types/order";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: `Orden ${id}` };
}

export default async function OrderPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select(
      `id,
       order_number,
       customer_id,
       vehicle_id,
       subtotal,
       discounts,
       total,
       status,
       payment_status,
       payment_method,
       cancel_reason,
       notes,
       photos,
       created_at,
       updated_at,
       customers ( first_name, last_name ),
       vehicles ( id, plate, brand, model, color ),
       order_items ( id, service_id, service_name, unit_price, quantity, subtotal ),
       order_staff ( id, staff_id, staff_name, role_snapshot ),
       order_status_history ( id, status, changed_by, note, created_at ),
       order_attachments ( id, url )`
    )
    .eq("id", id)
    .single();

  if (error || !data) return notFound();

  const raw = data as Record<string, unknown>;

  const customers = raw.customers as { first_name: string; last_name: string } | null;
  const vehicles = raw.vehicles as { id: string; plate: string; brand: string; model: string | null; color: string } | null;

  type RawItem = { id: string; service_id: string | null; service_name: string; unit_price: number; quantity: number; subtotal: number };
  type RawStaff = { id: string; staff_id: string | null; staff_name: string; role_snapshot: string | null };
  type RawHistory = { id: string; status: string; changed_by: string | null; note: string | null; created_at: string };
  type RawAttach = { id: string; url: string };

  const order: Order = {
    id: raw.id as string,
    orderNumber: raw.order_number as string,
    customer: customers && raw.customer_id
      ? { id: raw.customer_id as string, firstName: customers.first_name, lastName: customers.last_name }
      : undefined,
    vehicle: vehicles
      ? { id: vehicles.id, plate: vehicles.plate, brand: vehicles.brand, model: vehicles.model, color: vehicles.color }
      : undefined,
    subtotal: raw.subtotal as number,
    discounts: (raw.discounts as number) ?? 0,
    total: raw.total as number,
    status: raw.status as Order["status"],
    paymentStatus: (raw.payment_status as Order["paymentStatus"]) ?? undefined,
    paymentMethod: (raw.payment_method as string) ?? undefined,
    cancelReason: (raw.cancel_reason as string) ?? null,
    notes: (raw.notes as string) ?? undefined,
    photos: raw.photos as string[] ?? [],
    registeredAt: raw.created_at as string,
    updatedAt: (raw.updated_at as string) ?? undefined,
    items: ((raw.order_items ?? []) as RawItem[]).map((i) => ({
      serviceId: i.service_id ?? i.id,
      name: i.service_name,
      price: i.unit_price,
      quantity: i.quantity,
      subtotal: i.subtotal,
    })),
    staff: ((raw.order_staff ?? []) as RawStaff[]).map((s) => ({
      staffId: s.staff_id ?? s.id,
      name: s.staff_name,
      role: s.role_snapshot ?? undefined,
    })),
    statusHistory: ((raw.order_status_history ?? []) as RawHistory[])
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
      .map((h) => ({
        status: h.status as Order["status"],
        at: h.created_at,
        by: h.changed_by ?? undefined,
        note: h.note ?? undefined,
      })),
    attachments: ((raw.order_attachments ?? []) as RawAttach[]).map((a) => a.url),
  };

  return <OrderDetailLayout order={order} />;
}
