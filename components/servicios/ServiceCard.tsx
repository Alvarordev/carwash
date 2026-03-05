"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { MoreHoriz, Plus, EditPencil, Trash, Minus, Plus as PlusIcon, Car, PageSearch, ReportColumns, Droplet, Star, Soap, Leaf, Flash, SunLight, Wind, Wrench, Tools, Shield, FireFlame, BrightStar } from "iconoir-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useServices } from "@/lib/hooks/useServices";
import { useServicePricings } from "@/lib/hooks/useServicePricings";
import { useVehicleTypes } from "@/lib/hooks/useVehicleTypes";
import type { Service, ServicePricing, ServiceCategory } from "@/lib/types";
import PricingCard from "./PricingCard";
import PricingFormDialog from "./PricingFormDialog";
import DeletePricingDialog from "./DeletePricingDialog";

type ServiceCardProps = {
  service: Service;
  onEdit: (service: Service) => void;
  onDelete: (service: Service) => void;
  initiallyExpanded?: boolean;
};

const CATEGORY_ICONS: Record<ServiceCategory, React.ReactElement> = {
  exterior: <Car className="w-5 h-5" />,
  interior: <PageSearch className="w-5 h-5" />,
  detalle: <ReportColumns className="w-5 h-5" />,
  añadido: <PlusIcon className="w-5 h-5" />,
};

