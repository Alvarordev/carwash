import type { Order, OrderStatusHistoryEntry } from "@/lib/types/order";

export type StaffPerformancePeriod = "week" | "month";

export type StaffPerformanceSummary = {
  totalOrders: number;
  nonCanceledOrders: number;
  measurableOrders: number;
  averageMinutes: number;
};

function sortStatusHistory(history: OrderStatusHistoryEntry[]) {
  return [...history].sort(
    (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime()
  );
}

export function getOrderServiceDurationMs(order: Order): number | null {
  const history = sortStatusHistory(order.statusHistory ?? []);
  if (!history.length) {
    return null;
  }

  const lavando = history.find((entry) => entry.status === "Lavando");
  if (!lavando) {
    return null;
  }

  const lavandoAt = new Date(lavando.at).getTime();
  const terminado = history.find(
    (entry) =>
      entry.status === "Terminado" &&
      new Date(entry.at).getTime() >= lavandoAt
  );

  if (!terminado) {
    return null;
  }

  const diff = new Date(terminado.at).getTime() - lavandoAt;
  return diff > 0 ? diff : null;
}

export function getOrderServiceDurationMinutes(order: Order): number | null {
  const durationMs = getOrderServiceDurationMs(order);
  if (durationMs === null) {
    return null;
  }

  return Math.round(durationMs / 60_000);
}

export function getPeriodStart(period: StaffPerformancePeriod, now = new Date()) {
  const start = new Date(now);

  if (period === "week") {
    const day = start.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    start.setDate(start.getDate() + diff);
  } else {
    start.setDate(1);
  }

  start.setHours(0, 0, 0, 0);
  return start;
}

export function isInPeriod(
  isoDate: string,
  period: StaffPerformancePeriod,
  now = new Date()
) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const start = getPeriodStart(period, now);
  return date.getTime() >= start.getTime() && date.getTime() <= now.getTime();
}

export function buildStaffPerformanceSummary(orders: Order[]): StaffPerformanceSummary {
  const nonCanceledOrders = orders.filter((order) => order.status !== "Anulado");
  const durations = nonCanceledOrders
    .map(getOrderServiceDurationMs)
    .filter((value): value is number => value !== null);

  const averageMinutes = durations.length
    ? Math.round(durations.reduce((sum, value) => sum + value, 0) / durations.length / 60_000)
    : 0;

  return {
    totalOrders: orders.length,
    nonCanceledOrders: nonCanceledOrders.length,
    measurableOrders: durations.length,
    averageMinutes,
  };
}
