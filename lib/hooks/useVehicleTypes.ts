"use client";

import { useState, useEffect, useCallback } from "react";
import type { VehicleType } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

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
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  const fetchVehicleTypes = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("vehicle_types")
        .select("*")
        .eq("status", "active")
        .order("name");

      if (error) throw error;
      setVehicleTypes((data ?? []).map(mapVehicleType));
    } catch {
      setVehicleTypes([]);
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchVehicleTypes();
  }, [fetchVehicleTypes]);

  return { vehicleTypes, loading };
}
