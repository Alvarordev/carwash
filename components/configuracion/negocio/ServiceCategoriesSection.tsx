"use client";

import { Car, Wind, Wrench, Star } from "iconoir-react";
import { Badge } from "@/components/ui/badge";
import { SERVICE_CATEGORIES } from "@/lib/schemas/service";

const CATEGORY_INFO = {
  exterior: {
    Icon: Car,
    description: "Servicios de lavado y limpieza exterior del vehículo.",
  },
  interior: {
    Icon: Wind,
    description: "Limpieza y acondicionamiento del interior del vehículo.",
  },
  detalle: {
    Icon: Wrench,
    description: "Servicios especializados de detallado, pulido y tratamiento.",
  },
  añadido: {
    Icon: Star,
    description: "Servicios adicionales y complementarios.",
  },
} as const;

export function ServiceCategoriesSection() {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-base font-semibold">Categorías de Servicios</h2>
        <p className="text-sm text-muted-foreground">
          Las categorías son predefinidas por el sistema.
        </p>
      </div>

      <div className="divide-y divide-border">
        {SERVICE_CATEGORIES.map((cat) => {
          const { Icon, description } = CATEGORY_INFO[cat.value];
          return (
            <div key={cat.value} className="flex items-start gap-3 px-6 py-4">
              <div className="flex-shrink-0 size-9 rounded-lg bg-muted flex items-center justify-center">
                <Icon className="size-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-medium">{cat.label}</p>
                  <Badge variant="outline" className="text-xs">
                    Sistema
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
