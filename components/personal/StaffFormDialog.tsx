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
import { staffSchema, STAFF_ROLES, type StaffFormData } from "@/lib/schemas/staff";
import type { StaffMember } from "@/lib/types";

type StaffFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staffMember?: StaffMember | null;
  onSubmit: (data: StaffFormData) => Promise<void>;
  isSubmitting: boolean;
};

export default function StaffFormDialog({
  open,
  onOpenChange,
  staffMember,
  onSubmit,
  isSubmitting,
}: StaffFormDialogProps) {
  const isEditing = !!staffMember;

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors },
  } = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      role: "washer",
      phone: "",
      email: "",
      hiredAt: new Date().toISOString().split("T")[0],
      status: "active",
    },
  });

  useEffect(() => {
    if (open) {
      if (staffMember) {
        reset({
          firstName: staffMember.firstName,
          lastName: staffMember.lastName,
          role: staffMember.role,
          phone: staffMember.phone ?? "",
          email: staffMember.email ?? "",
          hiredAt: staffMember.hiredAt.split("T")[0],
          status: staffMember.status,
        });
      } else {
        reset({
          firstName: "",
          lastName: "",
          role: "washer",
          phone: "",
          email: "",
          hiredAt: new Date().toISOString().split("T")[0],
          status: "active",
        });
      }
    }
  }, [open, staffMember, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background border-border sm:max-w-lg rounded-md">
        <DialogHeader>
          <DialogTitle className="text-foreground text-xl font-semibold">
            {isEditing ? "Editar Personal" : "Nuevo Personal"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isEditing
              ? "Modifica los datos del miembro del personal y guarda los cambios."
              : "Completa los datos para registrar un nuevo miembro del personal."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 pt-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="firstName" className="text-foreground text-sm font-medium">
                Nombre <span className="text-destructive">*</span>
              </Label>
              <Input
                id="firstName"
                placeholder="Juan"
                className="bg-background border-border rounded-md"
                {...register("firstName")}
              />
              {errors.firstName && (
                <p className="text-destructive text-xs">{errors.firstName.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="lastName" className="text-foreground text-sm font-medium">
                Apellido <span className="text-destructive">*</span>
              </Label>
              <Input
                id="lastName"
                placeholder="Pérez"
                className="bg-background border-border rounded-md"
                {...register("lastName")}
              />
              {errors.lastName && (
                <p className="text-destructive text-xs">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-foreground text-sm font-medium">
                Rol <span className="text-destructive">*</span>
              </Label>
              <Controller
                control={control}
                name="role"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(val) => field.onChange(val as StaffFormData["role"])}
                  >
                    <SelectTrigger className="bg-background border-border rounded-md">
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border rounded-md">
                      {STAFF_ROLES.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.role && (
                <p className="text-destructive text-xs">{errors.role.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="hiredAt" className="text-foreground text-sm font-medium">
                Fecha de contratación <span className="text-destructive">*</span>
              </Label>
              <Input
                id="hiredAt"
                type="date"
                className="bg-background border-border rounded-md"
                {...register("hiredAt")}
              />
              {errors.hiredAt && (
                <p className="text-destructive text-xs">{errors.hiredAt.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone" className="text-foreground text-sm font-medium">
                Teléfono
              </Label>
              <Input
                id="phone"
                placeholder="555-1234"
                className="bg-background border-border rounded-md"
                {...register("phone")}
              />
              {errors.phone && (
                <p className="text-destructive text-xs">{errors.phone.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email" className="text-foreground text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="juan@carwash.com"
                className="bg-background border-border rounded-md"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-destructive text-xs">{errors.email.message}</p>
              )}
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
              {isSubmitting ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear personal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
