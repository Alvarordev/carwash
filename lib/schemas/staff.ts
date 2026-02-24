import { z } from "zod";

export const STAFF_ROLES = [
  { value: "admin", label: "Administrador" },
  { value: "washer", label: "Lavador" },
  { value: "cashier", label: "Cajero" },
  { value: "supervisor", label: "Supervisor" },
] as const;

export const DOC_TYPES = [
  { value: "dni", label: "DNI" },
  { value: "carnet_extranjeria", label: "Carnet de Extranjería" },
  { value: "pasaporte", label: "Pasaporte" },
] as const;

export const staffSchema = z.object({
  firstName: z
    .string()
    .min(1, "El nombre es requerido")
    .max(50, "Máximo 50 caracteres"),
  lastName: z
    .string()
    .min(1, "El apellido es requerido")
    .max(50, "Máximo 50 caracteres"),
  docType: z
    .enum(["dni", "carnet_extranjeria", "pasaporte"])
    .nullable()
    .optional(),
  docNumber: z
    .string()
    .max(20, "Máximo 20 caracteres")
    .nullable()
    .optional(),
  role: z.enum(["admin", "washer", "cashier", "supervisor"]),
  phone: z
    .string()
    .max(20, "Máximo 20 caracteres")
    .nullable()
    .optional(),
  email: z
    .string()
    .email("Email inválido")
    .max(100, "Máximo 100 caracteres")
    .nullable()
    .optional(),
  status: z.enum(["active", "inactive"]),
});

export type StaffFormData = z.infer<typeof staffSchema>;
