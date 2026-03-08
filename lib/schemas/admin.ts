import { z } from "zod";

export const createUserSchema = z.object({
  firstName: z.string().min(2, "Mínimo 2 caracteres").max(50),
  lastName: z.string().min(2, "Mínimo 2 caracteres").max(50),
  email: z.string().email("Email inválido").max(150),
  password: z.string().min(8, "Mínimo 8 caracteres").max(72),
  role: z.enum(["admin", "operator"]),
  // Either pick an existing company or create a new one
  companyId: z.string().uuid().optional(),
  newCompanyName: z.string().min(2).max(100).optional(),
}).refine(
  (data) => data.companyId || data.newCompanyName,
  {
    message: "Debes seleccionar una empresa o crear una nueva",
    path: ["companyId"],
  }
);

export type CreateUserFormData = z.infer<typeof createUserSchema>;
