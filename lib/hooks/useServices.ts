"use client";

import { useState, useEffect, useCallback } from "react";
import type { Service } from "@/lib/types";
import type { ServiceFormData } from "@/lib/schemas/service";
import { createClient } from "@/lib/supabase/client";

function mapService(row: Record<string, unknown>): Service {
  return {
    id: row.id as string,
    name: row.name as string,
    description: (row.description as string) ?? null,
    category: row.category as Service["category"],
    status: row.status as Service["status"],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: err } = await supabase
        .from("services")
        .select("*")
        .order("name");

      if (err) throw new Error(err.message);
      setServices((data ?? []).map(mapService));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const createService = useCallback(
    async (data: ServiceFormData): Promise<Service> => {
      const { data: created, error: err } = await supabase
        .from("services")
        .insert({
          name: data.name,
          description: data.description ?? null,
          category: data.category,
          status: data.status ?? "active",
        })
        .select()
        .single();

      if (err) throw new Error(err.message);
      const newService = mapService(created as Record<string, unknown>);
      setServices((prev) => [...prev, newService]);
      return newService;
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const updateService = useCallback(
    async (id: string, data: ServiceFormData): Promise<Service> => {
      const { data: updated, error: err } = await supabase
        .from("services")
        .update({
          name: data.name,
          description: data.description ?? null,
          category: data.category,
          status: data.status,
        })
        .eq("id", id)
        .select()
        .single();

      if (err) throw new Error(err.message);
      const result = mapService(updated as Record<string, unknown>);
      setServices((prev) => prev.map((s) => (s.id === id ? result : s)));
      return result;
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const deleteService = useCallback(async (id: string): Promise<void> => {
    const { error: err } = await supabase.from("services").delete().eq("id", id);
    if (err) throw new Error(err.message);
    setServices((prev) => prev.filter((s) => s.id !== id));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const restoreService = useCallback(
    async (service: Service): Promise<void> => {
      const { data, error: err } = await supabase
        .from("services")
        .insert({
          id: service.id,
          name: service.name,
          description: service.description ?? null,
          category: service.category,
          status: service.status,
        })
        .select()
        .single();

      if (err) throw new Error(err.message);
      setServices((prev) => [...prev, mapService(data as Record<string, unknown>)]);
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const toggleServiceStatus = useCallback(
    async (id: string): Promise<void> => {
      const existing = services.find((s) => s.id === id);
      if (!existing) throw new Error("Servicio no encontrado");
      const newStatus = existing.status === "active" ? "inactive" : "active";
      await updateService(id, { ...existing, status: newStatus });
    },
    [services, updateService]
  );

  return {
    services,
    loading,
    error,
    fetchServices,
    createService,
    updateService,
    deleteService,
    restoreService,
    toggleServiceStatus,
  };
}
