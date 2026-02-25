"use client";

import { useState, useEffect, useCallback } from "react";
import type { StaffMember } from "@/lib/types";
import type { StaffFormData } from "@/lib/schemas/staff";
import { createClient } from "@/lib/supabase/client";

function mapStaff(row: Record<string, unknown>): StaffMember {
  return {
    id: row.id as string,
    firstName: row.first_name as string,
    lastName: row.last_name as string,
    docType: (row.doc_type as StaffMember["docType"]) ?? null,
    docNumber: (row.doc_number as string) ?? null,
    role: row.role as StaffMember["role"],
    phone: (row.phone as string) ?? null,
    email: (row.email as string) ?? null,
    status: row.status as StaffMember["status"],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export function useStaff() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchStaff = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: err } = await supabase
        .from("staff_members")
        .select("*")
        .order("created_at", { ascending: false });

      if (err) throw new Error(err.message);
      setStaff((data ?? []).map(mapStaff));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const createStaff = useCallback(
    async (data: StaffFormData): Promise<StaffMember> => {
      const { data: created, error: err } = await supabase
        .from("staff_members")
        .insert({
          first_name: data.firstName,
          last_name: data.lastName,
          doc_type: data.docType ?? null,
          doc_number: data.docNumber ?? null,
          role: data.role,
          phone: data.phone ?? null,
          email: data.email ?? null,
          status: data.status ?? "active",
        })
        .select()
        .single();

      if (err) throw new Error(err.message);
      const newMember = mapStaff(created as Record<string, unknown>);
      setStaff((prev) => [newMember, ...prev]);
      return newMember;
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const updateStaff = useCallback(
    async (id: string, data: StaffFormData): Promise<StaffMember> => {
      const { data: updated, error: err } = await supabase
        .from("staff_members")
        .update({
          first_name: data.firstName,
          last_name: data.lastName,
          doc_type: data.docType ?? null,
          doc_number: data.docNumber ?? null,
          role: data.role,
          phone: data.phone ?? null,
          email: data.email ?? null,
          status: data.status,
        })
        .eq("id", id)
        .select()
        .single();

      if (err) throw new Error(err.message);
      const result = mapStaff(updated as Record<string, unknown>);
      setStaff((prev) => prev.map((s) => (s.id === id ? result : s)));
      return result;
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const deleteStaff = useCallback(async (id: string): Promise<void> => {
    const { error: err } = await supabase.from("staff_members").delete().eq("id", id);
    if (err) throw new Error(err.message);
    setStaff((prev) => prev.filter((s) => s.id !== id));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const restoreStaff = useCallback(
    async (member: StaffMember): Promise<void> => {
      const { data, error: err } = await supabase
        .from("staff_members")
        .insert({
          id: member.id,
          first_name: member.firstName,
          last_name: member.lastName,
          doc_type: member.docType ?? null,
          doc_number: member.docNumber ?? null,
          role: member.role,
          phone: member.phone ?? null,
          email: member.email ?? null,
          status: member.status,
        })
        .select()
        .single();

      if (err) throw new Error(err.message);
      setStaff((prev) => [mapStaff(data as Record<string, unknown>), ...prev]);
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

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
