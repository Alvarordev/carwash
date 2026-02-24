"use client";

import { useState, useEffect, useCallback } from "react";
import type { Service } from "@/lib/types";
import type { ServiceFormData } from "@/lib/schemas/service";

const API_URL = "http://localhost:3001/services";

export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Error al cargar servicios");
      const data: Service[] = await res.json();
      setServices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const createService = useCallback(async (data: ServiceFormData): Promise<Service> => {
    const now = new Date().toISOString();
    const newService = {
      ...data,
      description: data.description ?? null,
      id: `srv-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };

    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newService),
    });

    if (!res.ok) throw new Error("Error al crear el servicio");
    const created: Service = await res.json();
    setServices((prev) => [...prev, created]);
    return created;
  }, []);

  const updateService = useCallback(async (id: string, data: ServiceFormData): Promise<Service> => {
    const existing = services.find((s) => s.id === id);
    if (!existing) throw new Error("Servicio no encontrado");

    const updated = {
      ...existing,
      ...data,
      description: data.description ?? null,
      updatedAt: new Date().toISOString(),
    };

    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });

    if (!res.ok) throw new Error("Error al actualizar el servicio");
    const result: Service = await res.json();
    setServices((prev) => prev.map((s) => (s.id === id ? result : s)));
    return result;
  }, [services]);

  const deleteService = useCallback(async (id: string): Promise<void> => {
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Error al eliminar el servicio");
    setServices((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const restoreService = useCallback(async (service: Service): Promise<void> => {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(service),
    });
    if (!res.ok) throw new Error("Error al restaurar el servicio");
    const restored: Service = await res.json();
    setServices((prev) => [...prev, restored]);
  }, []);

  const toggleServiceStatus = useCallback(async (id: string): Promise<void> => {
    const existing = services.find((s) => s.id === id);
    if (!existing) throw new Error("Servicio no encontrado");

    const newStatus = existing.status === "active" ? "inactive" : "active";
    await updateService(id, { ...existing, status: newStatus });
  }, [services, updateService]);

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
