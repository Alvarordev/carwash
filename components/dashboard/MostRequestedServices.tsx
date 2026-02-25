import type { FC, SVGProps } from "react";
import { Car, Sparks, Sofa, PlusCircle } from "iconoir-react";
import type { ServiceCategory } from "@/lib/types/service";

type TopItem = { serviceId: string; count: number; name?: string; category: ServiceCategory | null };

type CategoryConfig = {
  Icon: FC<SVGProps<SVGSVGElement>>;
  bg: string;
  text: string;
  bar: string;
};

const CATEGORY_CONFIG: Record<ServiceCategory, CategoryConfig> = {
  exterior: { Icon: Car, bg: "bg-orange-500/15", text: "text-orange-400", bar: "#f97316" },
  interior: { Icon: Sofa, bg: "bg-blue-500/15", text: "text-blue-400", bar: "#3b82f6" },
  detalle: { Icon: Sparks, bg: "bg-violet-500/15", text: "text-violet-400", bar: "#8b5cf6" },
  añadido: { Icon: PlusCircle, bg: "bg-green-500/15", text: "text-green-400", bar: "#22c55e" },
};

const FALLBACK_CONFIGS: CategoryConfig[] = [
  { Icon: Car, bg: "bg-orange-500/15", text: "text-orange-400", bar: "#f97316" },
  { Icon: Sofa, bg: "bg-blue-500/15", text: "text-blue-400", bar: "#3b82f6" },
  { Icon: Sparks, bg: "bg-violet-500/15", text: "text-violet-400", bar: "#8b5cf6" },
  { Icon: PlusCircle, bg: "bg-green-500/15", text: "text-green-400", bar: "#22c55e" },
];

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
        {top.map((t, idx) => {
          const pct = Math.round((t.count / total) * 100);
          const cfg = t.category
            ? CATEGORY_CONFIG[t.category]
            : FALLBACK_CONFIGS[idx % FALLBACK_CONFIGS.length];
          const { Icon } = cfg;
          return (
            <div key={t.serviceId}>
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`size-9 rounded-lg flex items-center justify-center ${cfg.bg}`}
                >
                  <Icon
                    className={`size-4 ${cfg.text}`}
                    strokeWidth={1.8}
                  />
                </div>
                <span className="flex-1 text-sm font-medium text-foreground truncate">
                  {t.name ?? t.serviceId}
                </span>
                <span className={`text-sm font-semibold tabular-nums ${cfg.text}`}>
                  {pct}%
                </span>
              </div>
              <div className="w-full bg-white/8 rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, backgroundColor: cfg.bar }}
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
