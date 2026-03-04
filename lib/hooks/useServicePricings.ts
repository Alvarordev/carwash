"use client";

import { useState, useEffect, useCallback } from "react";
import type { ServicePricing } from "@/lib/types";
import type { ServicePricingFormData } from "@/lib/schemas/service";
import { createClient } from "@/lib/supabase/client";
import { getCompanyId } from "@/lib/supabase/get-company-id";

function mapPricing(row: Record<string, unknown>): ServicePricing {
  return {
    id: row.id as string,
    serviceId: row.service_id as string,
    vehicleTypeId: row.vehicle_type_id as string,
    price: row.price as number,
    status: row.status as ServicePricing["status"],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export function useServicePricings() {
  const [pricings, setPricings] = useState<ServicePricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchPricings = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: err } = await supabase
        .from("service_pricing")
        .select("*")
        .order("created_at", { ascending: false });

      if (err) throw new Error(err.message);
      setPricings((data ?? []).map(mapPricing));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchPricings();
  }, [fetchPricings]);

  const createPricing = useCallback(
    async (data: ServicePricingFormData): Promise<ServicePricing> => {
      const company_id = await getCompanyId();
      const { data: created, error: err } = await supabase
        .from("service_pricing")
        .insert({
          company_id,
          service_id: data.serviceId,
          vehicle_type_id: data.vehicleTypeId,
          price: data.price,
          status: data.status ?? "active",
        })
        .select()
        .single();

      if (err) throw new Error(err.message);
      const newPricing = mapPricing(created as Record<string, unknown>);
      setPricings((prev) => [newPricing, ...prev]);
      return newPricing;
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const updatePricing = useCallback(
    async (
      id: string,
      data: Partial<ServicePricingFormData>
    ): Promise<ServicePricing> => {
      const update: Record<string, unknown> = {};
      if (data.serviceId !== undefined) update.service_id = data.serviceId;
      if (data.vehicleTypeId !== undefined) update.vehicle_type_id = data.vehicleTypeId;
      if (data.price !== undefined) update.price = data.price;
      if (data.status !== undefined) update.status = data.status;

      const { data: updated, error: err } = await supabase
        .from("service_pricing")
        .update(update)
        .eq("id", id)
        .select()
        .single();

      if (err) throw new Error(err.message);
      const result = mapPricing(updated as Record<string, unknown>);
      setPricings((prev) => prev.map((p) => (p.id === id ? result : p)));
      return result;
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const deletePricing = useCallback(async (id: string): Promise<void> => {
    const { error: err } = await supabase
      .from("service_pricing")
      .delete()
      .eq("id", id);
    if (err) throw new Error(err.message);
    setPricings((prev) => prev.filter((p) => p.id !== id));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const getPricingsByService = useCallback(
    (serviceId: string) => {
      return pricings.filter(
        (p) => p.serviceId === serviceId && p.status === "active"
      );
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
