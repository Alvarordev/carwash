"use client";

import type { ExpenseCategory } from "@/lib/types";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface DeleteExpenseCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: ExpenseCategory | null;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

export function DeleteExpenseCategoryDialog({
  open,
  onOpenChange,
  category,
  onConfirm,
  isDeleting,
}: DeleteExpenseCategoryDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar categoría de gasto?</AlertDialogTitle>
          <AlertDialogDescription>
            Estás por eliminar{" "}
            <span className="font-semibold text-foreground">
              {category?.name ?? ""}
            </span>
            . Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-white hover:bg-destructive/90"
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isDeleting}
          >
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
