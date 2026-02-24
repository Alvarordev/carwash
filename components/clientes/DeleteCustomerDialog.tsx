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
import type { Customer } from "@/lib/types";

type DeleteCustomerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
};

export default function DeleteCustomerDialog({
  open,
  onOpenChange,
  customer,
  onConfirm,
  isDeleting,
}: DeleteCustomerDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-card border-border">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-foreground">
            ¿Eliminar cliente?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            Estás por eliminar al cliente{" "}
            <span className="font-semibold text-foreground">
              {customer?.firstName} {customer?.lastName}
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
