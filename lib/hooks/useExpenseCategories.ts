"use client";

import { useState, useEffect, useCallback } from "react";
import type { ExpenseCategory } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { getCompanyId } from "@/lib/supabase/get-company-id";

function mapExpenseCategory(row: Record<string, unknown>): ExpenseCategory {
  return {
    id: row.id as string,
    companyId: row.company_id as string,
    name: row.name as string,
    description: (row.description as string) ?? null,
    isActive: row.is_active as boolean,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export function useExpenseCategories() {
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  const fetchExpenseCategories = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("expense_categories")
        .select("*")
        .order("name");

      if (error) throw error;
      setExpenseCategories((data ?? []).map(mapExpenseCategory));
    } catch {
      setExpenseCategories([]);
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchExpenseCategories();
  }, [fetchExpenseCategories]);

  const createExpenseCategory = useCallback(
    async (data: { name: string; description?: string | null }): Promise<ExpenseCategory> => {
      const company_id = await getCompanyId();
      const { data: created, error } = await supabase
        .from("expense_categories")
        .insert({ company_id, name: data.name, description: data.description || null })
        .select()
        .single();

      if (error) throw new Error(error.message);
      const newCategory = mapExpenseCategory(created as Record<string, unknown>);
      setExpenseCategories((prev) =>
        [...prev, newCategory].sort((a, b) => a.name.localeCompare(b.name))
      );
      return newCategory;
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const updateExpenseCategory = useCallback(
    async (id: string, data: { name: string; description?: string | null }): Promise<ExpenseCategory> => {
      const { data: updated, error } = await supabase
        .from("expense_categories")
        .update({ name: data.name, description: data.description || null })
        .eq("id", id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      const result = mapExpenseCategory(updated as Record<string, unknown>);
      setExpenseCategories((prev) => prev.map((c) => (c.id === id ? result : c)));
      return result;
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const updateExpenseCategoryStatus = useCallback(
    async (id: string, isActive: boolean): Promise<void> => {
      const { data: updated, error } = await supabase
        .from("expense_categories")
        .update({ is_active: isActive })
        .eq("id", id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      setExpenseCategories((prev) =>
        prev.map((c) => (c.id === id ? mapExpenseCategory(updated as Record<string, unknown>) : c))
      );
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const deleteExpenseCategory = useCallback(async (id: string): Promise<void> => {
    const { error } = await supabase.from("expense_categories").delete().eq("id", id);
    if (error) throw new Error(error.message);
    setExpenseCategories((prev) => prev.filter((c) => c.id !== id));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    expenseCategories,
    loading,
    createExpenseCategory,
    updateExpenseCategory,
    updateExpenseCategoryStatus,
    deleteExpenseCategory,
  };
}
