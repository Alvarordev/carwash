import type { Order } from "@/lib/types/order";

const LIMA_TZ = "America/Lima";

export function toLocalDateStr(iso: string): string {
  return new Date(iso).toLocaleDateString("en-CA", { timeZone: LIMA_TZ });
}

export function isSameDay(iso: string, date = new Date()) {
  const d = new Date(iso);
  return (
    d.getFullYear() === date.getFullYear() &&
    d.getMonth() === date.getMonth() &&
    d.getDate() === date.getDate()
  );
}

export function getStartOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function daysInMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

export function buildMonthSeries(orders: Order[], date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const days = daysInMonth(date);
  const series = Array.from({ length: days }).map((_, i) => {
    const day = i + 1;
    const dayStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dayOrders = orders.filter((o) => o.registeredAt && toLocalDateStr(o.registeredAt) === dayStr);
    const ingresos = dayOrders.reduce((s, o) => s + (o.total || 0), 0);
    return { date: String(day), ingresos, ordenes: dayOrders.length };
  });
  return series;
}

export function aggregateTopServices(orders: Order[], top?: number) {
  const map = new Map<string, number>();
  for (const o of orders) {
    for (const it of o.items || []) {
      map.set(it.serviceId, (map.get(it.serviceId) || 0) + (it.quantity || 1));
    }
  }
  const arr = Array.from(map.entries()).map(([serviceId, count]) => ({ serviceId, count }));
  arr.sort((a, b) => b.count - a.count);
  return typeof top === "number" ? arr.slice(0, top) : arr;
}
