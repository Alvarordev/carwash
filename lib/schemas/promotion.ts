import { z } from "zod";

export const DISCOUNT_TYPES = [
  { value: "percentage", label: "Porcentaje (%)" },
  { value: "fixed", label: "Monto fijo (S/)" },
] as const;

export const PROMOTION_SCOPES = [
  { value: "all", label: "Todos los servicios" },
  { value: "service", label: "Servicio específico" },
  { value: "vehicleType", label: "Tipo de vehículo" },
] as const;

export const promotionSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(100, "Máximo 100 caracteres"),
  description: z
    .string()
    .max(500, "Máximo 500 caracteres")
    .nullable()
    .optional(),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.number().min(0, "El valor debe ser mayor a 0"),
  scope: z.enum(["all", "service", "vehicleType"]),
  scopeIds: z.array(z.string()).default([]),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  status: z.enum(["active", "inactive"]),
});

export type PromotionFormData = z.infer<typeof promotionSchema>;
