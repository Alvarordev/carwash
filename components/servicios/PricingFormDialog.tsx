"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { servicePricingSchema, type ServicePricingFormData } from "@/lib/schemas/service";
import { useVehicleTypes } from "@/lib/hooks/useVehicleTypes";
import type { ServicePricing } from "@/lib/types";

type PricingFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceId: string;
  pricing?: ServicePricing | null;
  onSubmit: (data: ServicePricingFormData) => Promise<void>;
  isSubmitting: boolean;
  existingVehicleTypeIds: string[];
};

export default function PricingFormDialog({
  open,
  onOpenChange,
  serviceId,
  pricing,
  onSubmit,
  isSubmitting,
  existingVehicleTypeIds,
}: PricingFormDialogProps) {
  const { vehicleTypes } = useVehicleTypes();
  const isEditing = !!pricing;

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<ServicePricingFormData>({
    resolver: zodResolver(servicePricingSchema),
    defaultValues: {
      serviceId: serviceId,
      vehicleTypeId: "",
      price: 0,
      status: "active",
    },
  });

  useEffect(() => {
    if (open) {
      if (pricing) {
        reset({
          serviceId: pricing.serviceId,
          vehicleTypeId: pricing.vehicleTypeId,
          price: pricing.price,
          status: pricing.status,
        });
      } else {
        reset({
          serviceId: serviceId,
          vehicleTypeId: "",
          price: 0,
          status: "active",
        });
      }
    }
  }, [open, pricing, serviceId, reset]);

  const availableVehicleTypes = vehicleTypes.filter(
    (vt) => !existingVehicleTypeIds.includes(vt.id) || pricing?.vehicleTypeId === vt.id
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background border-border sm:max-w-md rounded-md">
        <DialogHeader>
          <DialogTitle className="text-foreground text-xl font-semibold">
            {isEditing ? "Editar Precio" : "Agregar Precio"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isEditing
              ? "Modifica el precio para este tipo de vehículo."
              : "Selecciona el tipo de vehículo y define el precio."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 pt-1">
          <div className="flex flex-col gap-1.5">
            <Label className="text-foreground text-sm font-medium">
              Tipo de vehículo <span className="text-destructive">*</span>
            </Label>
            <Controller
              control={control}
              name="vehicleTypeId"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(val) => field.onChange(val)}
                  disabled={isEditing}
                >
                  <SelectTrigger className="bg-background border-border rounded-md">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border rounded-md">
                    {availableVehicleTypes.map((vt) => (
                      <SelectItem key={vt.id} value={vt.id}>
                        {vt.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.vehicleTypeId && (
              <p className="text-destructive text-xs">{errors.vehicleTypeId.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="price" className="text-foreground text-sm font-medium">
              Precio (S/) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              className="bg-background border-border rounded-md"
              {...register("price", { valueAsNumber: true })}
            />
            {errors.price && (
              <p className="text-destructive text-xs">{errors.price.message}</p>
            )}
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
              {isSubmitting ? "Guardando..." : isEditing ? "Guardar cambios" : "Agregar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