const ICON_MAP: Record<string, React.ReactElement> = {
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

function getServiceIcon(service: Service): React.ReactElement {
  if (service.icon && ICON_MAP[service.icon]) return ICON_MAP[service.icon];
  return CATEGORY_ICONS[service.category];
}

export default function ServiceCard({ service, onEdit, onDelete, initiallyExpanded = false }: ServiceCardProps) {
  const { toggleServiceStatus } = useServices();
  const { getPricingsByService, createPricing, updatePricing, deletePricing } = useServicePricings();
  const { vehicleTypes } = useVehicleTypes();

  const [isExpanded, setIsExpanded] = useState(initiallyExpanded ?? false);
  const [localStatus, setLocalStatus] = useState<Service["status"]>(service.status);
  const [isToggling, setIsToggling] = useState(false);
  useEffect(() => { setLocalStatus(service.status); }, [service.status]);
  const [pricingDialogOpen, setPricingDialogOpen] = useState(false);
  const [editingPricing, setEditingPricing] = useState<ServicePricing | null>(null);
  const [deletePricingDialogOpen, setDeletePricingDialogOpen] = useState(false);
  const [deletingPricing, setDeletingPricing] = useState<ServicePricing | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const servicePricings = getPricingsByService(service.id);
  const existingVehicleTypeIds = servicePricings.map((p) => p.vehicleTypeId);

  const handleToggleStatus = async () => {
    try {
      await toggleServiceStatus(service.id);
      toast.success(
        service.status === "active" ? "Servicio desactivado" : "Servicio activado"
      );
    } catch {
      toast.error("Error al cambiar el estado del servicio");
    }
  };

  const handleCreatePricing = async (data: { serviceId: string; vehicleTypeId: string; price: number; status: "active" | "inactive" }) => {
    setIsSubmitting(true);
    try {
      await createPricing(data);
      toast.success("Precio agregado");
      setPricingDialogOpen(false);
    } catch {
      toast.error("Error al agregar el precio");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePricing = async (data: { serviceId: string; vehicleTypeId: string; price: number; status: "active" | "inactive" }) => {
    if (!editingPricing) return;
    setIsSubmitting(true);
    try {
      await updatePricing(editingPricing.id, data);
      toast.success("Precio actualizado");
      setPricingDialogOpen(false);
      setEditingPricing(null);
    } catch {
      toast.error("Error al actualizar el precio");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePricing = async () => {
    if (!deletingPricing) return;
    setIsSubmitting(true);
    try {
      await deletePricing(deletingPricing.id);
      toast.success("Precio eliminado");
      setDeletePricingDialogOpen(false);
      setDeletingPricing(null);
    } catch {
      toast.error("Error al eliminar el precio");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePrice = async (id: string, price: number) => {
    try {
      await updatePricing(id, { price });
      toast.success("Precio actualizado");
    } catch {
      toast.error("Error al actualizar el precio");
    }
  };

  return (
    <>
       <div
         className="bg-card shadow-xl rounded-xl border border-border overflow-hidden cursor-pointer transition-all duration-200 hover:border-primary/30 hover:shadow-2xl"
         onClick={() => setIsExpanded(!isExpanded)}
       >
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0${service.color ? "" : " bg-primary/10 text-primary"}`}
              style={service.color ? { backgroundColor: `${service.color}1A`, color: service.color } : undefined}
            >
              {getServiceIcon(service)}
            </div>
             <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-foreground truncate">
                  {service.name}
                </h3>
                {/* Category pill/tag */}
                <Badge variant="secondary" className="text-xs font-semibold capitalize mr-2">
                  {service.category}
                </Badge>
              </div>
              {/* Subtitle or detail pill for 'detalle' or 'añadido' */}
              {(service.category === "detalle" || service.category === "añadido") && (
                <Badge variant="outline" className="text-xs">
                  {service.category === "detalle" ? "Especialidad" : "Extra"}
                </Badge>
              )}

              <p className="text-sm text-muted-foreground truncate mt-1">
                {service.description ?? "Sin descripción"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div onClick={e => e.stopPropagation()} className="flex items-center">
               <Switch
                 checked={localStatus === "active"}
                 size="default"
                 disabled={isToggling}
                 onCheckedChange={async (checked) => {
                   setIsToggling(true);
                   setLocalStatus(checked ? "active" : "inactive");
                   try {
                     await handleToggleStatus();
                   } finally {
                     setIsToggling(false);
                   }
                 }}
                 aria-label="Alternar estado"
                 className="mr-2"
               />
<span className={`text-xs font-medium ${localStatus === "active" ? "text-primary" : "text-muted-foreground"}`}>
                 {localStatus === "active" ? "Activo" : "Inactivo"}
               </span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md">
                  <MoreHoriz className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover border-border rounded-md">
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(service);
                  }}
                >
                  <EditPencil className="w-4 h-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(service);
                  }}
                >
                  <Trash className="w-4 h-4 mr-2" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md">
              {isExpanded ? (
                <Minus className="h-4 w-4" />
              ) : (
                <PlusIcon className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {isExpanded && (
          <div className="px-4 pb-4" onClick={(e) => e.stopPropagation()}>
            <div className="py-5 bg-background px-6 rounded-sm">
              <h4 className="text-xs font-bold text-muted-foreground mb-4">
                PRECIO POR TIPO DE VEHÍCULO
              </h4>

              <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
                {servicePricings.map((pricing) => (
                  <PricingCard
                    key={pricing.id}
                    pricing={pricing}
                    vehicleType={vehicleTypes.find((v) => v.id === pricing.vehicleTypeId)}
                    onUpdatePrice={handleUpdatePrice}
                    onEdit={(p) => {
                      setEditingPricing(p);
                      setPricingDialogOpen(true);
                    }}
                    onDelete={(p) => {
                      setDeletingPricing(p);
                      setDeletePricingDialogOpen(true);
                    }}
                  />
                ))}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingPricing(null);
                    setPricingDialogOpen(true);
                  }}
                  className="flex flex-col items-center justify-center p-4 rounded-lg min-w-30 max-w-35 bg-transparent border border-dashed border-border text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors"
                >
                  <Plus className="w-5 h-5 mb-1" />
                  <span className="text-xs">Agregar</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <PricingFormDialog
        open={pricingDialogOpen}
        onOpenChange={(open) => {
          setPricingDialogOpen(open);
          if (!open) setEditingPricing(null);
        }}
        serviceId={service.id}
        pricing={editingPricing}
        onSubmit={editingPricing ? handleUpdatePricing : handleCreatePricing}
        isSubmitting={isSubmitting}
        existingVehicleTypeIds={existingVehicleTypeIds}
      />

      <DeletePricingDialog
        open={deletePricingDialogOpen}
        onOpenChange={setDeletePricingDialogOpen}
        pricing={deletingPricing}
        onConfirm={handleDeletePricing}
        isDeleting={isSubmitting}
      />
    </>
  );
}
