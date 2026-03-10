import { z } from "zod";

export const expenseSchema = z.object({
  detail: z.string().min(1, "El detalle es requerido").max(200, "Máximo 200 caracteres"),
  categoryId: z.string().min(1, "La categoría es requerida"),
  staffMemberId: z.string().nullable().optional(),
  amount: z.coerce.number().positive("El monto debe ser mayor a 0"),
  date: z.string().min(1, "La fecha es requerida"),
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;
