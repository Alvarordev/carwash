"use client";

import { useState, useEffect, useCallback } from "react";
import type { Vehicle } from "@/lib/types";
import type { VehicleFormData } from "@/lib/schemas/vehicle";
import { createClient } from "@/lib/supabase/client";

function mapVehicle(
  row: Record<string, unknown>,
  ownerIds: string[] = []
): Vehicle {
  return {
    id: row.id as string,
    plate: row.plate as string,
    color: row.color as string,
    brand: row.brand as string,
    model: (row.model as string) ?? null,
    vehicleTypeId: row.vehicle_type_id as string,
    ownerIds,
    status: row.status as Vehicle["status"],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export function useVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);

      // Traemos vehículos y propietarios en paralelo
      const [{ data: vehicleRows, error: vErr }, { data: ownerRows, error: oErr }] =
        await Promise.all([
          supabase.from("vehicles").select("*").order("created_at", { ascending: false }),
          supabase.from("vehicle_owners").select("vehicle_id, customer_id"),
        ]);

      if (vErr) throw new Error(vErr.message);
      if (oErr) throw new Error(oErr.message);

      // Agrupamos ownerIds por vehicle_id
      const ownerMap: Record<string, string[]> = {};
      for (const row of ownerRows ?? []) {
        if (!ownerMap[row.vehicle_id]) ownerMap[row.vehicle_id] = [];
        ownerMap[row.vehicle_id].push(row.customer_id);
      }

      setVehicles(
        (vehicleRows ?? []).map((v: Record<string, unknown>) =>
          mapVehicle(v, ownerMap[v.id as string] ?? [])
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
    fetchVehicles();
  }, [fetchVehicles]);

  const createVehicle = useCallback(
    async (data: VehicleFormData): Promise<Vehicle> => {
      const { data: created, error: err } = await supabase
        .from("vehicles")
        .insert({
          plate: data.plate,
          color: data.color,
          brand: data.brand,
          model: data.model ?? null,
          vehicle_type_id: data.vehicleTypeId,
          status: data.status ?? "active",
        })
        .select()
        .single();

      if (err) throw new Error(err.message);
      const newVehicle = mapVehicle(created as Record<string, unknown>);
      setVehicles((prev) => [newVehicle, ...prev]);
      return newVehicle;
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const updateVehicle = useCallback(
    async (id: string, data: VehicleFormData): Promise<Vehicle> => {
      const { data: updated, error: err } = await supabase
        .from("vehicles")
        .update({
          plate: data.plate,
          color: data.color,
          brand: data.brand,
          model: data.model ?? null,
          vehicle_type_id: data.vehicleTypeId,
          status: data.status,
        })
        .eq("id", id)
        .select()
        .single();

      if (err) throw new Error(err.message);

      // Conservar ownerIds existentes del state local
      const existing = vehicles.find((v) => v.id === id);
      const result = mapVehicle(
        updated as Record<string, unknown>,
        existing?.ownerIds ?? []
      );
      setVehicles((prev) => prev.map((v) => (v.id === id ? result : v)));
      return result;
    },
    [vehicles] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const deleteVehicle = useCallback(async (id: string): Promise<void> => {
    const { error: err } = await supabase.from("vehicles").delete().eq("id", id);
    if (err) throw new Error(err.message);
    setVehicles((prev) => prev.filter((v) => v.id !== id));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const restoreVehicle = useCallback(
    async (vehicle: Vehicle): Promise<void> => {
      const { data, error: err } = await supabase
        .from("vehicles")
        .insert({
          id: vehicle.id,
          plate: vehicle.plate,
          color: vehicle.color,
          brand: vehicle.brand,
          model: vehicle.model ?? null,
          vehicle_type_id: vehicle.vehicleTypeId,
          status: vehicle.status,
        })
        .select()
        .single();

      if (err) throw new Error(err.message);
      setVehicles((prev) => [
        mapVehicle(data as Record<string, unknown>, vehicle.ownerIds),
        ...prev,
      ]);
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return {
    vehicles,
    loading,
    error,
    fetchVehicles,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    restoreVehicle,
  };
}
