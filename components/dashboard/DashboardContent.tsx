"use client";

import { useDashboard } from "@/lib/hooks/useDashboard";
import KpiStrip from "./KpiStrip";
import WeekChart from "./MonthlyChart";
import MostRequestedServices from "./MostRequestedServices";
import CrewRanking from "./CrewRanking";

export default function DashboardContent() {
    const { data, loading, error } = useDashboard();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-3">
                    <div className="size-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                    <p className="text-sm text-muted-foreground">Cargando dashboard…</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-sm text-destructive">Error al cargar los datos: {error}</p>
            </div>
        );
    }

    if (!data) return null;

    const {
        ordenesHoy,
        ordersEnProceso,
        ordersEsperando,
        ingresosHoy,
        avgServiceTime,
        seriesSemana,
        topServices,
        allOrders,
    } = data;

    return (
        <div className="space-y-6">
            <KpiStrip
                ordenesHoy={ordenesHoy}
                ordersEnProceso={ordersEnProceso}
                ordersEsperando={ordersEsperando}
                ingresosHoy={ingresosHoy}
                avgServiceTime={avgServiceTime}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <MostRequestedServices top={topServices} />
                </div>

                <aside className="flex flex-col gap-4">
                    <WeekChart series={seriesSemana} />
                    <CrewRanking orders={allOrders} />
                </aside>
            </div>
        </div>
    );
}
