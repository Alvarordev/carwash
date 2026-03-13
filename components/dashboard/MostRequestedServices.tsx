import { Car } from "iconoir-react";
import { ICON_MAP } from "@/components/servicios/ServiceCard";
import type { Service, ServiceCategory } from "@/lib/types";

type TopItem = {
  serviceId: string;
  count: number;
  name?: string;
  categoryId: string | null;
  category: ServiceCategory | null;
  color: Service["color"];
  icon: Service["icon"];
};

export default function MostRequestedServices({ top }: { top: TopItem[] }) {
  const total = top.reduce((s, t) => s + t.count, 0) || 1;

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-semibold text-foreground">
          Servicios más solicitados
        </h3>
        <span className="text-xs text-muted-foreground bg-card-alt px-3 py-1 rounded-full">
          Esta semana
        </span>
      </div>

      <div className="space-y-5">
        {top.map((t) => {
          const pct = Math.round((t.count / total) * 100);
          const color = t.color ?? "var(--primary)";
          const iconElement = t.icon && ICON_MAP[t.icon]
            ? ICON_MAP[t.icon]
            : <Car className="size-4" />;
          return (
            <div key={t.serviceId}>
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="size-9 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: t.color ? `${t.color}1f` : "rgba(42,123,253,0.15)", color }}
                >
                  {iconElement}
                </div>
                <span className="flex-1 text-sm font-medium text-foreground truncate">
                  {t.name ?? t.serviceId}
                </span>
                <span className="text-sm font-semibold tabular-nums" style={{ color }}>
                  {pct}%
                </span>
              </div>
              <div className="w-full bg-white/8 rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, backgroundColor: color }}
                />
              </div>
            </div>
          );
        })}

        {top.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Sin datos aún
          </p>
        )}
      </div>
    </div>
  );
}
