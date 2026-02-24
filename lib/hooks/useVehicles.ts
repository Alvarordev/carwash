"use client";

import { useState, useEffect, useCallback } from "react";
import type { Vehicle } from "@/lib/types";
import type { VehicleFormData } from "@/lib/schemas/vehicle";

const API_URL = "http://localhost:3001/vehicles";

export function useVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Error al cargar vehículos");
      const data: Vehicle[] = await res.json();
      setVehicles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const createVehicle = useCallback(async (data: VehicleFormData): Promise<Vehicle> => {
    const now = new Date().toISOString();
    const newVehicle = {
      ...data,
      model: data.model ?? null,
      ownerIds: [] as string[],
      id: `v-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };

    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newVehicle),
    });

    if (!res.ok) throw new Error("Error al crear el vehículo");
    const created: Vehicle = await res.json();
    setVehicles((prev) => [...prev, created]);
    return created;
  }, []);

  const updateVehicle = useCallback(async (id: string, data: VehicleFormData): Promise<Vehicle> => {
    const existing = vehicles.find((v) => v.id === id);
    if (!existing) throw new Error("Vehículo no encontrado");

    const updated = {
      ...existing,
      ...data,
      model: data.model ?? null,
      updatedAt: new Date().toISOString(),
    };

    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });

    if (!res.ok) throw new Error("Error al actualizar el vehículo");
    const result: Vehicle = await res.json();
    setVehicles((prev) => prev.map((v) => (v.id === id ? result : v)));
    return result;
  }, [vehicles]);

  const deleteVehicle = useCallback(async (id: string): Promise<void> => {
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Error al eliminar el vehículo");
    setVehicles((prev) => prev.filter((v) => v.id !== id));
  }, []);

  const restoreVehicle = useCallback(async (vehicle: Vehicle): Promise<void> => {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(vehicle),
    });
    if (!res.ok) throw new Error("Error al restaurar el vehículo");
    const restored: Vehicle = await res.json();
    setVehicles((prev) => [...prev, restored]);
  }, []);

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
