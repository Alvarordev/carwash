"use client";

import { useState, useEffect, useCallback } from "react";
import type { VehicleType } from "@/lib/types";

const API_URL = "http://localhost:3001/vehicleTypes";

export function useVehicleTypes() {
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVehicleTypes = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Error al cargar tipos de vehículos");
      const data: VehicleType[] = await res.json();
      setVehicleTypes(data.filter((t) => t.status === "active"));
    } catch {
      setVehicleTypes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVehicleTypes();
  }, [fetchVehicleTypes]);

  return { vehicleTypes, loading };
}
