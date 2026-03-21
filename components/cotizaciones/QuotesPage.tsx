"use client";

import { useState } from "react";
import { useQuotes } from "@/lib/hooks/useQuotes";
import type { Quote } from "@/lib/types";
import type { QuoteFormData } from "@/lib/schemas/quote";
import { QuotesList } from "./QuotesList";
import { QuoteEditor } from "./QuoteEditor";

type View =
  | { type: "list" }
  | { type: "editor"; quote: Quote | null; nextNum: string };

export function QuotesPage() {
  const { quotes, loading, createQuote, updateQuote, deleteQuote, getNextQuoteNumber } =
    useQuotes();
  const [view, setView] = useState<View>({ type: "list" });

  async function handleNew() {
    const nextNum = await getNextQuoteNumber();
    setView({ type: "editor", quote: null, nextNum });
  }

  function handleEdit(quote: Quote) {
    setView({ type: "editor", quote, nextNum: quote.quoteNumber });
  }

  function handleBack() {
    setView({ type: "list" });
  }

  async function handleCreate(data: QuoteFormData): Promise<Quote> {
    return createQuote(data);
  }

  async function handleUpdate(id: string, data: QuoteFormData): Promise<Quote> {
    return updateQuote(id, data);
  }

  return (
    <div className="space-y-6">
      {view.type === "list" && (
        <>
          <div>
            <h1 className="text-2xl font-semibold">Cotizaciones</h1>
            <p className="text-sm text-muted-foreground">
              Crea y gestiona cotizaciones para tus clientes.
            </p>
          </div>
          <QuotesList
            quotes={quotes}
            loading={loading}
            onNew={handleNew}
            onEdit={handleEdit}
            onDelete={deleteQuote}
          />
        </>
      )}

      {view.type === "editor" && (
        <QuoteEditor
          quote={view.quote}
          onBack={handleBack}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
          nextQuoteNumber={view.nextNum}
        />
      )}
    </div>
  );
}
