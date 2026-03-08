"use client";

import { useEffect, useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search } from "iconoir-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { promotionSchema, DISCOUNT_TYPES, PROMOTION_SCOPES, type PromotionFormData } from "@/lib/schemas/promotion";
import { useServices } from "@/lib/hooks/useServices";
import { useVehicleTypes } from "@/lib/hooks/useVehicleTypes";
import type { Promotion } from "@/lib/types";

type PromotionFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promotion?: Promotion | null;
  onSubmit: (data: PromotionFormData) => Promise<void>;
  isSubmitting: boolean;
};

export default function PromotionFormDialog({
  open,
  onOpenChange,
  promotion,
  onSubmit,
  isSubmitting,
}: PromotionFormDialogProps) {
  const isEditing = !!promotion;
  const { services } = useServices();
  const { vehicleTypes } = useVehicleTypes();
  const [scopeSearch, setScopeSearch] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    control,
    formState: { errors },
  } = useForm<PromotionFormData>({
    resolver: zodResolver(promotionSchema),
    defaultValues: {
      name: "",
      description: "",
      discountType: "percentage",
      discountValue: 0,
      scope: "all",
      scopeIds: [],
      startDate: null,
      endDate: null,
      status: "active",
    },
  });

  const watchScope = watch("scope");
  const watchScopeIds = watch("scopeIds") ?? [];
  const watchDiscountType = watch("discountType");

  useEffect(() => {
    if (open) {
      if (promotion) {
        reset({
          name: promotion.name,
          description: promotion.description ?? "",
          discountType: promotion.discountType,
          discountValue: promotion.discountValue,
          scope: promotion.scope,
          scopeIds: promotion.scopeIds ?? [],
          startDate: promotion.startDate ?? null,
          endDate: promotion.endDate ?? null,
          status: promotion.status,
        });
      } else {
        reset({
          name: "",
          description: "",
          discountType: "percentage",
          discountValue: 0,
          scope: "all",
          scopeIds: [],
          startDate: null,
          endDate: null,
          status: "active",
        });
      }
      setScopeSearch("");
    }
  }, [open, promotion, reset]);

  const availableItems = useMemo(() => {
    const q = scopeSearch.toLowerCase().trim();
    if (watchScope === "service") {
      return services.filter((s) => {
        if (!q) return true;
        return s.name.toLowerCase().includes(q);
      });
    }
    if (watchScope === "vehicleType") {
      return vehicleTypes.filter((v) => {
        if (!q) return true;
        return v.name.toLowerCase().includes(q);
      });
    }
    return [];
  }, [watchScope, scopeSearch, services, vehicleTypes]);

  const toggleScopeItem = (id: string) => {
    const current = watchScopeIds;
    const updated = current.includes(id)
      ? current.filter((i) => i !== id)
      : [...current, id];
    setValue("scopeIds", updated, { shouldValidate: true });
  };

  const getItemLabel = (id: string) => {
    if (watchScope === "service") {
      return services.find((s) => s.id === id)?.name ?? id;
    }
    if (watchScope === "vehicleType") {
      return vehicleTypes.find((v) => v.id === id)?.name ?? id;
    }
    return id;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background border-border sm:max-w-lg rounded-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground text-xl font-semibold">
            {isEditing ? "Editar Promoción" : "Nueva Promoción"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isEditing
              ? "Modifica los datos de la promoción y guarda los cambios."
              : "Completa los datos para registrar una nueva promoción."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 pt-1">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name" className="text-foreground text-sm font-medium">
              Nombre <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Descuento de Verano"
              className="bg-background border-border rounded-md"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-destructive text-xs">{errors.name.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description" className="text-foreground text-sm font-medium">
              Descripción
            </Label>
            <Input
              id="description"
              placeholder="Descripción de la promoción..."
              className="bg-background border-border rounded-md"
              {...register("description")}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-foreground text-sm font-medium">
                Tipo de descuento <span className="text-destructive">*</span>
              </Label>
              <Controller
                control={control}
                name="discountType"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(val) => field.onChange(val as "percentage" | "fixed")}
                  >
                    <SelectTrigger className="bg-background border-border rounded-md">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border rounded-md">
                      {DISCOUNT_TYPES.map((dt) => (
                        <SelectItem key={dt.value} value={dt.value}>
                          {dt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="discountValue" className="text-foreground text-sm font-medium">
                Valor <span className="text-destructive">*</span>
              </Label>
              <Input
                id="discountValue"
                type="number"
                step={watchDiscountType === "percentage" ? "1" : "0.01"}
                min="0"
                max={watchDiscountType === "percentage" ? "100" : undefined}
                placeholder={watchDiscountType === "percentage" ? "10" : "25.00"}
                className="bg-background border-border rounded-md"
                {...register("discountValue", { valueAsNumber: true })}
              />
              {errors.discountValue && (
                <p className="text-destructive text-xs">{errors.discountValue.message}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-foreground text-sm font-medium">
              Alcance <span className="text-destructive">*</span>
            </Label>
            <Controller
              control={control}
              name="scope"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(val) => {
                    field.onChange(val as "all" | "service" | "vehicleType");
                    setValue("scopeIds", [], { shouldValidate: true });
                  }}
                >
                  <SelectTrigger className="bg-background border-border rounded-md">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border rounded-md">
                    {PROMOTION_SCOPES.map((ps) => (
                      <SelectItem key={ps.value} value={ps.value}>
                        {ps.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {watchScope !== "all" && (
            <div className="flex flex-col gap-2">
              <Label className="text-foreground text-sm font-medium">
                Seleccionar {watchScope === "service" ? "servicios" : "tipos de vehículo"}
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder={`Buscar ${watchScope === "service" ? "servicio" : "tipo de vehículo"}...`}
                  value={scopeSearch}
                  onChange={(e) => setScopeSearch(e.target.value)}
                  className="pl-9 bg-background border-border rounded-md text-sm h-9"
                />
              </div>
              <div className="flex flex-col gap-0.5 max-h-40 overflow-y-auto rounded-md border border-border">
                {availableItems.length === 0 ? (
                  <p className="text-muted-foreground text-xs px-3 py-4 text-center italic">
                    No hay {watchScope === "service" ? "servicios" : "tipos de vehículo"} disponibles.
                  </p>
                ) : (
                  availableItems.map((item) => {
                    const isSelected = watchScopeIds.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleScopeItem(item.id)}
                        className={`flex items-center gap-3 px-3 py-2.5 text-sm text-left transition-colors cursor-pointer border-b border-border last:border-b-0 ${
                          isSelected ? "bg-primary/10" : "hover:bg-muted"
                        }`}
                      >
                        <span
                          className={`size-4 rounded border shrink-0 flex items-center justify-center transition-colors ${
                            isSelected ? "bg-primary border-primary" : "border-border"
                          }`}
                        >
                          {isSelected && (
                            <svg viewBox="0 0 12 12" fill="none" className="size-2.5">
                              <path
                                d="M2 6l3 3 5-5"
                                stroke="white"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </span>
                        <span className={isSelected ? "text-foreground" : "text-muted-foreground"}>
                          {getItemLabel(item.id)}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
              {watchScopeIds.length > 0 && (
                <p className="text-xs text-primary font-medium">
                  {watchScopeIds.length} seleccionado{watchScopeIds.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="startDate" className="text-foreground text-sm font-medium">
                Fecha de inicio
              </Label>
              <Input
                id="startDate"
                type="date"
                className="bg-background border-border rounded-md"
                {...register("startDate")}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="endDate" className="text-foreground text-sm font-medium">
                Fecha de fin
              </Label>
              <Input
                id="endDate"
                type="date"
                className="bg-background border-border rounded-md"
                {...register("endDate")}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-foreground text-sm font-medium">Estado</Label>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(val) => field.onChange(val as "active" | "inactive")}
                >
                  <SelectTrigger className="bg-background border-border rounded-md">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border rounded-md">
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="inactive">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <DialogFooter className="mt-2 gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-border rounded-md"
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear promoción"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
