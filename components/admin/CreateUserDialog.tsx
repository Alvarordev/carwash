"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
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
import { createUserSchema, type CreateUserFormData } from "@/lib/schemas/admin";
import { createUser } from "@/lib/actions/admin";
import type { Company } from "@/lib/types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companies: Company[];
  onSuccess: () => void;
};

export default function CreateUserDialog({ open, onOpenChange, companies, onSuccess }: Props) {
  const [isNewCompany, setIsNewCompany] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "operator",
      companyId: undefined,
      newCompanyName: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    reset({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "operator",
      companyId: undefined,
      newCompanyName: "",
    });
    setIsNewCompany(false);
  }, [open, reset]);

  const onSubmit = async (data: CreateUserFormData) => {
    setIsSubmitting(true);
    try {
      const result = await createUser(data);
      if (!result.success) {
        toast.error("Error al crear el usuario", { description: result.error });
        return;
      }
      toast.success("Usuario creado", {
        description: `${data.firstName} ${data.lastName} — ${data.email}`,
      });
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error("Error inesperado al crear el usuario.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background border-border sm:max-w-lg rounded-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground text-xl font-semibold">
            Nuevo usuario
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Crea un usuario y asígnalo a una empresa existente o crea una nueva.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 pt-1">
          {/* Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="firstName" className="text-foreground text-sm font-medium">
                Nombre <span className="text-destructive">*</span>
              </Label>
              <Input
                id="firstName"
                placeholder="Ana"
                className="bg-card border-border rounded-md"
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
                placeholder="García"
                className="bg-card border-border rounded-md"
                {...register("lastName")}
              />
              {errors.lastName && (
                <p className="text-destructive text-xs">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          {/* Credentials */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email" className="text-foreground text-sm font-medium">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="ana@carwash.com"
                className="bg-card border-border rounded-md"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-destructive text-xs">{errors.email.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password" className="text-foreground text-sm font-medium">
                Contraseña <span className="text-destructive">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 8 caracteres"
                className="bg-card border-border rounded-md"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-destructive text-xs">{errors.password.message}</p>
              )}
            </div>
          </div>

          {/* Role */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-foreground text-sm font-medium">Rol</Label>
            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="bg-card border-border rounded-md">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border rounded-md">
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="operator">Operador</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Company */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label className="text-foreground text-sm font-medium">
                Empresa <span className="text-destructive">*</span>
              </Label>
              <button
                type="button"
                onClick={() => {
                  setIsNewCompany((v) => !v);
                  setValue("companyId", undefined);
                  setValue("newCompanyName", "");
                }}
                className="text-xs text-primary underline underline-offset-2 cursor-pointer"
              >
                {isNewCompany ? "Seleccionar existente" : "Crear nueva empresa"}
              </button>
            </div>

            {isNewCompany ? (
              <div className="flex flex-col gap-1.5">
                <Input
                  placeholder="Nombre de la nueva empresa"
                  className="bg-card border-border rounded-md"
                  {...register("newCompanyName")}
                />
                {errors.newCompanyName && (
                  <p className="text-destructive text-xs">{errors.newCompanyName.message}</p>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                <Controller
                  control={control}
                  name="companyId"
                  render={({ field }) => (
                    <Select value={field.value ?? ""} onValueChange={field.onChange}>
                      <SelectTrigger className="bg-card border-border rounded-md">
                        <SelectValue placeholder="Seleccionar empresa" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border rounded-md">
                        {companies.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.companyId && (
                  <p className="text-destructive text-xs">{errors.companyId.message}</p>
                )}
              </div>
            )}
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
              {isSubmitting ? "Creando..." : "Crear usuario"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
