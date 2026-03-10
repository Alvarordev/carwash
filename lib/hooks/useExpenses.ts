"use client";

import { useState, useEffect, useCallback } from "react";
import type { Expense } from "@/lib/types";
import type { ExpenseFormData } from "@/lib/schemas/expense";
import { createClient } from "@/lib/supabase/client";
import { getCompanyId } from "@/lib/supabase/get-company-id";

function mapExpense(row: Record<string, unknown>): Expense {
  const category = row.expense_categories as Record<string, unknown> | null;
  const staff = row.staff_members as Record<string, unknown> | null;
  const staffName = staff
    ? `${staff.first_name} ${staff.last_name}`
    : null;

  return {
    id: row.id as string,
    companyId: row.company_id as string,
    detail: row.detail as string,
    categoryId: row.category_id as string,
    categoryName: (category?.name as string) ?? null,
    staffMemberId: (row.staff_member_id as string) ?? null,
    staffMemberName: staffName,
    amount: Number(row.amount),
    date: row.date as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: err } = await supabase
        .from("expenses")
        .select("*, expense_categories(name), staff_members(first_name, last_name)")
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });

      if (err) throw new Error(err.message);
      setExpenses((data ?? []).map(mapExpense));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const createExpense = useCallback(
    async (data: ExpenseFormData): Promise<Expense> => {
      const company_id = await getCompanyId();
      const { data: created, error: err } = await supabase
        .from("expenses")
        .insert({
          company_id,
          detail: data.detail,
          category_id: data.categoryId,
          staff_member_id: data.staffMemberId || null,
          amount: data.amount,
          date: data.date,
        })
        .select("*, expense_categories(name), staff_members(first_name, last_name)")
        .single();

      if (err) throw new Error(err.message);
      const newExpense = mapExpense(created as Record<string, unknown>);
      setExpenses((prev) => [newExpense, ...prev]);
      return newExpense;
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const updateExpense = useCallback(
    async (id: string, data: ExpenseFormData): Promise<Expense> => {
      const { data: updated, error: err } = await supabase
        .from("expenses")
        .update({
          detail: data.detail,
          category_id: data.categoryId,
          staff_member_id: data.staffMemberId || null,
          amount: data.amount,
          date: data.date,
        })
        .eq("id", id)
        .select("*, expense_categories(name), staff_members(first_name, last_name)")
        .single();

      if (err) throw new Error(err.message);
      const result = mapExpense(updated as Record<string, unknown>);
      setExpenses((prev) => prev.map((e) => (e.id === id ? result : e)));
      return result;
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const deleteExpense = useCallback(async (id: string): Promise<void> => {
    const { error: err } = await supabase.from("expenses").delete().eq("id", id);
    if (err) throw new Error(err.message);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const restoreExpense = useCallback(
    async (expense: Expense): Promise<void> => {
      const company_id = await getCompanyId();
      const { data, error: err } = await supabase
        .from("expenses")
        .insert({
          company_id,
          id: expense.id,
          detail: expense.detail,
          category_id: expense.categoryId,
          staff_member_id: expense.staffMemberId ?? null,
          amount: expense.amount,
          date: expense.date,
        })
        .select("*, expense_categories(name), staff_members(first_name, last_name)")
        .single();

      if (err) throw new Error(err.message);
      setExpenses((prev) => [mapExpense(data as Record<string, unknown>), ...prev]);
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return {
    expenses,
    loading,
    error,
    fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    restoreExpense,
  };
}
