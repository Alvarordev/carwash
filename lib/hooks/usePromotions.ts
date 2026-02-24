"use client";

import { useState, useEffect, useCallback } from "react";
import type { Promotion } from "@/lib/types";
import type { PromotionFormData } from "@/lib/schemas/promotion";

const API_URL = "http://localhost:3001/promotions";

export function usePromotions() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPromotions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Error al cargar promociones");
      const data: Promotion[] = await res.json();
      setPromotions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  const createPromotion = useCallback(async (data: PromotionFormData): Promise<Promotion> => {
    const now = new Date().toISOString();
    const newPromotion = {
      ...data,
      description: data.description ?? null,
      startDate: data.startDate ?? null,
      endDate: data.endDate ?? null,
      id: `promo-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };

    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPromotion),
    });

    if (!res.ok) throw new Error("Error al crear la promoción");
    const created: Promotion = await res.json();
    setPromotions((prev) => [...prev, created]);
    return created;
  }, []);

  const updatePromotion = useCallback(async (id: string, data: PromotionFormData): Promise<Promotion> => {
    const existing = promotions.find((p) => p.id === id);
    if (!existing) throw new Error("Promoción no encontrada");

    const updated = {
      ...existing,
      ...data,
      description: data.description ?? null,
      startDate: data.startDate ?? null,
      endDate: data.endDate ?? null,
      updatedAt: new Date().toISOString(),
    };

    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });

    if (!res.ok) throw new Error("Error al actualizar la promoción");
    const result: Promotion = await res.json();
    setPromotions((prev) => prev.map((p) => (p.id === id ? result : p)));
    return result;
  }, [promotions]);

  const deletePromotion = useCallback(async (id: string): Promise<void> => {
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Error al eliminar la promoción");
    setPromotions((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const restorePromotion = useCallback(async (promotion: Promotion): Promise<void> => {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(promotion),
    });
    if (!res.ok) throw new Error("Error al restaurar la promoción");
    const restored: Promotion = await res.json();
    setPromotions((prev) => [...prev, restored]);
  }, []);

  const togglePromotionStatus = useCallback(async (id: string): Promise<void> => {
    const existing = promotions.find((p) => p.id === id);
    if (!existing) throw new Error("Promoción no encontrada");

    const newStatus = existing.status === "active" ? "inactive" : "active";
    await updatePromotion(id, { ...existing, status: newStatus });
  }, [promotions, updatePromotion]);

  return {
    promotions,
    loading,
    error,
    fetchPromotions,
    createPromotion,
    updatePromotion,
    deletePromotion,
    restorePromotion,
    togglePromotionStatus,
  };
}
