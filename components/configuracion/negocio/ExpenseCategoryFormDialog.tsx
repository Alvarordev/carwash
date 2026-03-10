"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ExpenseCategory } from "@/lib/types";
import { expenseCategorySchema, type ExpenseCategoryFormData } from "@/lib/schemas/expenseCategory";
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
import { Textarea } from "@/components/ui/textarea";

interface ExpenseCategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: ExpenseCategory | null;
  onSubmit: (data: ExpenseCategoryFormData) => Promise<void>;
  isSubmitting: boolean;
}

export function ExpenseCategoryFormDialog({
  open,
  onOpenChange,
  category,
  onSubmit,
  isSubmitting,
}: ExpenseCategoryFormDialogProps) {
  const isEditing = !!category;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExpenseCategoryFormData>({
    resolver: zodResolver(expenseCategorySchema),
    defaultValues: { name: "", description: "" },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: category?.name ?? "",
        description: category?.description ?? "",
      });
    }
  }, [open, category, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar categoría de gasto" : "Agregar categoría de gasto"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifica los datos de la categoría."
              : "Ingresa los datos de la nueva categoría."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nombre</Label>
            <Input {...register("name")} placeholder="Ej: Agua y luz" />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Descripción (opcional)</Label>
            <Textarea {...register("description")} placeholder="Descripción breve..." rows={3} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
