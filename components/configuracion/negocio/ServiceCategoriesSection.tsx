"use client";

import { useState } from "react";
import { toast } from "sonner";
import { EditPencil, Plus } from "iconoir-react";
import { useServiceCategories } from "@/lib/hooks/useServiceCategories";
import type { ServiceCategory } from "@/lib/types/service";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ServiceCategoryFormDialog } from "./ServiceCategoryFormDialog";

interface CategoryFormValues {
  name: string;
  description?: string | null;
}

export function ServiceCategoriesSection() {
  const { allCategories, loading, createCategory, updateCategory, toggleCategoryStatus } =
    useServiceCategories();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleOpenCreate() {
    setEditingCategory(null);
    setDialogOpen(true);
  }

  function handleOpenEdit(cat: ServiceCategory) {
    setEditingCategory(cat);
    setDialogOpen(true);
  }

  async function handleSubmit(data: CategoryFormValues) {
    setIsSubmitting(true);
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, data);
        toast.success("Categoría actualizada");
      } else {
        await createCategory(data);
        toast.success("Categoría creada");
      }
      setDialogOpen(false);
    } catch {
      toast.error("Error al guardar la categoría");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggle(cat: ServiceCategory) {
    try {
      await toggleCategoryStatus(cat.id, cat.status);
    } catch {
      toast.error("Error al cambiar el estado");
    }
  }

  return (
    <div className="bg-card shadow-sm rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div>
          <h2 className="text-base font-semibold">Categorías de Servicios</h2>
          <p className="text-sm text-muted-foreground">
            Administra las categorías para organizar tus servicios.
          </p>
        </div>
        <Button size="sm" onClick={handleOpenCreate}>
          <Plus className="size-4 mr-1.5" />
          Agregar
        </Button>
      </div>

      {loading ? (
        <div className="px-6 py-8 text-center text-muted-foreground text-sm">Cargando...</div>
      ) : allCategories.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <p className="text-muted-foreground text-sm mb-3">
            No hay categorías registradas.
          </p>
          <Button size="sm" variant="outline" onClick={handleOpenCreate}>
            <Plus className="size-4 mr-1.5" />
            Agregar categoría
          </Button>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {allCategories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-3 px-6 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{cat.name}</p>
                {cat.description && (
                  <p className="text-xs text-muted-foreground truncate">{cat.description}</p>
                )}
              </div>
              <Switch checked={cat.status === "active"} onCheckedChange={() => handleToggle(cat)} />
              <Button size="icon-xs" variant="ghost" onClick={() => handleOpenEdit(cat)}>
                <EditPencil className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <ServiceCategoryFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={editingCategory}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
