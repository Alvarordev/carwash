"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { Order } from "@/lib/types/order";

const API_URL = "http://localhost:3001/orders";

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);

  const fetchOrders = useCallback(async (page = 1, limit = 10, query = "") => {
    setLoading(true);
    try {
      const url = `${API_URL}?_page=${page}&_limit=${limit}${query}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Error al cargar órdenes");
      const data: Order[] = await res.json();
      const total = parseInt(res.headers.get("X-Total-Count") || "0", 10);
      setOrders(data);
      setTotalCount(total);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateOrderStatus = useCallback(
    async (id: string | number, newStatus: Order["status"]) => {
      const backup = [...orders];
      const index = orders.findIndex((o) => o.id === id);
      if (index === -1) throw new Error("Orden no encontrada");

      const prev = orders[index];
      const updated: Order = {
        ...prev,
        status: newStatus,
        updatedAt: new Date().toISOString(),
        statusHistory: [
          ...(prev.statusHistory || []),
          { status: newStatus, at: new Date().toISOString() },
        ],
      };

      // optimistic update
      setOrders((s) => s.map((o) => (o.id === id ? updated : o)));

      const undoToast = toast.success(`Estado cambiado a ${newStatus}`, {
        duration: 8000,
        action: {
          label: "Deshacer",
          onClick: async () => {
            setOrders(backup);
            try {
              await fetch(`${API_URL}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(prev),
              });
              toast.success("Cambio revertido");
            } catch {
              toast.error("No se pudo revertir");
            }
          },
        },
      });

      try {
        const res = await fetch(`${API_URL}/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated),
        });
        if (!res.ok) throw new Error("Error al actualizar estado");
        // keep optimistic update
      } catch (err) {
        setOrders(backup);
        toast.error("No se pudo actualizar el estado");
        throw err;
      }
    },
    [orders]
  );

  const cancelOrder = useCallback(
    async (id: string | number, reason: string) => {
      const index = orders.findIndex((o) => o.id === id);
      if (index === -1) throw new Error("Orden no encontrada");
      const prev = orders[index];
      if (prev.status === "Entregado") {
        toast.error("No se puede cancelar una orden entregada");
        throw new Error("No se puede cancelar una orden entregada");
      }

      const backup = [...orders];
      const updated: Order = {
        ...prev,
        status: "Cancelado",
        cancelReason: reason,
        updatedAt: new Date().toISOString(),
        statusHistory: [
          ...(prev.statusHistory || []),
          { status: "Cancelado", at: new Date().toISOString(), note: reason },
        ],
      };

      setOrders((s) => s.map((o) => (o.id === id ? updated : o)));

      const undo = () => {
        setOrders(backup);
        (async () => {
          try {
            await fetch(`${API_URL}/${id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(prev),
            });
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
        const res = await fetch(`${API_URL}/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated),
        });
        if (!res.ok) throw new Error("Error al cancelar orden");
      } catch (err) {
        setOrders(backup);
        toast.error("No se pudo cancelar la orden");
        throw err;
      }
    },
    [orders]
  );

  return {
    orders,
    loading,
    error,
    totalCount,
    fetchOrders,
    updateOrderStatus,
    cancelOrder,
  };
}
