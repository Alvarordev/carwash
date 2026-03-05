"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { VehicleType } from "@/lib/types";
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
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().nullable().optional(),
});

type FormData = z.infer<typeof schema>;

interface VehicleTypeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicleType: VehicleType | null;
  onSubmit: (data: FormData) => Promise<void>;
  isSubmitting: boolean;
}

export function VehicleTypeFormDialog({
  open,
  onOpenChange,
  vehicleType,
  onSubmit,
  isSubmitting,
}: VehicleTypeFormDialogProps) {
  const isEditing = !!vehicleType;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "" },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: vehicleType?.name ?? "",
        description: vehicleType?.description ?? "",
      });
    }
  }, [open, vehicleType, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar tipo de vehículo" : "Agregar tipo de vehículo"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifica los datos del tipo de vehículo."
              : "Ingresa los datos del nuevo tipo."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nombre</Label>
            <Input {...register("name")} placeholder="Ej: Sedán" />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Descripción (opcional)</Label>
            <Textarea {...register("description")} placeholder="Descripción breve..." rows={3} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
