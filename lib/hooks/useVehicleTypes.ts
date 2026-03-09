"use client";

import { useState, useEffect, useCallback } from "react";
import type { VehicleType } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { getCompanyId } from "@/lib/supabase/get-company-id";

function mapVehicleType(row: Record<string, unknown>): VehicleType {
  return {
    id: row.id as string,
    name: row.name as string,
    description: (row.description as string) ?? null,
    status: row.status as VehicleType["status"],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export function useVehicleTypes() {
  const [allVehicleTypes, setAllVehicleTypes] = useState<VehicleType[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  const fetchVehicleTypes = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("vehicle_types")
        .select("*")
        .order("name");

      if (error) throw error;
      setAllVehicleTypes((data ?? []).map(mapVehicleType));
    } catch {
      setAllVehicleTypes([]);
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchVehicleTypes();
  }, [fetchVehicleTypes]);

  const createVehicleType = useCallback(
    async (data: { name: string; description?: string | null }): Promise<VehicleType> => {
      const company_id = await getCompanyId();
      const { data: created, error } = await supabase
        .from("vehicle_types")
        .insert({ company_id, name: data.name, description: data.description || null })
        .select()
        .single();

      if (error) throw new Error(error.message);

      const newType = mapVehicleType(created as Record<string, unknown>);
      setAllVehicleTypes((prev) =>
        [...prev, newType].sort((a, b) => a.name.localeCompare(b.name))
      );
      return newType;
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const updateVehicleType = useCallback(
    async (id: string, data: { name: string; description?: string | null }): Promise<VehicleType> => {
      const { data: updated, error } = await supabase
        .from("vehicle_types")
        .update({ name: data.name, description: data.description || null })
        .eq("id", id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      const result = mapVehicleType(updated as Record<string, unknown>);
      setAllVehicleTypes((prev) => prev.map((vt) => (vt.id === id ? result : vt)));
      return result;
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const toggleVehicleTypeStatus = useCallback(
    async (id: string, currentStatus: "active" | "inactive"): Promise<void> => {
      const newStatus = currentStatus === "active" ? "inactive" : "active";
      const { data: updated, error } = await supabase
        .from("vehicle_types")
        .update({ status: newStatus })
        .eq("id", id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      setAllVehicleTypes((prev) =>
        prev.map((vt) => (vt.id === id ? mapVehicleType(updated as Record<string, unknown>) : vt))
      );
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const vehicleTypes = allVehicleTypes.filter((vt) => vt.status === "active");

  return {
    vehicleTypes,
    allVehicleTypes,
    loading,
    createVehicleType,
    updateVehicleType,
    toggleVehicleTypeStatus,
  };
}
