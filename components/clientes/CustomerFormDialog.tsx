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
import { customerSchema, type CustomerFormData, DOC_TYPES } from "@/lib/schemas/customer";
import { useVehicles } from "@/lib/hooks/useVehicles";
import { useVehicleTypes } from "@/lib/hooks/useVehicleTypes";
import { useCustomers } from "@/lib/hooks/useCustomers";
import type { Customer } from "@/lib/types";

type CustomerFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: Customer | null;
  onSubmit: (data: CustomerFormData) => Promise<void>;
  isSubmitting: boolean;
};

export default function CustomerFormDialog({
  open,
  onOpenChange,
  customer,
  onSubmit,
  isSubmitting,
}: CustomerFormDialogProps) {
  const { vehicles } = useVehicles();
  const { vehicleTypes } = useVehicleTypes();
  const { getCustomerVehicleIds } = useCustomers();
  const [loadingVehicleIds, setLoadingVehicleIds] = useState(false);
  const [vehicleSearch, setVehicleSearch] = useState("");
  const isEditing = !!customer;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    control,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      docType: null,
      docNumber: "",
      phone: "",
      email: "",
      status: "active",
      vehicleIds: [],
    },
  });

  useEffect(() => {
    if (!open) return;
    setVehicleSearch("");

    const loadDefaults = async () => {
      if (customer) {
        setLoadingVehicleIds(true);
        const vehicleIds = await getCustomerVehicleIds(customer.id);
        setLoadingVehicleIds(false);
        reset({
          firstName: customer.firstName,
          lastName: customer.lastName,
          docType: customer.docType ?? null,
          docNumber: customer.docNumber ?? "",
          phone: customer.phone ?? "",
          email: customer.email ?? "",
          status: customer.status,
          vehicleIds,
        });
      } else {
        reset({
          firstName: "",
          lastName: "",
          docType: null,
          docNumber: "",
          phone: "",
          email: "",
          status: "active",
          vehicleIds: [],
        });
      }
    };

    loadDefaults();
  }, [open, customer, reset, getCustomerVehicleIds]);

  const watchVehicleIds = watch("vehicleIds") ?? [];

  const toggleVehicle = (vehicleId: string) => {
    const updated = watchVehicleIds.includes(vehicleId)
      ? watchVehicleIds.filter((id) => id !== vehicleId)
      : [...watchVehicleIds, vehicleId];
    setValue("vehicleIds", updated, { shouldValidate: true });
  };

  const getTypeName = (typeId: string) =>
    vehicleTypes.find((t) => t.id === typeId)?.name ?? "";

  const filteredVehicles = useMemo(() => {
    const q = vehicleSearch.toLowerCase().trim();
    return vehicles.filter((v) => {
      if (!q) return true;
      const typeName = getTypeName(v.vehicleTypeId).toLowerCase();
      return (
        v.plate.toLowerCase().includes(q) ||
        v.brand.toLowerCase().includes(q) ||
        (v.model ?? "").toLowerCase().includes(q) ||
        typeName.includes(q)
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicles, vehicleTypes, vehicleSearch]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background border-border sm:max-w-lg rounded-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground text-xl font-semibold">
            {isEditing ? "Editar Cliente" : "Nuevo Cliente"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isEditing
              ? "Modifica los datos del cliente y guarda los cambios."
              : "Completa los datos para registrar un nuevo cliente."}
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
                placeholder="Carlos"
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
                placeholder="Mendoza"
                className="bg-card border-border rounded-md"
                {...register("lastName")}
              />
              {errors.lastName && (
                <p className="text-destructive text-xs">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-foreground text-sm font-medium">Tipo de documento</Label>
              <Controller
                control={control}
                name="docType"
                render={({ field }) => (
                  <Select
                    value={field.value ?? ""}
                    onValueChange={(val) =>
                      field.onChange(val === "" ? null : (val as CustomerFormData["docType"]))
                    }
                  >
                    <SelectTrigger className="bg-card border-border rounded-md w-full">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border rounded-md">
                      {DOC_TYPES.map((dt) => (
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
              <Label htmlFor="docNumber" className="text-foreground text-sm font-medium">
                Nro. de documento
              </Label>
              <Input
                id="docNumber"
                placeholder="12345678"
                className="bg-card border-border rounded-md"
                {...register("docNumber")}
              />
              {errors.docNumber && (
                <p className="text-destructive text-xs">{errors.docNumber.message}</p>
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
                placeholder="555-1001"
                className="bg-card border-border rounded-md"
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
                placeholder="cliente@ejemplo.com"
                className="bg-card border-border rounded-md"
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
                  <SelectTrigger className="bg-card border-border rounded-md">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border rounded-md">
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="inactive">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label className="text-foreground text-sm font-medium">Vehículos asociados</Label>
              {watchVehicleIds.length > 0 && (
                <span className="text-xs text-primary font-medium">
                  {watchVehicleIds.length} seleccionado{watchVehicleIds.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Buscar por placa, marca, modelo o tipo..."
                value={vehicleSearch}
                onChange={(e) => setVehicleSearch(e.target.value)}
                className="pl-9 bg-card border-border rounded-md text-sm h-9"
              />
            </div>

            {loadingVehicleIds ? (
              <p className="text-muted-foreground text-xs py-2">Cargando vehículos...</p>
            ) : (
              <div className="flex flex-col gap-0.5 max-h-48 overflow-y-auto rounded-md border border-border">
                {filteredVehicles.length === 0 ? (
                  <p className="text-muted-foreground text-xs px-3 py-4 text-center italic">
                    {vehicleSearch
                      ? "No se encontraron vehículos con esa búsqueda."
                      : "No hay vehículos registrados."}
                  </p>
                ) : (
                  filteredVehicles.map((vehicle) => {
                    const isSelected = watchVehicleIds.includes(vehicle.id);
                    const typeName = getTypeName(vehicle.vehicleTypeId);
                    return (
                      <button
                        key={vehicle.id}
                        type="button"
                        onClick={() => toggleVehicle(vehicle.id)}
                        className={`flex items-center gap-3 px-3 py-2.5 text-sm text-left transition-colors cursor-pointer border-b border-border last:border-b-0 ${isSelected
                          ? "bg-primary/10 hover:bg-primary/15"
                          : "hover:bg-muted"
                          }`}
                      >
                        <span
                          className={`size-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${isSelected ? "bg-primary border-primary" : "border-border"
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
                        <span className="font-mono text-xs font-semibold w-20 shrink-0 text-white">
                          {vehicle.plate}
                        </span>
                        <span className={`flex-1 truncate ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>
                          {vehicle.brand} {vehicle.model}
                        </span>
                        {typeName && (
                          <span className="text-xs text-muted-foreground shrink-0">
                            {typeName}
                          </span>
                        )}
                      </button>
                    );
                  })
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
              {isSubmitting ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear cliente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
