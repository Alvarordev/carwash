"use client";

import { useState } from "react";
import { EditPencil, Trash, Car } from "iconoir-react";
import type { ServicePricing, VehicleType } from "@/lib/types";

type PricingCardProps = {
  pricing: ServicePricing;
  vehicleType: VehicleType | undefined;
  onEdit: (pricing: ServicePricing) => void;
  onDelete: (pricing: ServicePricing) => void;
};

export default function PricingCard({
  pricing,
  vehicleType,
  onEdit,
  onDelete,
}: PricingCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="flex flex-col items-center justify-center p-4 rounded-lg bg-card/80 border border-border min-w-[120px] max-w-[140px] transition-all duration-200 hover:border-primary/30"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-1.5 mb-2">
        <Car className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground truncate max-w-full">
          {vehicleType?.name ?? "Vehículo"}
        </span>
      </div>
      <span className="text-xl font-bold text-foreground mb-2">
        S/{pricing.price}
      </span>
      <div
        className={`flex gap-1 transition-opacity duration-200 ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}
      >
        <button
          onClick={() => onEdit(pricing)}
          className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <EditPencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDelete(pricing)}
          className="p-1.5 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
        >
          <Trash className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
