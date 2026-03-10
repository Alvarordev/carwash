"use client";

import { useState, useEffect, useCallback } from "react";
import type { ServiceCategory } from "@/lib/types/service";
import { createClient } from "@/lib/supabase/client";
import { getCompanyId } from "@/lib/supabase/get-company-id";

function mapServiceCategory(row: Record<string, unknown>): ServiceCategory {
  return {
    id: row.id as string,
    name: row.name as string,
    description: (row.description as string) ?? null,
    color: (row.color as string) ?? null,
    icon: (row.icon as string) ?? null,
    status: row.status as ServiceCategory["status"],
    companyId: row.company_id as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export function useServiceCategories() {
  const [allCategories, setAllCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("service_categories")
        .select("*")
        .order("name");

      if (error) throw error;
      setAllCategories((data ?? []).map(mapServiceCategory));
    } catch {
      setAllCategories([]);
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const createCategory = useCallback(
    async (data: { name: string; description?: string | null }): Promise<ServiceCategory> => {
      const company_id = await getCompanyId();
      const { data: created, error } = await supabase
        .from("service_categories")
        .insert({ company_id, name: data.name, description: data.description || null })
        .select()
        .single();

      if (error) throw new Error(error.message);

      const newCategory = mapServiceCategory(created as Record<string, unknown>);
      setAllCategories((prev) =>
        [...prev, newCategory].sort((a, b) => a.name.localeCompare(b.name))
      );
      return newCategory;
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const updateCategory = useCallback(
    async (id: string, data: { name: string; description?: string | null }): Promise<ServiceCategory> => {
      const { data: updated, error } = await supabase
        .from("service_categories")
        .update({ name: data.name, description: data.description || null })
        .eq("id", id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      const result = mapServiceCategory(updated as Record<string, unknown>);
      setAllCategories((prev) => prev.map((c) => (c.id === id ? result : c)));
      return result;
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const toggleCategoryStatus = useCallback(
    async (id: string, currentStatus: "active" | "inactive"): Promise<void> => {
      const newStatus = currentStatus === "active" ? "inactive" : "active";
      const { data: updated, error } = await supabase
        .from("service_categories")
        .update({ status: newStatus })
        .eq("id", id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      setAllCategories((prev) =>
        prev.map((c) => (c.id === id ? mapServiceCategory(updated as Record<string, unknown>) : c))
      );
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const categories = allCategories.filter((c) => c.status === "active");

  return {
    categories,
    allCategories,
    loading,
    createCategory,
    updateCategory,
    toggleCategoryStatus,
  };
}
