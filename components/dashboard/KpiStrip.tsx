import { Button } from "@/components/ui/button";
import { ArrowRight, LotOfCash, TimerSolid } from "iconoir-react";

type Props = { ordenesHoy: number; ingresosHoy: number; ticketPromedio: number };

export default function KpiStrip({ ordenesHoy, ingresosHoy, ticketPromedio }: Props) {
  const fmt = (v: number) => new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(v);
  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="col-span-2 bg-card-alt rounded-2xl p-6 shadow-md">
        <div className="flex h-full items-start">
          <div className="flex flex-col h-full w-full">
            <h2 className="text-base font-semibold text-primary">Resumen del día</h2>
            <p className="text-3xl font-semibold text-primary-foreground mt-1">Se han generado {ordenesHoy} órdenes hoy</p>

            <div className="mt-4 flex flex-1 items-end gap-3 w-full">
              <div className="bg-card/80 p-3 rounded-sm text-start w-full">
                <div className="text-sm text-muted-foreground">Órdenes hoy</div>
                <div className="text-lg font-semibold text-foreground">{ordenesHoy}</div>
              </div>
              <div className="bg-card/80 p-3 rounded-sm text-start w-full">
                <div className="text-sm text-muted-foreground">Ingresos</div>
                <div className="text-lg font-semibold text-foreground">{fmt(ingresosHoy)}</div>
              </div>
              <Button className="w-full max-w-40 rounded-sm">
                Ver Ordenes
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card/80 rounded-xl p-6 flex flex-col">
        <div className="flex justify-between pb-4">
          <div className="bg-card-alt rounded-[8px] p-1.5">
            <LotOfCash className="size-5 text-primary" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">Ingreso del día</p>
        <p className="text-3xl font-bold pb-11">{fmt(ingresosHoy)}</p>
        <div className="flex justify-between border-t border-border">
          <div className="text-muted-foreground text-xs pt-4">Semanal: {fmt(ingresosHoy * 7)}</div>
          <div className="text-muted-foreground text-xs pt-4">Mensual: {fmt(ingresosHoy * 30)}</div>
        </div>
      </div>

     <div className="bg-card/80 rounded-xl p-6 flex flex-col">
        <div className="flex justify-between pb-4">
          <div className="bg-card-alt rounded-[8px] p-1.5">
            <TimerSolid className="size-5 text-primary" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">Tiempo promedio de servicio</p>
        <p className="text-3xl font-bold pb-11">{ticketPromedio} min</p>
        <div className="flex justify-between border-t border-border">
          <div className="text-muted-foreground text-xs pt-4">Objetivo: 55 min</div>
        </div>
      </div>
    </div>
  );
}
