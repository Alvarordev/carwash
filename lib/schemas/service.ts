import { z } from "zod";

export const SERVICE_CATEGORIES = [
  { value: "exterior", label: "Exterior" },
  { value: "interior", label: "Interior y Detalle" },
  { value: "detalle", label: "Detalle" },
  { value: "añadido", label: "Añadidos" },
] as const;

export const serviceSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(100, "Máximo 100 caracteres"),
  description: z
    .string()
    .max(500, "Máximo 500 caracteres")
    .nullable()
    .optional(),
  category: z.enum(["exterior", "interior", "detalle", "añadido"]),
  status: z.enum(["active", "inactive"]),
});

export type ServiceFormData = z.infer<typeof serviceSchema>;

export const servicePricingSchema = z.object({
  serviceId: z.string().min(1, "El servicio es requerido"),
  vehicleTypeId: z.string().min(1, "El tipo de vehículo es requerido"),
  price: z.number().min(0, "El precio debe ser mayor a 0"),
  status: z.enum(["active", "inactive"]),
});

export type ServicePricingFormData = z.infer<typeof servicePricingSchema>;
