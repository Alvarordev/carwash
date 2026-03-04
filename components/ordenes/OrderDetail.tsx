import type { Order } from "@/lib/types/order";

async function fetchOrder(id: string) {
  const res = await fetch(`http://localhost:3001/orders/${id}`);
  if (!res.ok) throw new Error("Orden no encontrada");
  return (await res.json()) as Order;
}

export default async function OrderDetail({ orderId }: { orderId: string }) {
  const order = await fetchOrder(orderId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Orden {order.orderNumber}</h2>
          <p className="text-sm text-muted-foreground">{order.customer ? `${order.customer.firstName} ${order.customer.lastName}` : "—"} — {order.vehicle ? `${order.vehicle.plate} (${order.vehicle.brand}${order.vehicle.model ? " " + order.vehicle.model : ""})` : "—"}</p>
        </div>
        <div>
          <span className="text-xs text-muted-foreground">Total</span>
          <div className="text-xl font-bold">S/ {order.total.toFixed(2)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card p-4 rounded-sm">
          <h3 className="font-medium mb-2">Servicios</h3>
          <ul className="divide-y divide-border">
            {order.items.map((it) => (
              <li key={it.serviceId} className="py-2 flex justify-between">
                <div>
                  <div className="font-medium">{it.name} x{it.quantity}</div>
                  <div className="text-sm text-muted-foreground">S/ {it.price.toFixed(2)}</div>
                </div>
                <div className="font-medium">S/ {it.subtotal.toFixed(2)}</div>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-card p-4 rounded-sm">
          <h3 className="font-medium mb-2">Información</h3>
          <p className="text-sm"><strong>Estado:</strong> {order.status}</p>
          <p className="text-sm"><strong>Registrado:</strong> {new Date(order.registeredAt).toLocaleString('es-PE')}</p>
          {order.cancelReason && <p className="text-sm text-red-400"><strong>Razón cancelación:</strong> {order.cancelReason}</p>}
          {order.notes && <p className="mt-2 text-sm text-muted-foreground">{order.notes}</p>}
        </div>
      </div>

      <div className="bg-card p-4 rounded-sm">
        <h3 className="font-medium mb-2">Historial de estados</h3>
        <ol className="list-decimal list-inside text-sm text-muted-foreground">
          {order.statusHistory?.map((h, idx) => (
            <li key={idx} className="py-1">{h.status} — {new Date(h.at).toLocaleString('es-PE')}{h.note ? ` — ${h.note}` : ''}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}
