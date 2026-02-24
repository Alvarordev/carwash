"use client";

import { useState } from "react";
import { toast } from "sonner";
import { MoreHoriz, Plus, EditPencil, Trash, Minus, Plus as PlusIcon } from "iconoir-react";
import { Button } from "@/components/ui/button";
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
};

const SERVICE_ICONS: Record<ServiceCategory, string> = {
  exterior: "🚗",
  interior: "🧹",
  detalle: "✨",
  añadido: "➕",
};

export default function ServiceCard({ service, onEdit, onDelete }: ServiceCardProps) {
  const { toggleServiceStatus } = useServices();
  const { getPricingsByService, createPricing, updatePricing, deletePricing } = useServicePricings();
  const { vehicleTypes } = useVehicleTypes();

  const [isExpanded, setIsExpanded] = useState(false);
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
        className="bg-card/80 rounded-lg border border-border overflow-hidden cursor-pointer transition-all duration-200 hover:border-primary/30"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl shrink-0">
              {SERVICE_ICONS[service.category]}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-foreground truncate">
                {service.name}
              </h3>
              <p className="text-sm text-muted-foreground truncate">
                {service.description ?? "Sin descripción"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className={`px-3 h-8 rounded-md text-xs font-medium transition-colors ${service.status === "active"
                  ? "bg-primary text-background hover:bg-primary/90"
                  : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              onClick={(e) => {
                e.stopPropagation();
                handleToggleStatus();
              }}
            >
              {service.status === "active" ? "Active" : "Inactive"}
            </Button>

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
