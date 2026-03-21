import { z } from "zod";

export const QUOTE_STATUSES = [
  { value: "borrador", label: "Borrador" },
  { value: "enviada", label: "Enviada" },
  { value: "aceptada", label: "Aceptada" },
  { value: "rechazada", label: "Rechazada" },
] as const;

export const QUOTE_COLOR_THEMES = [
  "#3B82F6",
  "#06B6D4",
  "#22C55E",
  "#10B981",
  "#A855F7",
  "#8B5CF6",
  "#EC4899",
  "#EF4444",
  "#F97316",
  "#EAB308",
  "#0F172A",
] as const;

export const quoteItemSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, "La descripción es requerida"),
  quantity: z.coerce.number().int().min(1, "Mínimo 1"),
  unitPrice: z.coerce.number().min(0, "El precio debe ser mayor o igual a 0"),
});

export const quoteSchema = z.object({
  quoteNumber: z.string().min(1, "El número de cotización es requerido"),
  date: z.string().min(1, "La fecha es requerida"),
  status: z.enum(["borrador", "enviada", "aceptada", "rechazada"]).default("borrador"),

  companyName: z.string().nullable().optional(),
  companyRuc: z.string().nullable().optional(),
  companyOwnerName: z.string().nullable().optional(),
  companyAddress: z.string().nullable().optional(),
  companyPhone: z.string().nullable().optional(),
  companyLogoUrl: z.string().nullable().optional(),

  clientName: z.string().nullable().optional(),
  clientDocType: z.string().nullable().optional(),
  clientDocNumber: z.string().nullable().optional(),
  clientPhone: z.string().nullable().optional(),
  clientEmail: z
    .string()
    .email("Email inválido")
    .nullable()
    .optional()
    .or(z.literal("")),
  clientAddress: z.string().nullable().optional(),

  items: z.array(quoteItemSchema).min(1, "Debe agregar al menos un ítem"),

  paymentMethod: z.string().nullable().optional(),
  colorTheme: z.string().default("#3B82F6"),
  notes: z.string().max(500).nullable().optional(),
});

export type QuoteFormData = z.infer<typeof quoteSchema>;
export type QuoteItemFormData = z.infer<typeof quoteItemSchema>;
