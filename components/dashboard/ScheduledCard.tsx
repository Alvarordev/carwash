import React from "react";
import type { Order } from "@/lib/types/order";

export default function ScheduledCard({ orders }: { orders: Order[] }) {
  const upcoming = orders.filter((o) => o.registeredAt).slice(0, 3);
  return (
    <div className="bg-card/80 border border-border rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-foreground">Programados</h4>
        <a className="text-sm text-primary">Ver</a>
      </div>
      <div className="space-y-2">
        {upcoming.map((o) => (
          <div key={o.id} className="flex items-center justify-between">
            <div>
              <div className="text-foreground text-sm">{o.orderNumber}</div>
              <div className="text-xs text-muted-foreground">{o.customer ? `${o.customer.firstName} ${o.customer.lastName}` : "—"}</div>
            </div>
            <div className="text-xs text-muted-foreground">{new Date(o.registeredAt || "").toLocaleString()}</div>
          </div>
        ))}
        {upcoming.length === 0 && <div className="text-sm text-muted-foreground">No hay órdenes programadas</div>}
      </div>
    </div>

  );
}
