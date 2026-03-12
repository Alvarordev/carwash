"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Vehicle } from "@/lib/types";

type DeleteVehicleDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle: Vehicle | null;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
};

export default function DeleteVehicleDialog({
  open,
  onOpenChange,
  vehicle,
  onConfirm,
  isDeleting,
}: DeleteVehicleDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-card border-border">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-foreground">
            ¿Eliminar vehículo?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            Estás por eliminar el vehículo{" "}
            <span className="font-semibold text-foreground">
              {vehicle?.brand} {vehicle?.model} — {vehicle?.plate}
            </span>
            . Esta acción no se puede deshacer directamente, pero podrás restaurarlo con el botón
            deshacer del aviso.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            className="border-border text-foreground hover:bg-muted"
            disabled={isDeleting}
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            className="bg-destructive text-foreground hover:bg-destructive/90"
            disabled={isDeleting}
          >
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
