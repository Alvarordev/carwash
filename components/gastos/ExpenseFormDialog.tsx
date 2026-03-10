"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Expense, ExpenseCategory, StaffMember } from "@/lib/types";
import { expenseSchema, type ExpenseFormData } from "@/lib/schemas/expense";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ExpenseFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense?: Expense | null;
  categories: ExpenseCategory[];
  staffMembers: StaffMember[];
  onSubmit: (data: ExpenseFormData) => Promise<void>;
  isSubmitting: boolean;
};

export default function ExpenseFormDialog({
  open,
  onOpenChange,
  expense,
  categories,
  staffMembers,
  onSubmit,
  isSubmitting,
}: ExpenseFormDialogProps) {
  const isEditing = !!expense;
  const today = new Date().toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      detail: "",
      categoryId: "",
      staffMemberId: null,
      amount: 0,
      date: today,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        detail: expense?.detail ?? "",
        categoryId: expense?.categoryId ?? "",
        staffMemberId: expense?.staffMemberId ?? null,
        amount: expense?.amount ?? 0,
        date: expense?.date ?? today,
      });
    }
  }, [open, expense, reset, today]);

  const activeCategories = categories.filter((c) => c.isActive);
  const activeStaff = staffMembers.filter((s) => s.status === "active");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background border-border sm:max-w-lg rounded-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground text-xl font-semibold">
            {isEditing ? "Editar Gasto" : "Nuevo Gasto"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isEditing
              ? "Modifica los datos del gasto y guarda los cambios."
              : "Completa los datos para registrar un nuevo gasto."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 pt-1">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="detail" className="text-foreground text-sm font-medium">
              Detalle <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="detail"
              placeholder="Ej: Pago de factura de agua"
              className="bg-card border-border rounded-md"
              rows={3}
              {...register("detail")}
            />
            {errors.detail && (
              <p className="text-destructive text-xs">{errors.detail.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-foreground text-sm font-medium">
                Categoría <span className="text-destructive">*</span>
              </Label>
              <Controller
                control={control}
                name="categoryId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="bg-card border-border rounded-md w-full">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border rounded-md">
                      {activeCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.categoryId && (
                <p className="text-destructive text-xs">{errors.categoryId.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-foreground text-sm font-medium">Personal (opcional)</Label>
              <Controller
                control={control}
                name="staffMemberId"
                render={({ field }) => (
                  <Select
                    value={field.value ?? "none"}
                    onValueChange={(val) => field.onChange(val === "none" ? null : val)}
                  >
                    <SelectTrigger className="bg-card border-border rounded-md w-full">
                      <SelectValue placeholder="Ninguno" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border rounded-md">
                      <SelectItem value="none">Ninguno</SelectItem>
                      {activeStaff.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.firstName} {member.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="amount" className="text-foreground text-sm font-medium">
                Monto <span className="text-destructive">*</span>
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                className="bg-card border-border rounded-md"
                {...register("amount")}
              />
              {errors.amount && (
                <p className="text-destructive text-xs">{errors.amount.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="date" className="text-foreground text-sm font-medium">
                Fecha <span className="text-destructive">*</span>
              </Label>
              <Input
                id="date"
                type="date"
                className="bg-card border-border rounded-md"
                {...register("date")}
              />
              {errors.date && (
                <p className="text-destructive text-xs">{errors.date.message}</p>
              )}
            </div>
          </div>

          <DialogFooter className="mt-2 gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-border rounded-md"
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear gasto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
