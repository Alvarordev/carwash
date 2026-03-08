"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { Order, OrderItem, OrderStaffAssignment, OrderStatusHistoryEntry, OrderCustomer, OrderVehicle } from "@/lib/types/order";
import { createClient } from "@/lib/supabase/client";
import { getCompanyId } from "@/lib/supabase/get-company-id";
import { Service } from "@/lib/types/service";


function mapOrderItems(rows: Record<string, unknown>[], servicesMap: Map<string, { icon: Service["icon"]; color: Service["color"] }>): OrderItem[] {
  return rows.map((r) => {
    const serviceId = (r.service_id as string) ?? "";
    const serviceData = servicesMap.get(serviceId)

    return {
      serviceId: (r.service_id as string) ?? "",
      name: r.service_name as string,
      price: r.unit_price as number,
      quantity: r.quantity as number,
      subtotal: r.subtotal as number,
      icon: serviceData?.icon ?? null,
      color: serviceData?.color ?? null,
    }
  });
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
  statusHistory: OrderStatusHistoryEntry[],
  customer?: OrderCustomer,
  vehicle?: OrderVehicle,
): Order {
  return {
    id: row.id as string,
    orderNumber: row.order_number as string,
    customer,
    vehicle,
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
        { data: customerRows, error: cErr },
        { data: vehicleRows, error: vErr },
        { data: serviceRows, error: svErr },
      ] = await Promise.all([
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
        supabase.from("order_items").select("*"),
        supabase.from("order_staff").select("*"),
        supabase.from("order_status_history").select("*").order("created_at"),
        supabase.from("customers").select("id, first_name, last_name"),
        supabase.from("vehicles").select("id, plate, brand, model, color"),
        supabase.from("services").select("id, icon, color"),
      ]);

      if (oErr) throw new Error(oErr.message);
      if (iErr) throw new Error(iErr.message);
      if (sErr) throw new Error(sErr.message);
      if (hErr) throw new Error(hErr.message);
      if (cErr) throw new Error(cErr.message);
      if (vErr) throw new Error(vErr.message);
      if (svErr) throw new Error(svErr.message);

      const serviceMap = new Map();
      for (const s of serviceRows ?? []) {
        serviceMap.set(s.id, { icon: s.icon, color: s.color });
      }
      const customerMap = new Map<string, OrderCustomer>();
      for (const c of customerRows ?? []) {
        customerMap.set(c.id, { id: c.id, firstName: c.first_name, lastName: c.last_name });
      }
      const vehicleMap = new Map<string, OrderVehicle>();
      for (const v of vehicleRows ?? []) {
        vehicleMap.set(v.id, { id: v.id, plate: v.plate, brand: v.brand, model: v.model, color: v.color });
      }

      type OrderRow = { id: string;[key: string]: unknown };
      type ItemRow = { order_id: string;[key: string]: unknown };

      const mapped = (orderRows ?? []).map((o: OrderRow) => {
        const oId = o.id;
        const items = mapOrderItems(
          (itemRows ?? []).filter((r: ItemRow) => r.order_id === oId) as Record<string, unknown>[],
          serviceMap
        );
        const staff = mapOrderStaff(
          (staffRows ?? []).filter((r: ItemRow) => r.order_id === oId) as Record<string, unknown>[]
        );
        const history = mapStatusHistory(
          (historyRows ?? []).filter((r: ItemRow) => r.order_id === oId) as Record<string, unknown>[]
        );
        const customer = o.customer_id ? customerMap.get(o.customer_id as string) : undefined;
        const vehicle = o.vehicle_id ? vehicleMap.get(o.vehicle_id as string) : undefined;
        return mapOrder(o as Record<string, unknown>, items, staff, history, customer, vehicle);
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

  useEffect(() => {
    const debounceRef = { timer: null as ReturnType<typeof setTimeout> | null };
    const debouncedFetch = () => {
      if (debounceRef.timer) clearTimeout(debounceRef.timer);
      debounceRef.timer = setTimeout(() => {
        fetchOrders();
      }, 500);
    };

    const channel = supabase
      .channel("orders-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, debouncedFetch)
      .on("postgres_changes", { event: "*", schema: "public", table: "order_items" }, debouncedFetch)
      .on("postgres_changes", { event: "*", schema: "public", table: "order_status_history" }, debouncedFetch)
      .subscribe();

    return () => {
      if (debounceRef.timer) clearTimeout(debounceRef.timer);
      supabase.removeChannel(channel);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

        const company_id = await getCompanyId();
        await supabase.from("order_status_history").insert({
          company_id,
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

        const company_id = await getCompanyId();
        await supabase.from("order_status_history").insert({
          company_id,
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
