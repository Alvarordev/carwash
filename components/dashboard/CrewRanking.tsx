import React from "react";
import type { Order } from "@/lib/types/order";

export default function CrewRanking({ orders }: { orders: Order[] }) {
  const map = new Map<string, number>();
  for (const o of orders) {
    for (const s of o.staff || []) {
      map.set(s.name, (map.get(s.name) || 0) + 1);
    }
  }
  const arr = Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  arr.sort((a, b) => b.count - a.count);
  const top = arr.slice(0, 3);

  return (
    <div className="bg-card/80 border border-border rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-white">Ranking de personal</h4>
        <a className="text-sm text-primary">Ver</a>
      </div>
      <div className="space-y-2">
        {top.map((t) => (
          <div key={t.name} className="flex items-center justify-between">
            <div className="text-white">{t.name}</div>
            <div className="text-sm text-muted-foreground">{t.count} órdenes</div>
          </div>
        ))}
        {top.length === 0 && <div className="text-sm text-muted-foreground">No hay asignaciones</div>}
      </div>
    </div>
  );
}
