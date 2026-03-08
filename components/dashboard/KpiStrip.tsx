"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, LotOfCash, TimerSolid } from "iconoir-react";
import { Button } from "@/components/ui/button";

type Props = {
  ordenesHoy: number;
  ordersEnProceso: number;
  ordersEsperando: number;
  ingresosHoy: number;
  avgServiceTime: number;
};

const TARGET_MINUTES = 45;

export default function KpiStrip({
  ordenesHoy,
  ordersEnProceso,
  ordersEsperando,
  ingresosHoy,
  avgServiceTime,
}: Props) {
  const router = useRouter();
  const fmt = (v: number) =>
    new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(v);

  const progress = Math.min((avgServiceTime / TARGET_MINUTES) * 100, 100);
  const isOverTarget = avgServiceTime > TARGET_MINUTES;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="flex flex-col sm:col-span-2 bg-card-alt rounded-2xl p-4 sm:p-6 relative overflow-hidden shadow-lg">
        <p className="font-medium text-primary mb-1">Rendimiento del día</p>
        <h2 className="text-3xl font-bold text-white leading-tight">
          Se completaron{" "}
          <span className="text-white">{ordenesHoy}</span> servicios hoy
        </h2>

        <div className="flex flex-1 items-end gap-3">
          <div className="bg-white/15 backdrop-blur-sm rounded-lg px-4 py-2 text-center">
            <p className="text-xs text-white/60">En proceso</p>
            <p className="text-xl font-bold text-white">{ordersEnProceso}</p>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-lg px-4 py-2 text-center">
            <p className="text-xs text-white/60">Esperando</p>
            <p className="text-xl font-bold text-white">{ordersEsperando}</p>
          </div>
          <Button
            size="lg"
            className="ml-auto rounded-sm font-semibold"
            onClick={() => router.push("/ordenes")}
          >
            Ver Órdenes
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-xl p-5 flex flex-col border border-border">
        <div className="flex items-start justify-between mb-3">
          <div className="bg-card-alt rounded-lg p-2">
            <LotOfCash className="size-5 text-primary" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">Ingreso del día</p>
        <p className="text-3xl font-bold mt-1 flex-1 pb-11">{fmt(ingresosHoy)}</p>
        <div className="flex justify-between border-t border-border pt-3 mt-3">
          <span className="text-muted-foreground text-xs">
            Semanal: {fmt(ingresosHoy * 7)}
          </span>
          <span className="text-muted-foreground text-xs">
            Mensual: {fmt(ingresosHoy * 30)}
          </span>
        </div>
      </div>

      <div className="bg-card rounded-xl p-5 flex flex-col border border-border">
        <div className="flex items-start justify-between mb-3">
          <div className="bg-card-alt rounded-lg p-2">
            <TimerSolid className="size-5 text-primary" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">Tiempo promedio de servicio</p>
        <p className="text-3xl font-bold mt-1 flex-1">
          {avgServiceTime > 0 ? `${avgServiceTime}m` : "—"}
        </p>
        <div className="mt-auto">
          <div className="w-full bg-white/10 rounded-full h-1 mb-2">
            <div
              className="h-1 rounded-full transition-all duration-500"
              style={{
                width: `${progress}%`,
                backgroundColor: isOverTarget
                  ? "var(--destructive)"
                  : "var(--primary)",
              }}
            />
          </div>
          <p className="text-muted-foreground text-xs">
            Objetivo: {TARGET_MINUTES} min máx
          </p>
        </div>
      </div>
    </div>
  );
}
