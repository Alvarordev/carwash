import type { Metadata } from "next";
import { buildMonthSeries, aggregateTopServices, isSameDay } from "@/lib/utils/dashboard";
import type { Order } from "@/lib/types/order";
import KpiStrip from "@/components/dashboard/KpiStrip";
import MonthlyChart from "@/components/dashboard/MonthlyChart";
import MostRequestedServices from "@/components/dashboard/MostRequestedServices";
import ScheduledCard from "@/components/dashboard/ScheduledCard";
import CrewRanking from "@/components/dashboard/CrewRanking";
import OrdersRecent from "@/components/dashboard/OrdersRecent";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const res = await fetch("http://localhost:3001/orders");
  if (!res.ok) throw new Error("No se pudieron cargar las órdenes");
  const orders: Order[] = await res.json();

  const todayOrders = orders.filter((o) => o.registeredAt && isSameDay(o.registeredAt));
  const ingresosHoy = todayOrders.reduce((s, o) => s + (o.total || 0), 0);
  const ordenesHoy = todayOrders.length;
  const ticketPromedio = ordenesHoy ? ingresosHoy / ordenesHoy : 0;

  const seriesMes = buildMonthSeries(orders);
  const rawTop = aggregateTopServices(orders, 4);
  const svcRes = await fetch("http://localhost:3001/services");
  const services = svcRes.ok ? await svcRes.json() : [];
  const servicesMap: Record<string, string> = {};
  for (const s of services) servicesMap[s.id] = s.name;
  const topServices = rawTop.map((r) => ({ ...r, name: servicesMap[r.serviceId] ?? r.serviceId }));
  const recent = orders.sort((a, b) => (b.registeredAt || "").localeCompare(a.registeredAt || "")).slice(0, 10);

  return (
    <div>
      <div>
        <KpiStrip ordenesHoy={ordenesHoy} ingresosHoy={ingresosHoy} ticketPromedio={ticketPromedio} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2">
            <MonthlyChart series={seriesMes} />
            <MostRequestedServices top={topServices} />
            <OrdersRecent orders={recent} />
          </div>

          <aside className="flex flex-col gap-6">
            <ScheduledCard orders={orders} />
            <CrewRanking orders={orders} />
          </aside>
        </div>
      </div>
    </div>
  );
}
