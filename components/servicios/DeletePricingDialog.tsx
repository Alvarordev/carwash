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
import type { ServicePricing } from "@/lib/types";

type DeletePricingDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pricing: ServicePricing | null;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
};

export default function DeletePricingDialog({
  open,
  onOpenChange,
  onConfirm,
  isDeleting,
}: DeletePricingDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-card border-border">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-foreground">
            ¿Eliminar precio?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            Estás por eliminar el precio de este servicio para el tipo de vehículo seleccionado.
            Esta acción no se puede deshacer.
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
            className="bg-destructive text-white hover:bg-destructive/90"
            disabled={isDeleting}
          >
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
