"use client";

import { useState, useRef } from "react";
import { EditPencil, Trash, Car } from "iconoir-react";
import { Input } from "@/components/ui/input";
import type { ServicePricing, VehicleType } from "@/lib/types";

type PricingCardProps = {
  pricing: ServicePricing;
  vehicleType: VehicleType | undefined;
  onUpdatePrice: (id: string, price: number) => Promise<void>;
  onEdit: (pricing: ServicePricing) => void;
  onDelete: (pricing: ServicePricing) => void;
};

export default function PricingCard({
  pricing,
  vehicleType,
  onUpdatePrice,
  onEdit,
  onDelete,
}: PricingCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [inputValue, setInputValue] = useState(pricing.price.toFixed(2));
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handlePriceChange = async () => {
    const newPrice = parseFloat(inputValue);
    if (isNaN(newPrice) || newPrice < 0) {
      setInputValue(pricing.price.toFixed(2));
      setIsEditing(false);
      return;
    }

    if (newPrice !== pricing.price) {
      await onUpdatePrice(pricing.id, newPrice);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      inputRef.current?.blur();
    } else if (e.key === "Escape") {
      setInputValue(pricing.price.toFixed(2));
      setIsEditing(false);
    }
  };

  return (
    <div
      className="flex flex-col items-start justify-center py-4 px-4 rounded-lg bg-card/80 border border-border min-w-32 max-w-64 transition-all duration-200 hover:border-primary/30"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start justify-between gap-1.5 mb-3 w-full">
        <div className="flex w-full gap-2">
          <Car className="size-5 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground truncate">
            {vehicleType?.name ?? "Vehículo"}
          </span>
        </div>

        <div
          className={`flex w-full justify-end gap-1 transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0"}`}
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
      <div className="w-full flex flex-col">
        <p className="text-muted-foreground text-xs font-semibold mb-1">Precio Base</p>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
            S/
          </span>
          <Input
            ref={inputRef}
            type="number"
            step="0.01"
            min="0"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => setIsEditing(true)}
            onBlur={handlePriceChange}
            onKeyDown={handleKeyDown}
            className="pl-8 bg-background border-border text-lg font-semibold text-foreground h-10"
          />
        </div>
      </div>
    </div>
  );
}
