"use client";

import { useState, useEffect, useCallback } from "react";
import type { PaymentMethod } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { getCompanyId } from "@/lib/supabase/get-company-id";

function mapPaymentMethod(row: Record<string, unknown>): PaymentMethod {
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

export function usePaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  const fetchPaymentMethods = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("payment_methods")
        .select("*")
        .order("name");

      if (error) throw error;
      setPaymentMethods((data ?? []).map(mapPaymentMethod));
    } catch {
      setPaymentMethods([]);
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchPaymentMethods();
  }, [fetchPaymentMethods]);

  const createPaymentMethod = useCallback(
    async (data: { name: string; description?: string | null }): Promise<PaymentMethod> => {
      const company_id = await getCompanyId();
      const { data: created, error } = await supabase
        .from("payment_methods")
        .insert({ company_id, name: data.name, description: data.description || null })
        .select()
        .single();

      if (error) throw new Error(error.message);
      const newMethod = mapPaymentMethod(created as Record<string, unknown>);
      setPaymentMethods((prev) =>
        [...prev, newMethod].sort((a, b) => a.name.localeCompare(b.name))
      );
      return newMethod;
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const updatePaymentMethod = useCallback(
    async (id: string, data: { name: string; description?: string | null }): Promise<PaymentMethod> => {
      const { data: updated, error } = await supabase
        .from("payment_methods")
        .update({ name: data.name, description: data.description || null })
        .eq("id", id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      const result = mapPaymentMethod(updated as Record<string, unknown>);
      setPaymentMethods((prev) => prev.map((pm) => (pm.id === id ? result : pm)));
      return result;
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const updatePaymentMethodStatus = useCallback(
    async (id: string, isActive: boolean): Promise<void> => {
      const { data: updated, error } = await supabase
        .from("payment_methods")
        .update({ is_active: isActive })
        .eq("id", id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      setPaymentMethods((prev) =>
        prev.map((pm) => (pm.id === id ? mapPaymentMethod(updated as Record<string, unknown>) : pm))
      );
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const deletePaymentMethod = useCallback(async (id: string): Promise<void> => {
    const { error } = await supabase.from("payment_methods").delete().eq("id", id);
    if (error) throw new Error(error.message);
    setPaymentMethods((prev) => prev.filter((pm) => pm.id !== id));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    paymentMethods,
    loading,
    createPaymentMethod,
    updatePaymentMethod,
    updatePaymentMethodStatus,
    deletePaymentMethod,
  };
}
