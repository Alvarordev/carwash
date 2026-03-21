import type { UUID, Timestamps } from "./common";

export type QuoteStatus = "borrador" | "enviada" | "aceptada" | "rechazada";

export type QuoteItem = {
  id: UUID;
  quoteId: UUID;
  description: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  sortOrder: number;
};

export type Quote = {
  id: UUID;
  quoteNumber: string;
  date: string;
  clientName: string | null;
  clientDocType: string | null;
  clientDocNumber: string | null;
  clientPhone: string | null;
  clientEmail: string | null;
  clientAddress: string | null;
  companyName: string | null;
  companyRuc: string | null;
  companyOwnerName: string | null;
  companyAddress: string | null;
  companyPhone: string | null;
  companyLogoUrl: string | null;
  items: QuoteItem[];
  subtotal: number;
  igv: number;
  total: number;
  paymentMethod: string | null;
  colorTheme: string;
  notes: string | null;
  status: QuoteStatus;
} & Timestamps;
