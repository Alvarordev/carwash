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
import { serviceSchema, SERVICE_CATEGORIES, type ServiceFormData } from "@/lib/schemas/service";
import type { Service } from "@/lib/types";

type ServiceFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service?: Service | null;
  onSubmit: (data: ServiceFormData) => Promise<void>;
  isSubmitting: boolean;
};

export default function ServiceFormDialog({
  open,
  onOpenChange,
  service,
  onSubmit,
  isSubmitting,
}: ServiceFormDialogProps) {
  const isEditing = !!service;

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "exterior",
      status: "active",
    },
  });

  useEffect(() => {
    if (open) {
      if (service) {
        reset({
          name: service.name,
          description: service.description ?? "",
          category: service.category,
          status: service.status,
        });
      } else {
        reset({
          name: "",
          description: "",
          category: "exterior",
          status: "active",
        });
      }
    }
  }, [open, service, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background border-border sm:max-w-lg rounded-md">
        <DialogHeader>
          <DialogTitle className="text-foreground text-xl font-semibold">
            {isEditing ? "Editar Servicio" : "Nuevo Servicio"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isEditing
              ? "Modifica los datos del servicio y guarda los cambios."
              : "Completa los datos para registrar un nuevo servicio."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 pt-1">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name" className="text-foreground text-sm font-medium">
              Nombre del servicio <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Lavado de Carrocería"
              className="bg-card border-border rounded-md"
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
              placeholder="Breve descripción del servicio..."
              className="bg-card border-border rounded-md min-h-20"
              {...register("description")}
            />
            {errors.description && (
              <p className="text-destructive text-xs">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-foreground text-sm font-medium">
                Categoría <span className="text-destructive">*</span>
              </Label>
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(val) => field.onChange(val as ServiceFormData["category"])}
                  >
                    <SelectTrigger className="bg-card border-border rounded-md w-full">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border rounded-md">
                      {SERVICE_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.category && (
                <p className="text-destructive text-xs">{errors.category.message}</p>
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
                    <SelectTrigger className="bg-card border-border rounded-md w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border rounded-md">
                      <SelectItem value="active">Activo</SelectItem>
                      <SelectItem value="inactive">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
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
              {isSubmitting ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear servicio"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
