"use client";

import { useState, useEffect, useCallback } from "react";
import type { Quote, QuoteItem } from "@/lib/types";
import type { QuoteFormData } from "@/lib/schemas/quote";
import { createClient } from "@/lib/supabase/client";
import { getCompanyId } from "@/lib/supabase/get-company-id";

function mapQuoteItem(row: Record<string, unknown>): QuoteItem {
  return {
    id: row.id as string,
    quoteId: row.quote_id as string,
    description: row.description as string,
    quantity: Number(row.quantity),
    unitPrice: Number(row.unit_price),
    subtotal: Number(row.subtotal),
    sortOrder: Number(row.sort_order),
  };
}

function mapQuote(row: Record<string, unknown>): Quote {
  const items = (row.quote_items as Record<string, unknown>[] | null) ?? [];
  return {
    id: row.id as string,
    quoteNumber: row.quote_number as string,
    date: row.date as string,
    clientName: (row.client_name as string) ?? null,
    clientDocType: (row.client_doc_type as string) ?? null,
    clientDocNumber: (row.client_doc_number as string) ?? null,
    clientPhone: (row.client_phone as string) ?? null,
    clientEmail: (row.client_email as string) ?? null,
    clientAddress: (row.client_address as string) ?? null,
    companyName: (row.company_name as string) ?? null,
    companyRuc: (row.company_ruc as string) ?? null,
    companyOwnerName: (row.company_owner_name as string) ?? null,
    companyAddress: (row.company_address as string) ?? null,
    companyPhone: (row.company_phone as string) ?? null,
    companyLogoUrl: (row.company_logo_url as string) ?? null,
    subtotal: Number(row.subtotal),
    igv: Number(row.igv),
    total: Number(row.total),
    paymentMethod: (row.payment_method as string) ?? null,
    colorTheme: (row.color_theme as string) ?? "#3B82F6",
    notes: (row.notes as string) ?? null,
    status: row.status as Quote["status"],
    items: items.map(mapQuoteItem),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function computeTotals(items: QuoteFormData["items"]) {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const igv = Math.round(subtotal * 0.18 * 100) / 100;
  const total = Math.round((subtotal + igv) * 100) / 100;
  return { subtotal: Math.round(subtotal * 100) / 100, igv, total };
}

export function useQuotes() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchQuotes = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: err } = await supabase
        .from("quotes")
        .select("*, quote_items(*)")
        .order("created_at", { ascending: false });

      if (err) throw new Error(err.message);
      setQuotes((data ?? []).map((r) => mapQuote(r as Record<string, unknown>)));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  const getNextQuoteNumber = useCallback(async (): Promise<string> => {
    const company_id = await getCompanyId();
    const { data } = await supabase
      .from("quotes")
      .select("quote_number")
      .eq("company_id", company_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!data?.quote_number) return "COT-001";

    const match = data.quote_number.match(/(\d+)$/);
    if (!match) return "COT-001";

    const next = parseInt(match[1], 10) + 1;
    return `COT-${String(next).padStart(3, "0")}`;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const createQuote = useCallback(
    async (data: QuoteFormData): Promise<Quote> => {
      const company_id = await getCompanyId();
      const { subtotal, igv, total } = computeTotals(data.items);

      const { data: created, error: err } = await supabase
        .from("quotes")
        .insert({
          company_id,
          quote_number: data.quoteNumber,
          date: data.date,
          status: data.status,
          client_name: data.clientName || null,
          client_doc_type: data.clientDocType || null,
          client_doc_number: data.clientDocNumber || null,
          client_phone: data.clientPhone || null,
          client_email: data.clientEmail || null,
          client_address: data.clientAddress || null,
          company_name: data.companyName || null,
          company_ruc: data.companyRuc || null,
          company_owner_name: data.companyOwnerName || null,
          company_address: data.companyAddress || null,
          company_phone: data.companyPhone || null,
          company_logo_url: data.companyLogoUrl || null,
          subtotal,
          igv,
          total,
          payment_method: data.paymentMethod || null,
          color_theme: data.colorTheme,
          notes: data.notes || null,
        })
        .select()
        .single();

      if (err) throw new Error(err.message);

      const quoteId = (created as Record<string, unknown>).id as string;

      if (data.items.length > 0) {
        const itemsToInsert = data.items.map((item, index) => ({
          quote_id: quoteId,
          company_id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          subtotal: Math.round(item.quantity * item.unitPrice * 100) / 100,
          sort_order: index,
        }));

        const { error: itemsErr } = await supabase.from("quote_items").insert(itemsToInsert);
        if (itemsErr) throw new Error(itemsErr.message);
      }

      const { data: full, error: fetchErr } = await supabase
        .from("quotes")
        .select("*, quote_items(*)")
        .eq("id", quoteId)
        .single();

      if (fetchErr) throw new Error(fetchErr.message);
      const newQuote = mapQuote(full as Record<string, unknown>);
      setQuotes((prev) => [newQuote, ...prev]);
      return newQuote;
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const updateQuote = useCallback(
    async (id: string, data: QuoteFormData): Promise<Quote> => {
      const company_id = await getCompanyId();
      const { subtotal, igv, total } = computeTotals(data.items);

      const { error: updateErr } = await supabase
        .from("quotes")
        .update({
          quote_number: data.quoteNumber,
          date: data.date,
          status: data.status,
          client_name: data.clientName || null,
          client_doc_type: data.clientDocType || null,
          client_doc_number: data.clientDocNumber || null,
          client_phone: data.clientPhone || null,
          client_email: data.clientEmail || null,
          client_address: data.clientAddress || null,
          company_name: data.companyName || null,
          company_ruc: data.companyRuc || null,
          company_owner_name: data.companyOwnerName || null,
          company_address: data.companyAddress || null,
          company_phone: data.companyPhone || null,
          company_logo_url: data.companyLogoUrl || null,
          subtotal,
          igv,
          total,
          payment_method: data.paymentMethod || null,
          color_theme: data.colorTheme,
          notes: data.notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (updateErr) throw new Error(updateErr.message);

      await supabase.from("quote_items").delete().eq("quote_id", id);

      if (data.items.length > 0) {
        const itemsToInsert = data.items.map((item, index) => ({
          quote_id: id,
          company_id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          subtotal: Math.round(item.quantity * item.unitPrice * 100) / 100,
          sort_order: index,
        }));
        const { error: itemsErr } = await supabase.from("quote_items").insert(itemsToInsert);
        if (itemsErr) throw new Error(itemsErr.message);
      }

      const { data: full, error: fetchErr } = await supabase
        .from("quotes")
        .select("*, quote_items(*)")
        .eq("id", id)
        .single();

      if (fetchErr) throw new Error(fetchErr.message);
      const updated = mapQuote(full as Record<string, unknown>);
      setQuotes((prev) => prev.map((q) => (q.id === id ? updated : q)));
      return updated;
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const deleteQuote = useCallback(async (id: string): Promise<void> => {
    const { error: err } = await supabase.from("quotes").delete().eq("id", id);
    if (err) throw new Error(err.message);
    setQuotes((prev) => prev.filter((q) => q.id !== id));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    quotes,
    loading,
    error,
    fetchQuotes,
    getNextQuoteNumber,
    createQuote,
    updateQuote,
    deleteQuote,
  };
}
