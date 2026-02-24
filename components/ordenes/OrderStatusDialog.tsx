"use client";

import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Order, OrderStatus } from "@/lib/types/order";

const reasonSchema = z.string().min(5, "Proporcione una razón (min 5 caracteres)");

export default function OrderStatusDialog({
  open,
  onOpenChange,
  order,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  order: Order | null;
  onConfirm: (status: OrderStatus, reason?: string) => Promise<void>;
}) {
  const [status, setStatus] = useState<OrderStatus | undefined>(undefined);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!order) return null;

  const handleSave = async () => {
    if (!status) return;
    if (status === "Cancelado") {
      const parsed = reasonSchema.safeParse(reason);
      if (!parsed.success) {
        toast.error(parsed.error.errors[0].message);
        return;
      }
    }
    setIsSubmitting(true);
    try {
      await onConfirm(status, status === "Cancelado" ? reason : undefined);
      onOpenChange(false);
    } catch {
      // handled by hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const disableCancel = order.status === "Entregado";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cambiar estado - {order.orderNumber}</DialogTitle>
        </DialogHeader>

        <div className="py-2">
          <Select onValueChange={(v) => setStatus(v as OrderStatus)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={order.status} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pendiente">Pendiente</SelectItem>
              <SelectItem value="En Proceso">En Proceso</SelectItem>
              <SelectItem value="Entregado">Entregado</SelectItem>
              <SelectItem value="Cancelado" disabled={disableCancel}>Cancelado</SelectItem>
            </SelectContent>
          </Select>

          {status === "Cancelado" && (
            <div className="mt-3">
              <Textarea placeholder="Razón de cancelación" value={reason} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReason(e.target.value)} />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancelar</Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
