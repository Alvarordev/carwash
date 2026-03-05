"use client";

import { useEffect, useState } from "react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Car, Droplet, Star, Soap, Leaf, Flash, SunLight, Wind, Wrench, Tools, Shield, FireFlame, BrightStar,
  NavArrowDown, Check,
} from "iconoir-react";
import { serviceSchema, SERVICE_CATEGORIES, SERVICE_ICONS, type ServiceFormData } from "@/lib/schemas/service";
import type { Service } from "@/lib/types";

const ICON_COMPONENTS: Record<string, React.ReactElement> = {
  car: <Car className="w-5 h-5" />,
  droplet: <Droplet className="w-5 h-5" />,
  star: <Star className="w-5 h-5" />,
  soap: <Soap className="w-5 h-5" />,
  leaf: <Leaf className="w-5 h-5" />,
  flash: <Flash className="w-5 h-5" />,
  sun: <SunLight className="w-5 h-5" />,
  wind: <Wind className="w-5 h-5" />,
  wrench: <Wrench className="w-5 h-5" />,
  tools: <Tools className="w-5 h-5" />,
  shield: <Shield className="w-5 h-5" />,
  flame: <FireFlame className="w-5 h-5" />,
  "bright-star": <BrightStar className="w-5 h-5" />,
};

const COLOR_PALETTE = [
  "#3B82F6", "#06B6D4", "#22C55E", "#10B981", "#84CC16",
  "#A855F7", "#8B5CF6", "#EC4899", "#EF4444", "#F97316",
  "#EAB308", "#F59E0B", "#6B7280", "#0F172A", "#FFFFFF",
];

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
  const [iconOpen, setIconOpen] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);

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
      color: null,
      icon: null,
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
          color: service.color ?? null,
          icon: service.icon ?? null,
        });
      } else {
        reset({
          name: "",
          description: "",
          category: "exterior",
          status: "active",
          color: null,
          icon: null,
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
                Ícono
              </Label>
              <Controller
                control={control}
                name="icon"
                render={({ field }) => {
                  const selected = SERVICE_ICONS.find((i) => i.value === field.value);
                  return (
                    <DropdownMenu open={iconOpen} onOpenChange={setIconOpen}>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full justify-between bg-card border-border rounded-md font-normal"
                        >
                          <span className="flex items-center gap-2">
                            {selected ? (
                              <>
                                {ICON_COMPONENTS[selected.value]}
                                <span>{selected.label}</span>
                              </>
                            ) : (
                              <span className="text-muted-foreground">Elige un ícono</span>
                            )}
                          </span>
                          <NavArrowDown className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-card border-border rounded-md p-2 w-[220px]">
                        <div className="grid grid-cols-4 gap-1">
                          {SERVICE_ICONS.map((icon) => (
                            <button
                              key={icon.value}
                              type="button"
                              onClick={() => {
                                field.onChange(icon.value);
                                setIconOpen(false);
                              }}
                              className={`flex flex-col items-center justify-center gap-1 w-14 h-14 rounded-md text-xs transition-colors hover:bg-accent ${field.value === icon.value ? "bg-accent ring-1 ring-primary" : ""}`}
                            >
                              {ICON_COMPONENTS[icon.value]}
                              <span className="leading-tight text-center text-[10px]">{icon.label}</span>
                            </button>
                          ))}
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  );
                }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-foreground text-sm font-medium">
                Color
              </Label>
              <Controller
                control={control}
                name="color"
                render={({ field }) => (
                  <DropdownMenu open={colorOpen} onOpenChange={setColorOpen}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-between bg-card border-border rounded-md font-normal"
                      >
                        <span className="flex items-center gap-2">
                          {field.value ? (
                            <>
                              <span
                                className="w-5 h-5 rounded-full border border-border shrink-0"
                                style={{ backgroundColor: field.value }}
                              />
                              <span className="font-mono text-sm">{field.value}</span>
                            </>
                          ) : (
                            <>
                              <span className="w-5 h-5 rounded-full border border-border shrink-0" />
                              <span className="text-muted-foreground">Elige un color</span>
                            </>
                          )}
                        </span>
                        <NavArrowDown className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-card border-border rounded-md p-3 w-[180px]">
                      <div className="grid grid-cols-5 gap-2">
                        {COLOR_PALETTE.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => {
                              field.onChange(color);
                              setColorOpen(false);
                            }}
                            className="relative w-7 h-7 rounded-full border border-border transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary"
                            style={{ backgroundColor: color }}
                            title={color}
                          >
                            {field.value === color && (
                              <Check
                                className="absolute inset-0 m-auto w-3.5 h-3.5"
                                style={{ color: color === "#FFFFFF" || color === "#EAB308" || color === "#84CC16" ? "#000" : "#fff" }}
                              />
                            )}
                          </button>
                        ))}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              />
            </div>
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
