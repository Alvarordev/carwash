"use client";

import { useState } from "react";
import { toast } from "sonner";
import { EditPencil, Trash, Plus } from "iconoir-react";
import { usePaymentMethods } from "@/lib/hooks/usePaymentMethods";
import type { PaymentMethod } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { PaymentMethodFormDialog } from "./PaymentMethodFormDialog";
import { DeletePaymentMethodDialog } from "./DeletePaymentMethodDialog";

interface PaymentMethodFormValues {
  name: string;
  description?: string | null;
}

export function PaymentMethodsSection() {
  const {
    paymentMethods,
    loading,
    createPaymentMethod,
    updatePaymentMethod,
    updatePaymentMethodStatus,
    deletePaymentMethod,
  } = usePaymentMethods();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingMethod, setDeletingMethod] = useState<PaymentMethod | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  function handleOpenCreate() {
    setEditingMethod(null);
    setDialogOpen(true);
  }

  function handleOpenEdit(pm: PaymentMethod) {
    setEditingMethod(pm);
    setDialogOpen(true);
  }

  function handleOpenDelete(pm: PaymentMethod) {
    setDeletingMethod(pm);
    setDeleteDialogOpen(true);
  }

  async function handleSubmit(data: PaymentMethodFormValues) {
    setIsSubmitting(true);
    try {
      if (editingMethod) {
        await updatePaymentMethod(editingMethod.id, data);
        toast.success("Método de pago actualizado");
      } else {
        await createPaymentMethod(data);
        toast.success("Método de pago creado");
      }
      setDialogOpen(false);
    } catch {
      toast.error("Error al guardar el método de pago");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggle(pm: PaymentMethod) {
    try {
      await updatePaymentMethodStatus(pm.id, !pm.isActive);
    } catch {
      toast.error("Error al cambiar el estado");
    }
  }

  async function handleDelete() {
    if (!deletingMethod) return;
    setIsDeleting(true);
    try {
      await deletePaymentMethod(deletingMethod.id);
      toast.success("Método de pago eliminado");
      setDeleteDialogOpen(false);
    } catch {
      toast.error("Error al eliminar el método de pago");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div>
          <h2 className="text-base font-semibold">Métodos de Pago</h2>
          <p className="text-sm text-muted-foreground">
            Configura los métodos de pago aceptados.
          </p>
        </div>
        <Button size="sm" onClick={handleOpenCreate}>
          <Plus className="size-4 mr-1.5" />
          Agregar
        </Button>
      </div>

      {loading ? (
        <div className="px-6 py-8 text-center text-muted-foreground text-sm">Cargando...</div>
      ) : paymentMethods.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <p className="text-muted-foreground text-sm mb-3">
            No hay métodos de pago registrados.
          </p>
          <Button size="sm" variant="outline" onClick={handleOpenCreate}>
            <Plus className="size-4 mr-1.5" />
            Agregar método
          </Button>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {paymentMethods.map((pm) => (
            <div key={pm.id} className="flex items-center gap-3 px-6 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{pm.name}</p>
                {pm.description && (
                  <p className="text-xs text-muted-foreground truncate">{pm.description}</p>
                )}
              </div>
              <Switch checked={pm.isActive} onCheckedChange={() => handleToggle(pm)} />
              <Button size="icon-xs" variant="ghost" onClick={() => handleOpenEdit(pm)}>
                <EditPencil className="size-4" />
              </Button>
              <Button
                size="icon-xs"
                variant="ghost"
                className="text-destructive hover:text-destructive"
                onClick={() => handleOpenDelete(pm)}
              >
                <Trash className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <PaymentMethodFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        paymentMethod={editingMethod}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      <DeletePaymentMethodDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        paymentMethod={deletingMethod}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
