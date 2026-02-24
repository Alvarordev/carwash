"use client";

import { useState, useEffect, useCallback } from "react";
import type { Customer, Vehicle } from "@/lib/types";
import type { CustomerFormData } from "@/lib/schemas/customer";

const API_URL = "http://localhost:3001/customers";
const VEHICLES_URL = "http://localhost:3001/vehicles";

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Error al cargar clientes");
      const data: Customer[] = await res.json();
      setCustomers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const syncVehicleOwnership = useCallback(
    async (customerId: string, selectedVehicleIds: string[], previousVehicleIds: string[]) => {
      const toAdd = selectedVehicleIds.filter((id) => !previousVehicleIds.includes(id));
      const toRemove = previousVehicleIds.filter((id) => !selectedVehicleIds.includes(id));

      const vehicleIds = [...new Set([...toAdd, ...toRemove])];
      if (vehicleIds.length === 0) return;

      const res = await fetch(VEHICLES_URL);
      if (!res.ok) return;
      const allVehicles: Vehicle[] = await res.json();

      await Promise.all(
        vehicleIds.map(async (vehicleId) => {
          const vehicle = allVehicles.find((v) => v.id === vehicleId);
          if (!vehicle) return;

          let ownerIds: string[];
          if (toAdd.includes(vehicleId)) {
            ownerIds = vehicle.ownerIds.includes(customerId)
              ? vehicle.ownerIds
              : [...vehicle.ownerIds, customerId];
          } else {
            ownerIds = vehicle.ownerIds.filter((id) => id !== customerId);
          }

          await fetch(`${VEHICLES_URL}/${vehicleId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...vehicle, ownerIds, updatedAt: new Date().toISOString() }),
          });
        })
      );
    },
    []
  );

  const getCustomerVehicleIds = useCallback(async (customerId: string): Promise<string[]> => {
    const res = await fetch(VEHICLES_URL);
    if (!res.ok) return [];
    const vehicles: Vehicle[] = await res.json();
    return vehicles.filter((v) => v.ownerIds.includes(customerId)).map((v) => v.id);
  }, []);

  const createCustomer = useCallback(
    async (data: CustomerFormData): Promise<Customer> => {
      const { vehicleIds, ...customerData } = data;
      const now = new Date().toISOString();
      const newCustomer = {
        ...customerData,
        docType: customerData.docType ?? null,
        docNumber: customerData.docNumber ?? null,
        phone: customerData.phone ?? null,
        email: customerData.email ?? null,
        id: `c-${Date.now()}`,
        createdAt: now,
        updatedAt: now,
      };

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCustomer),
      });

      if (!res.ok) throw new Error("Error al crear el cliente");
      const created: Customer = await res.json();
      setCustomers((prev) => [...prev, created]);

      await syncVehicleOwnership(created.id, vehicleIds ?? [], []);

      return created;
    },
    [syncVehicleOwnership]
  );

  const updateCustomer = useCallback(
    async (id: string, data: CustomerFormData): Promise<Customer> => {
      const existing = customers.find((c) => c.id === id);
      if (!existing) throw new Error("Cliente no encontrado");

      const { vehicleIds, ...customerData } = data;
      const updated = {
        ...existing,
        ...customerData,
        docType: customerData.docType ?? null,
        docNumber: customerData.docNumber ?? null,
        phone: customerData.phone ?? null,
        email: customerData.email ?? null,
        updatedAt: new Date().toISOString(),
      };

      const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });

      if (!res.ok) throw new Error("Error al actualizar el cliente");
      const result: Customer = await res.json();
      setCustomers((prev) => prev.map((c) => (c.id === id ? result : c)));

      const previousVehicleIds = await getCustomerVehicleIds(id);
      await syncVehicleOwnership(id, vehicleIds ?? [], previousVehicleIds);

      return result;
    },
    [customers, syncVehicleOwnership, getCustomerVehicleIds]
  );

  const deleteCustomer = useCallback(async (id: string): Promise<void> => {
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Error al eliminar el cliente");
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const restoreCustomer = useCallback(async (customer: Customer): Promise<void> => {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(customer),
    });
    if (!res.ok) throw new Error("Error al restaurar el cliente");
    const restored: Customer = await res.json();
    setCustomers((prev) => [...prev, restored]);
  }, []);

  return {
    customers,
    loading,
    error,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    restoreCustomer,
    getCustomerVehicleIds,
  };
}
