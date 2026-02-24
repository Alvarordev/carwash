"use client";

import { useState, useEffect, useCallback } from "react";
import type { StaffMember } from "@/lib/types";
import type { StaffFormData } from "@/lib/schemas/staff";

const API_URL = "http://localhost:3001/staff";

export function useStaff() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStaff = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Error al cargar el personal");
      const data: StaffMember[] = await res.json();
      setStaff(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const createStaff = useCallback(async (data: StaffFormData): Promise<StaffMember> => {
    const now = new Date().toISOString();
    const newStaffMember = {
      ...data,
      docType: data.docType ?? null,
      docNumber: data.docNumber ?? null,
      phone: data.phone ?? null,
      email: data.email ?? null,
      id: `s-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };

    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newStaffMember),
    });

    if (!res.ok) throw new Error("Error al crear el miembro del personal");
    const created: StaffMember = await res.json();
    setStaff((prev) => [...prev, created]);
    return created;
  }, []);

  const updateStaff = useCallback(async (id: string, data: StaffFormData): Promise<StaffMember> => {
    const existing = staff.find((s) => s.id === id);
    if (!existing) throw new Error("Miembro del personal no encontrado");

    const updated = {
      ...existing,
      ...data,
      docType: data.docType ?? null,
      docNumber: data.docNumber ?? null,
      phone: data.phone ?? null,
      email: data.email ?? null,
      updatedAt: new Date().toISOString(),
    };

    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });

    if (!res.ok) throw new Error("Error al actualizar el miembro del personal");
    const result: StaffMember = await res.json();
    setStaff((prev) => prev.map((s) => (s.id === id ? result : s)));
    return result;
  }, [staff]);

  const deleteStaff = useCallback(async (id: string): Promise<void> => {
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Error al eliminar el miembro del personal");
    setStaff((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const restoreStaff = useCallback(async (member: StaffMember): Promise<void> => {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(member),
    });
    if (!res.ok) throw new Error("Error al restaurar el miembro del personal");
    const restored: StaffMember = await res.json();
    setStaff((prev) => [...prev, restored]);
  }, []);

  return {
    staff,
    loading,
    error,
    fetchStaff,
    createStaff,
    updateStaff,
    deleteStaff,
    restoreStaff,
  };
}
