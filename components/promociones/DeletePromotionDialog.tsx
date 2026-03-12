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
import type { Promotion } from "@/lib/types";

type DeletePromotionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promotion: Promotion | null;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
};

export default function DeletePromotionDialog({
  open,
  onOpenChange,
  promotion,
  onConfirm,
  isDeleting,
}: DeletePromotionDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-card border-border">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-foreground">
            ¿Eliminar promoción?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            Estás por eliminar la promoción{" "}
            <span className="font-semibold text-foreground">
              {promotion?.name}
            </span>
            . Esta acción no se puede deshacer directamente, pero podrás restaurarla con el botón
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
