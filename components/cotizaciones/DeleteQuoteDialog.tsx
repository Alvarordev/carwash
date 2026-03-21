"use client";

import type { Quote } from "@/lib/types";
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

type DeleteQuoteDialogProps = Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quote: Quote | null;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}>;

export function DeleteQuoteDialog({
  open,
  onOpenChange,
  quote,
  onConfirm,
  isDeleting,
}: DeleteQuoteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-card border-border">
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar cotización?</AlertDialogTitle>
          <AlertDialogDescription>
            Se eliminará la cotización{" "}
            <span className="font-semibold text-foreground">{quote?.quoteNumber}</span>
            {quote?.clientName ? ` para ${quote.clientName}` : ""}. Esta acción no se puede
            deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
