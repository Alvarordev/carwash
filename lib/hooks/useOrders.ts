"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { Order, OrderItem, OrderStaffAssignment, OrderStatusHistoryEntry } from "@/lib/types/order";
import { createClient } from "@/lib/supabase/client";


function mapOrderItems(rows: Record<string, unknown>[]): OrderItem[] {
  return rows.map((r) => ({
    serviceId: (r.service_id as string) ?? "",
    name: r.service_name as string,
    price: r.unit_price as number,
    quantity: r.quantity as number,
    subtotal: r.subtotal as number,
  }));
}

function mapOrderStaff(rows: Record<string, unknown>[]): OrderStaffAssignment[] {
  return rows.map((r) => ({
    staffId: (r.staff_id as string) ?? "",
    name: r.staff_name as string,
    role: (r.role_snapshot as string) ?? undefined,
  }));
}

function mapStatusHistory(rows: Record<string, unknown>[]): OrderStatusHistoryEntry[] {
  return rows.map((r) => ({
    status: r.status as Order["status"],
    at: r.created_at as string,
    by: (r.changed_by as string) ?? undefined,
    note: (r.note as string) ?? undefined,
  }));
}

function mapOrder(
  row: Record<string, unknown>,
  items: OrderItem[],
  staff: OrderStaffAssignment[],
  statusHistory: OrderStatusHistoryEntry[]
): Order {
  return {
    id: row.id as string,
    orderNumber: row.order_number as string,
    customerId: (row.customer_id as string) ?? undefined,
    customerName: "",   // se resolverá via join en versiones futuras
    vehicleId: (row.vehicle_id as string) ?? undefined,
    vehiclePlate: "",   // idem
    vehicleMakeModel: "",
    items,
    subtotal: row.subtotal as number,
    discounts: (row.discounts as number) ?? 0,
    total: row.total as number,
    status: row.status as Order["status"],
    paymentStatus: (row.payment_status as Order["paymentStatus"]) ?? undefined,
    paymentMethod: (row.payment_method as string) ?? undefined,
    registeredAt: row.created_at as string,
    updatedAt: (row.updated_at as string) ?? undefined,
    cancelReason: (row.cancel_reason as string) ?? null,
    notes: (row.notes as string) ?? undefined,
    staff,
    statusHistory,
  };
}


export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);

      const [
        { data: orderRows, error: oErr },
        { data: itemRows, error: iErr },
        { data: staffRows, error: sErr },
        { data: historyRows, error: hErr },
      ] = await Promise.all([
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
        supabase.from("order_items").select("*"),
        supabase.from("order_staff").select("*"),
        supabase.from("order_status_history").select("*").order("created_at"),
      ]);

      if (oErr) throw new Error(oErr.message);
      if (iErr) throw new Error(iErr.message);
      if (sErr) throw new Error(sErr.message);
      if (hErr) throw new Error(hErr.message);

      type OrderRow = { id: string;[key: string]: unknown };
      type ItemRow = { order_id: string;[key: string]: unknown };

      const mapped = (orderRows ?? []).map((o: OrderRow) => {
        const oId = o.id;
        const items = mapOrderItems(
          (itemRows ?? []).filter((r: ItemRow) => r.order_id === oId) as Record<string, unknown>[]
        );
        const staff = mapOrderStaff(
          (staffRows ?? []).filter((r: ItemRow) => r.order_id === oId) as Record<string, unknown>[]
        );
        const history = mapStatusHistory(
          (historyRows ?? []).filter((r: ItemRow) => r.order_id === oId) as Record<string, unknown>[]
        );
        return mapOrder(o as Record<string, unknown>, items, staff, history);
      });

      setOrders(mapped);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);


  const updateOrderStatus = useCallback(
    async (id: string | number, newStatus: Order["status"]) => {
      const orderId = String(id);
      const backup = [...orders];
      const index = orders.findIndex((o) => String(o.id) === orderId);
      if (index === -1) throw new Error("Orden no encontrada");

      const prev = orders[index];
      const optimistic: Order = {
        ...prev,
        status: newStatus,
        updatedAt: new Date().toISOString(),
        statusHistory: [
          ...(prev.statusHistory || []),
          { status: newStatus, at: new Date().toISOString() },
        ],
      };

      setOrders((s) => s.map((o) => (String(o.id) === orderId ? optimistic : o)));

      toast.success(`Estado cambiado a ${newStatus}`, {
        duration: 8000,
        action: {
          label: "Deshacer",
          onClick: async () => {
            setOrders(backup);
            try {
              await supabase
                .from("orders")
                .update({ status: prev.status })
                .eq("id", orderId);
              toast.success("Cambio revertido");
            } catch {
              toast.error("No se pudo revertir");
            }
          },
        },
      });

      try {
        const { error: err } = await supabase
          .from("orders")
          .update({ status: newStatus })
          .eq("id", orderId);

        if (err) throw new Error(err.message);

        await supabase.from("order_status_history").insert({
          order_id: orderId,
          status: newStatus,
        });
      } catch (err) {
        setOrders(backup);
        toast.error("No se pudo actualizar el estado");
        throw err;
      }
    },
    [orders] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const cancelOrder = useCallback(
    async (id: string | number, reason: string) => {
      const orderId = String(id);
      const index = orders.findIndex((o) => String(o.id) === orderId);
      if (index === -1) throw new Error("Orden no encontrada");
      const prev = orders[index];

      if (prev.status === "Entregado") {
        toast.error("No se puede cancelar una orden entregada");
        throw new Error("No se puede cancelar una orden entregada");
      }

      const backup = [...orders];
      const optimistic: Order = {
        ...prev,
        status: "Cancelado",
        cancelReason: reason,
        updatedAt: new Date().toISOString(),
        statusHistory: [
          ...(prev.statusHistory || []),
          { status: "Cancelado", at: new Date().toISOString(), note: reason },
        ],
      };

      setOrders((s) => s.map((o) => (String(o.id) === orderId ? optimistic : o)));

      const undo = () => {
        setOrders(backup);
        (async () => {
          try {
            await supabase
              .from("orders")
              .update({ status: prev.status, cancel_reason: null })
              .eq("id", orderId);
            toast.success("Cancelación revertida");
          } catch {
            toast.error("No se pudo revertir la cancelación");
          }
        })();
      };

      toast.success("Orden cancelada", {
        duration: 8000,
        action: { label: "Deshacer", onClick: undo },
      });

      try {
        const { error: err } = await supabase
          .from("orders")
          .update({ status: "Cancelado", cancel_reason: reason })
          .eq("id", orderId);

        if (err) throw new Error(err.message);

        await supabase.from("order_status_history").insert({
          order_id: orderId,
          status: "Cancelado",
          note: reason,
        });
      } catch (err) {
        setOrders(backup);
        toast.error("No se pudo cancelar la orden");
        throw err;
      }
    },
    [orders] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return {
    orders,
    loading,
    error,
    fetchOrders,
    updateOrderStatus,
    cancelOrder,
  };
}
