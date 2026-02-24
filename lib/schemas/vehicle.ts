import { z } from "zod";

export const vehicleSchema = z.object({
  plate: z
    .string()
    .min(1, "La placa es requerida")
    .max(20, "La placa no puede tener más de 20 caracteres"),
  brand: z.string().min(1, "La marca es requerida").max(50, "Máximo 50 caracteres"),
  model: z.string().max(50, "Máximo 50 caracteres").nullable().optional(),
  color: z.string().min(1, "El color es requerido").max(30, "Máximo 30 caracteres"),
  vehicleTypeId: z.string().min(1, "El tipo de vehículo es requerido"),
  status: z.enum(["active", "inactive"]),
});

export type VehicleFormData = z.infer<typeof vehicleSchema>;
