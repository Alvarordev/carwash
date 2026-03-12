"use client";

import { useState } from "react";
import { toast } from "sonner";
import { EditPencil, Trash, Plus } from "iconoir-react";
import { useExpenseCategories } from "@/lib/hooks/useExpenseCategories";
import type { ExpenseCategory } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ExpenseCategoryFormDialog } from "./ExpenseCategoryFormDialog";
import { DeleteExpenseCategoryDialog } from "./DeleteExpenseCategoryDialog";

interface ExpenseCategoryFormValues {
  name: string;
  description?: string | null;
}

export function ExpenseCategoriesSection() {
  const {
    expenseCategories,
    loading,
    createExpenseCategory,
    updateExpenseCategory,
    updateExpenseCategoryStatus,
    deleteExpenseCategory,
  } = useExpenseCategories();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<ExpenseCategory | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  function handleOpenCreate() {
    setEditingCategory(null);
    setDialogOpen(true);
  }

  function handleOpenEdit(category: ExpenseCategory) {
    setEditingCategory(category);
    setDialogOpen(true);
  }

  function handleOpenDelete(category: ExpenseCategory) {
    setDeletingCategory(category);
    setDeleteDialogOpen(true);
  }

  async function handleSubmit(data: ExpenseCategoryFormValues) {
    setIsSubmitting(true);
    try {
      if (editingCategory) {
        await updateExpenseCategory(editingCategory.id, data);
        toast.success("Categoría actualizada");
      } else {
        await createExpenseCategory(data);
        toast.success("Categoría creada");
      }
      setDialogOpen(false);
    } catch {
      toast.error("Error al guardar la categoría");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggle(category: ExpenseCategory) {
    try {
      await updateExpenseCategoryStatus(category.id, !category.isActive);
    } catch {
      toast.error("Error al cambiar el estado");
    }
  }

  async function handleDelete() {
    if (!deletingCategory) return;
    setIsDeleting(true);
    try {
      await deleteExpenseCategory(deletingCategory.id);
      toast.success("Categoría eliminada");
      setDeleteDialogOpen(false);
    } catch {
      toast.error("Error al eliminar la categoría");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="bg-card shadow-sm rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div>
          <h2 className="text-base font-semibold">Categorías de Gastos</h2>
          <p className="text-sm text-muted-foreground">
            Configura las categorías para clasificar los gastos del negocio.
          </p>
        </div>
        <Button size="sm" onClick={handleOpenCreate}>
          <Plus className="size-4 mr-1.5" />
          Agregar
        </Button>
      </div>

      {loading ? (
        <div className="px-6 py-8 text-center text-muted-foreground text-sm">Cargando...</div>
      ) : expenseCategories.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <p className="text-muted-foreground text-sm mb-3">
            No hay categorías de gastos registradas.
          </p>
          <Button size="sm" variant="outline" onClick={handleOpenCreate}>
            <Plus className="size-4 mr-1.5" />
            Agregar categoría
          </Button>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {expenseCategories.map((category) => (
            <div key={category.id} className="flex items-center gap-3 px-6 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{category.name}</p>
                {category.description && (
                  <p className="text-xs text-muted-foreground truncate">{category.description}</p>
                )}
              </div>
              <Switch checked={category.isActive} onCheckedChange={() => handleToggle(category)} />
              <Button size="icon-xs" variant="ghost" onClick={() => handleOpenEdit(category)}>
                <EditPencil className="size-4" />
              </Button>
              <Button
                size="icon-xs"
                variant="ghost"
                className="text-destructive hover:text-destructive"
                onClick={() => handleOpenDelete(category)}
              >
                <Trash className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <ExpenseCategoryFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={editingCategory}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      <DeleteExpenseCategoryDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        category={deletingCategory}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
