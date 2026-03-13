import Link from "next/link";
import type { Order } from "@/lib/types/order";
import { Trophy } from "iconoir-react";

export default function CrewRanking({ orders }: { orders: Order[] }) {
  const map = new Map<string, { name: string; count: number }>();
  for (const o of orders) {
    if (o.status !== "Entregado") continue;

    const seenInOrder = new Set<string>();
    for (const s of o.staff || []) {
      const staffKey = s.staffId || s.name;
      if (!staffKey || seenInOrder.has(staffKey)) continue;

      seenInOrder.add(staffKey);
      const current = map.get(staffKey);
      if (current) {
        map.set(staffKey, { ...current, count: current.count + 1 });
        continue;
      }

      map.set(staffKey, { name: s.name, count: 1 });
    }
  }

  const top = Array.from(map.values())
    .sort((a, b) => b.count - a.count);

  const initials = (name: string) =>
    name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();

  const rankColors = [
    "text-yellow-400",
    "text-slate-300",
    "text-amber-600",
  ];

  return (
    <div className="bg-card border border-border rounded-2xl p-4 flex-1">
      <div className="flex items-center justify-between mb-4">
        <h4 className="flex gap-2 items-center text-sm font-semibold text-foreground">
          <span>Ranking del personal</span> 
          <Trophy className="size-4.5 text-yellow-400 inline" />
        </h4>
        <Link href="/personal" className="text-xs text-primary hover:underline">
          Ver todos
        </Link>
      </div>

      <div className="space-y-3">
        {top.map((t, i) => (
          <div key={t.name} className="flex items-center gap-3">
            <span
              className={`text-xs font-bold w-5 text-center tabular-nums ${rankColors[i] ?? "text-muted-foreground"}`}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="size-8 rounded-full bg-card-alt flex items-center justify-center text-xs font-semibold text-primary shrink-0">
              {initials(t.name)}
            </div>
            <span className="flex-1 text-sm text-foreground truncate">{t.name}</span>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {t.count} {t.count === 1 ? "auto" : "autos"}
            </span>
          </div>
        ))}
        {top.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-2">
            Sin asignaciones aún
          </p>
        )}
      </div>
    </div>
  );
}
