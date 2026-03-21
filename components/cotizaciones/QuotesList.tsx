"use client";

import { useState } from "react";
import { toast } from "sonner";
import { EditPencil, Trash, Download, Plus, Search } from "iconoir-react";
import type { Quote } from "@/lib/types";
import type { QuoteFormData } from "@/lib/schemas/quote";
import { QUOTE_STATUSES } from "@/lib/schemas/quote";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteQuoteDialog } from "./DeleteQuoteDialog";
import { generateQuotePdf } from "@/lib/utils/quote-pdf";

const STATUS_VARIANT: Record<string, string> = {
  borrador: "bg-muted text-muted-foreground",
  enviada: "bg-secondary/20 text-secondary-foreground",
  aceptada: "bg-status-3/20 text-foreground",
  rechazada: "bg-destructive/20 text-destructive-foreground",
};

type QuotesListProps = Readonly<{
  quotes: Quote[];
  loading: boolean;
  onNew: () => void;
  onEdit: (quote: Quote) => void;
  onDelete: (id: string) => Promise<void>;
}>;

export function QuotesList({ quotes, loading, onNew, onEdit, onDelete }: QuotesListProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingQuote, setDeletingQuote] = useState<Quote | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filtered = quotes.filter((q) => {
    const matchSearch =
      !search ||
      q.quoteNumber.toLowerCase().includes(search.toLowerCase()) ||
      (q.clientName ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || q.status === statusFilter;
    return matchSearch && matchStatus;
  });

  function handleOpenDelete(quote: Quote) {
    setDeletingQuote(quote);
    setDeleteDialogOpen(true);
  }

  async function handleConfirmDelete() {
    if (!deletingQuote) return;
    setIsDeleting(true);
    try {
      await onDelete(deletingQuote.id);
      toast.success("Cotización eliminada");
      setDeleteDialogOpen(false);
    } catch {
      toast.error("Error al eliminar la cotización");
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleDownload(quote: Quote) {
    try {
      const formData: QuoteFormData = {
        quoteNumber: quote.quoteNumber,
        date: quote.date,
        status: quote.status,
        companyName: quote.companyName ?? "",
        companyRuc: quote.companyRuc ?? "",
        companyOwnerName: quote.companyOwnerName ?? "",
        companyAddress: quote.companyAddress ?? "",
        companyPhone: quote.companyPhone ?? "",
        companyLogoUrl: quote.companyLogoUrl ?? "",
        clientName: quote.clientName ?? "",
        clientDocType: quote.clientDocType ?? "",
        clientDocNumber: quote.clientDocNumber ?? "",
        clientPhone: quote.clientPhone ?? "",
        clientEmail: quote.clientEmail ?? "",
        clientAddress: quote.clientAddress ?? "",
        items: quote.items.map((i) => ({
          id: i.id,
          description: i.description,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
        paymentMethod: quote.paymentMethod ?? "",
        colorTheme: quote.colorTheme,
        notes: quote.notes ?? "",
      };
      await generateQuotePdf(formData);
    } catch {
      toast.error("Error al generar el PDF");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-1 max-w-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por número o cliente..."
              className="pl-9 bg-card border-border rounded-md"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-card border-border rounded-md w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all">Todos</SelectItem>
              {QUOTE_STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button size="sm" onClick={onNew}>
          <Plus className="size-4 mr-1.5" />
          Nueva cotización
        </Button>
      </div>

      {loading ? (
        <div className="bg-card border border-border rounded-xl py-16 text-center text-muted-foreground text-sm">
          Cargando...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-xl py-16 text-center space-y-3">
          <p className="text-muted-foreground text-sm">
            {quotes.length === 0
              ? "No hay cotizaciones registradas."
              : "No se encontraron resultados."}
          </p>
          {quotes.length === 0 && (
            <Button size="sm" variant="outline" onClick={onNew}>
              <Plus className="size-4 mr-1.5" />
              Crear primera cotización
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">N°</TableHead>
                <TableHead className="text-muted-foreground">Fecha</TableHead>
                <TableHead className="text-muted-foreground">Cliente</TableHead>
                <TableHead className="text-muted-foreground text-right">Total</TableHead>
                <TableHead className="text-muted-foreground">Estado</TableHead>
                <TableHead className="text-muted-foreground w-28" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((quote) => (
                <TableRow key={quote.id} className="border-border hover:bg-card-alt/50">
                  <TableCell className="font-medium">{quote.quoteNumber}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{quote.date}</TableCell>
                  <TableCell className="text-sm">{quote.clientName || "—"}</TableCell>
                  <TableCell className="text-right font-medium">
                    S/ {quote.total.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge className={STATUS_VARIANT[quote.status] ?? ""}>
                      {QUOTE_STATUSES.find((s) => s.value === quote.status)?.label ?? quote.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 justify-end">
                      <Button
                        size="icon-xs"
                        variant="ghost"
                        onClick={() => handleDownload(quote)}
                        title="Descargar PDF"
                      >
                        <Download className="size-4" />
                      </Button>
                      <Button
                        size="icon-xs"
                        variant="ghost"
                        onClick={() => onEdit(quote)}
                        title="Editar"
                      >
                        <EditPencil className="size-4" />
                      </Button>
                      <Button
                        size="icon-xs"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleOpenDelete(quote)}
                        title="Eliminar"
                      >
                        <Trash className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <DeleteQuoteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        quote={deletingQuote}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
