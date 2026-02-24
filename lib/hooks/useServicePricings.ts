"use client";

import { useState, useEffect, useCallback } from "react";
import type { ServicePricing } from "@/lib/types";
import type { ServicePricingFormData } from "@/lib/schemas/service";

const API_URL = "http://localhost:3001/servicePricings";

export function useServicePricings() {
  const [pricings, setPricings] = useState<ServicePricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPricings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Error al cargar precios");
      const data: ServicePricing[] = await res.json();
      setPricings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPricings();
  }, [fetchPricings]);

  const createPricing = useCallback(async (data: ServicePricingFormData): Promise<ServicePricing> => {
    const now = new Date().toISOString();
    const newPricing = {
      ...data,
      id: `prc-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };

    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPricing),
    });

    if (!res.ok) throw new Error("Error al crear el precio");
    const created: ServicePricing = await res.json();
    setPricings((prev) => [...prev, created]);
    return created;
  }, []);

  const updatePricing = useCallback(async (id: string, data: Partial<ServicePricingFormData>): Promise<ServicePricing> => {
    const existing = pricings.find((p) => p.id === id);
    if (!existing) throw new Error("Precio no encontrado");

    const updated = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });

    if (!res.ok) throw new Error("Error al actualizar el precio");
    const result: ServicePricing = await res.json();
    setPricings((prev) => prev.map((p) => (p.id === id ? result : p)));
    return result;
  }, [pricings]);

  const deletePricing = useCallback(async (id: string): Promise<void> => {
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Error al eliminar el precio");
    setPricings((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const getPricingsByService = useCallback(
    (serviceId: string) => {
      return pricings.filter((p) => p.serviceId === serviceId && p.status === "active");
    },
    [pricings]
  );

  return {
    pricings,
    loading,
    error,
    fetchPricings,
    createPricing,
    updatePricing,
    deletePricing,
    getPricingsByService,
  };
}
