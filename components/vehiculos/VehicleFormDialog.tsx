"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
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
import { vehicleSchema, type VehicleFormData } from "@/lib/schemas/vehicle";
import { useVehicleTypes } from "@/lib/hooks/useVehicleTypes";
import type { Vehicle } from "@/lib/types";

type VehicleFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle?: Vehicle | null;
  onSubmit: (data: VehicleFormData) => Promise<void>;
  isSubmitting: boolean;
};

export default function VehicleFormDialog({
  open,
  onOpenChange,
  vehicle,
  onSubmit,
  isSubmitting,
}: VehicleFormDialogProps) {
  const { vehicleTypes } = useVehicleTypes();
  const isEditing = !!vehicle;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      plate: "",
      brand: "",
      model: "",
      color: "",
      vehicleTypeId: "",
      status: "active",
    },
  });

  useEffect(() => {
    if (open) {
      if (vehicle) {
        reset({
          plate: vehicle.plate,
          brand: vehicle.brand,
          model: vehicle.model ?? "",
          color: vehicle.color,
          vehicleTypeId: vehicle.vehicleTypeId,
          status: vehicle.status,
        });
      } else {
        reset({
          plate: "",
          brand: "",
          model: "",
          color: "",
          vehicleTypeId: "",
          status: "active",
        });
      }
    }
  }, [open, vehicle, reset]);

  const watchVehicleTypeId = watch("vehicleTypeId");
  const watchStatus = watch("status");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background border-border sm:max-w-lg rounded-md">
        <DialogHeader>
          <DialogTitle className="text-foreground text-xl font-semibold">
            {isEditing ? "Editar Vehículo" : "Nuevo Vehículo"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isEditing
              ? "Modifica los datos del vehículo y guarda los cambios."
              : "Completa los datos para registrar un nuevo vehículo."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 pt-1">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="plate" className="text-foreground text-sm font-medium">
              Placa <span className="text-destructive">*</span>
            </Label>
            <Input
              id="plate"
              placeholder="ABC-1234"
              className="bg-card border-border rounded-md uppercase"
              {...register("plate")}
            />
            {errors.plate && (
              <p className="text-destructive text-xs">{errors.plate.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="brand" className="text-foreground text-sm font-medium">
                Marca <span className="text-destructive">*</span>
              </Label>
              <Input
                id="brand"
                placeholder="Toyota"
                className="bg-card border-border rounded-md"
                {...register("brand")}
              />
              {errors.brand && (
                <p className="text-destructive text-xs">{errors.brand.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="model" className="text-foreground text-sm font-medium">
                Modelo
              </Label>
              <Input
                id="model"
                placeholder="Corolla"
                className="bg-card border-border rounded-md"
                {...register("model")}
              />
              {errors.model && (
                <p className="text-destructive text-xs">{errors.model.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="color" className="text-foreground text-sm font-medium">
                Color <span className="text-destructive">*</span>
              </Label>
              <Input
                id="color"
                placeholder="Blanco"
                className="bg-card border-border rounded-md"
                {...register("color")}
              />
              {errors.color && (
                <p className="text-destructive text-xs">{errors.color.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-foreground text-sm font-medium">
                Tipo <span className="text-destructive">*</span>
              </Label>
              <Select
                value={watchVehicleTypeId}
                onValueChange={(val) => setValue("vehicleTypeId", val, { shouldValidate: true })}
              >
                <SelectTrigger className="bg-card border-border rounded-md w-full">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border rounded-md">
                  {vehicleTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.vehicleTypeId && (
                <p className="text-destructive text-xs">{errors.vehicleTypeId.message}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-foreground text-sm font-medium">Estado</Label>
            <Select
              value={watchStatus}
              onValueChange={(val) =>
                setValue("status", val as "active" | "inactive", { shouldValidate: true })
              }
            >
              <SelectTrigger className="bg-card border-border rounded-md">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border rounded-md">
                <SelectItem value="active">Activo</SelectItem>
                <SelectItem value="inactive">Inactivo</SelectItem>
              </SelectContent>
            </Select>
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
              {isSubmitting ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear vehículo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
