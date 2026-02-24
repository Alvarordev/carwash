import OrderDetail from "@/components/ordenes/OrderDetail";

// This will be navigated to on row click. Accepts route param 'id'.
export default function OrdenDetailPage({ params }: { params: { id: string } }) {
  // Will pass param to OrderDetail later for lookup
  return (
    <OrderDetail orderId={params.id} />
  );
}
