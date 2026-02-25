"use client";

import { useState, useEffect, useCallback } from "react";
import type { Promotion } from "@/lib/types";
import type { PromotionFormData } from "@/lib/schemas/promotion";
import { createClient } from "@/lib/supabase/client";

function mapPromotion(
  row: Record<string, unknown>,
  scopeIds: string[] = []
): Promotion {
  return {
    id: row.id as string,
    name: row.name as string,
    description: (row.description as string) ?? null,
    discountType: row.discount_type as Promotion["discountType"],
    discountValue: row.discount_value as number,
    scope: row.scope as Promotion["scope"],
    scopeIds,
    startDate: (row.start_date as string) ?? null,
    endDate: (row.end_date as string) ?? null,
    status: row.status as Promotion["status"],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export function usePromotions() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchPromotions = useCallback(async () => {
    try {
      setLoading(true);

      const [{ data: promoRows, error: pErr }, { data: scopeRows, error: sErr }] =
        await Promise.all([
          supabase.from("promotions").select("*").order("created_at", { ascending: false }),
          supabase.from("promotion_scopes").select("promotion_id, scope_ref_id"),
        ]);

      if (pErr) throw new Error(pErr.message);
      if (sErr) throw new Error(sErr.message);

      // Agrupamos scope_ref_ids por promotion_id
      const scopeMap: Record<string, string[]> = {};
      for (const row of scopeRows ?? []) {
        if (!scopeMap[row.promotion_id]) scopeMap[row.promotion_id] = [];
        scopeMap[row.promotion_id].push(row.scope_ref_id);
      }

      setPromotions(
        (promoRows ?? []).map((p: Record<string, unknown>) =>
          mapPromotion(p, scopeMap[p.id as string] ?? [])
        )
      );
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  // Sincroniza las filas de promotion_scopes
  const syncPromotionScopes = useCallback(
    async (promotionId: string, newScopeIds: string[]) => {
      await supabase
        .from("promotion_scopes")
        .delete()
        .eq("promotion_id", promotionId);

      if (newScopeIds.length > 0) {
        await supabase.from("promotion_scopes").insert(
          newScopeIds.map((scope_ref_id) => ({ promotion_id: promotionId, scope_ref_id }))
        );
      }
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const createPromotion = useCallback(
    async (data: PromotionFormData): Promise<Promotion> => {
      const { data: created, error: err } = await supabase
        .from("promotions")
        .insert({
          name: data.name,
          description: data.description ?? null,
          discount_type: data.discountType,
          discount_value: data.discountValue,
          scope: data.scope,
          start_date: data.startDate ?? null,
          end_date: data.endDate ?? null,
          status: data.status ?? "active",
        })
        .select()
        .single();

      if (err) throw new Error(err.message);
      const scopeIds = data.scopeIds ?? [];
      await syncPromotionScopes(created.id, scopeIds);

      const newPromotion = mapPromotion(created as Record<string, unknown>, scopeIds);
      setPromotions((prev) => [newPromotion, ...prev]);
      return newPromotion;
    },
    [syncPromotionScopes] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const updatePromotion = useCallback(
    async (id: string, data: PromotionFormData): Promise<Promotion> => {
      const { data: updated, error: err } = await supabase
        .from("promotions")
        .update({
          name: data.name,
          description: data.description ?? null,
          discount_type: data.discountType,
          discount_value: data.discountValue,
          scope: data.scope,
          start_date: data.startDate ?? null,
          end_date: data.endDate ?? null,
          status: data.status,
        })
        .eq("id", id)
        .select()
        .single();

      if (err) throw new Error(err.message);
      const scopeIds = data.scopeIds ?? [];
      await syncPromotionScopes(id, scopeIds);

      const result = mapPromotion(updated as Record<string, unknown>, scopeIds);
      setPromotions((prev) => prev.map((p) => (p.id === id ? result : p)));
      return result;
    },
    [syncPromotionScopes] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const deletePromotion = useCallback(async (id: string): Promise<void> => {
    const { error: err } = await supabase.from("promotions").delete().eq("id", id);
    if (err) throw new Error(err.message);
    setPromotions((prev) => prev.filter((p) => p.id !== id));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const restorePromotion = useCallback(
    async (promotion: Promotion): Promise<void> => {
      const { data, error: err } = await supabase
        .from("promotions")
        .insert({
          id: promotion.id,
          name: promotion.name,
          description: promotion.description ?? null,
          discount_type: promotion.discountType,
          discount_value: promotion.discountValue,
          scope: promotion.scope,
          start_date: promotion.startDate ?? null,
          end_date: promotion.endDate ?? null,
          status: promotion.status,
        })
        .select()
        .single();

      if (err) throw new Error(err.message);
      await syncPromotionScopes(promotion.id, promotion.scopeIds);
      setPromotions((prev) => [
        mapPromotion(data as Record<string, unknown>, promotion.scopeIds),
        ...prev,
      ]);
    },
    [syncPromotionScopes] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const togglePromotionStatus = useCallback(
    async (id: string): Promise<void> => {
      const existing = promotions.find((p) => p.id === id);
      if (!existing) throw new Error("Promoción no encontrada");
      const newStatus = existing.status === "active" ? "inactive" : "active";
      await updatePromotion(id, { ...existing, status: newStatus });
    },
    [promotions, updatePromotion]
  );

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
