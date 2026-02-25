"use client";

import { useState, useEffect, useCallback } from "react";
import type { Customer } from "@/lib/types";
import type { CustomerFormData } from "@/lib/schemas/customer";
import { createClient } from "@/lib/supabase/client";

// Mapea fila de DB (snake_case) → tipo Customer (camelCase)
function mapCustomer(row: Record<string, unknown>): Customer {
  return {
    id: row.id as string,
    firstName: row.first_name as string,
    lastName: row.last_name as string,
    docType: (row.doc_type as Customer["docType"]) ?? null,
    docNumber: (row.doc_number as string) ?? null,
    phone: (row.phone as string) ?? null,
    email: (row.email as string) ?? null,
    status: row.status as Customer["status"],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: err } = await supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });

      if (err) throw new Error(err.message);
      setCustomers((data ?? []).map(mapCustomer));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // ── Ownership helpers (tabla vehicle_owners) ───────────────────────────────

  const getCustomerVehicleIds = useCallback(
    async (customerId: string): Promise<string[]> => {
      const { data } = await supabase
        .from("vehicle_owners")
        .select("vehicle_id")
        .eq("customer_id", customerId);
      return (data ?? []).map((r: { vehicle_id: string }) => r.vehicle_id);
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const syncVehicleOwnership = useCallback(
    async (
      customerId: string,
      selectedVehicleIds: string[],
      previousVehicleIds: string[]
    ) => {
      const toAdd = selectedVehicleIds.filter(
        (id) => !previousVehicleIds.includes(id)
      );
      const toRemove = previousVehicleIds.filter(
        (id) => !selectedVehicleIds.includes(id)
      );

      if (toAdd.length > 0) {
        await supabase
          .from("vehicle_owners")
          .insert(toAdd.map((vehicle_id) => ({ vehicle_id, customer_id: customerId })));
      }
      if (toRemove.length > 0) {
        await supabase
          .from("vehicle_owners")
          .delete()
          .eq("customer_id", customerId)
          .in("vehicle_id", toRemove);
      }
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // ── CRUD ──────────────────────────────────────────────────────────────────

  const createCustomer = useCallback(
    async (data: CustomerFormData): Promise<Customer> => {
      const { vehicleIds, ...customerData } = data;

      const { data: created, error: err } = await supabase
        .from("customers")
        .insert({
          first_name: customerData.firstName,
          last_name: customerData.lastName,
          doc_type: customerData.docType ?? null,
          doc_number: customerData.docNumber ?? null,
          phone: customerData.phone ?? null,
          email: customerData.email ?? null,
          status: customerData.status ?? "active",
        })
        .select()
        .single();

      if (err) throw new Error(err.message);
      const newCustomer = mapCustomer(created as Record<string, unknown>);
      setCustomers((prev) => [newCustomer, ...prev]);

      await syncVehicleOwnership(newCustomer.id, vehicleIds ?? [], []);

      return newCustomer;
    },
    [syncVehicleOwnership] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const updateCustomer = useCallback(
    async (id: string, data: CustomerFormData): Promise<Customer> => {
      const { vehicleIds, ...customerData } = data;

      const { data: updated, error: err } = await supabase
        .from("customers")
        .update({
          first_name: customerData.firstName,
          last_name: customerData.lastName,
          doc_type: customerData.docType ?? null,
          doc_number: customerData.docNumber ?? null,
          phone: customerData.phone ?? null,
          email: customerData.email ?? null,
          status: customerData.status,
        })
        .eq("id", id)
        .select()
        .single();

      if (err) throw new Error(err.message);
      const result = mapCustomer(updated as Record<string, unknown>);
      setCustomers((prev) => prev.map((c) => (c.id === id ? result : c)));

      const previousVehicleIds = await getCustomerVehicleIds(id);
      await syncVehicleOwnership(id, vehicleIds ?? [], previousVehicleIds);

      return result;
    },
    [getCustomerVehicleIds, syncVehicleOwnership] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const deleteCustomer = useCallback(async (id: string): Promise<void> => {
    const { error: err } = await supabase
      .from("customers")
      .delete()
      .eq("id", id);
    if (err) throw new Error(err.message);
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const restoreCustomer = useCallback(
    async (customer: Customer): Promise<void> => {
      const { data, error: err } = await supabase
        .from("customers")
        .insert({
          id: customer.id,
          first_name: customer.firstName,
          last_name: customer.lastName,
          doc_type: customer.docType ?? null,
          doc_number: customer.docNumber ?? null,
          phone: customer.phone ?? null,
          email: customer.email ?? null,
          status: customer.status,
        })
        .select()
        .single();

      if (err) throw new Error(err.message);
      setCustomers((prev) => [mapCustomer(data as Record<string, unknown>), ...prev]);
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

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
