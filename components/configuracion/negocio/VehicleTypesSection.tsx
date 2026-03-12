"use client";

import { useState } from "react";
import { toast } from "sonner";
import { EditPencil, Plus } from "iconoir-react";
import { useVehicleTypes } from "@/lib/hooks/useVehicleTypes";
import type { VehicleType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { VehicleTypeFormDialog } from "./VehicleTypeFormDialog";

interface VehicleTypeFormValues {
  name: string;
  description?: string | null;
}

export function VehicleTypesSection() {
  const { allVehicleTypes, loading, createVehicleType, updateVehicleType, toggleVehicleTypeStatus } =
    useVehicleTypes();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<VehicleType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleOpenCreate() {
    setEditingType(null);
    setDialogOpen(true);
  }

  function handleOpenEdit(vt: VehicleType) {
    setEditingType(vt);
    setDialogOpen(true);
  }

  async function handleSubmit(data: VehicleTypeFormValues) {
    setIsSubmitting(true);
    try {
      if (editingType) {
        await updateVehicleType(editingType.id, data);
        toast.success("Tipo de vehículo actualizado");
      } else {
        await createVehicleType(data);
        toast.success("Tipo de vehículo creado");
      }
      setDialogOpen(false);
    } catch {
      toast.error("Error al guardar el tipo de vehículo");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggle(vt: VehicleType) {
    try {
      await toggleVehicleTypeStatus(vt.id, vt.status);
    } catch {
      toast.error("Error al cambiar el estado");
    }
  }

  return (
    <div className="bg-card shadow-sm rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div>
          <h2 className="text-base font-semibold">Tipos de Vehículos</h2>
          <p className="text-sm text-muted-foreground">
            Administra los tipos de vehículos disponibles.
          </p>
        </div>
        <Button size="sm" onClick={handleOpenCreate}>
          <Plus className="size-4 mr-1.5" />
          Agregar
        </Button>
      </div>

      {loading ? (
        <div className="px-6 py-8 text-center text-muted-foreground text-sm">Cargando...</div>
      ) : allVehicleTypes.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <p className="text-muted-foreground text-sm mb-3">
            No hay tipos de vehículos registrados.
          </p>
          <Button size="sm" variant="outline" onClick={handleOpenCreate}>
            <Plus className="size-4 mr-1.5" />
            Agregar tipo
          </Button>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {allVehicleTypes.map((vt) => (
            <div key={vt.id} className="flex items-center gap-3 px-6 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{vt.name}</p>
                {vt.description && (
                  <p className="text-xs text-muted-foreground truncate">{vt.description}</p>
                )}
              </div>
              <Switch checked={vt.status === "active"} onCheckedChange={() => handleToggle(vt)} />
              <Button size="icon-xs" variant="ghost" onClick={() => handleOpenEdit(vt)}>
                <EditPencil className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <VehicleTypeFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        vehicleType={editingType}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
