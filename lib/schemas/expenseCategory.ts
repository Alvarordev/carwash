import { z } from "zod";

export const expenseCategorySchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(50, "Máximo 50 caracteres"),
  description: z.string().nullable().optional(),
});

export type ExpenseCategoryFormData = z.infer<typeof expenseCategorySchema>;
