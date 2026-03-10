import { z } from "zod";

export const SERVICE_ICONS = [
  { value: "car", label: "Auto" },
  { value: "droplet", label: "Agua" },
  { value: "star", label: "Estrella" },
  { value: "soap", label: "Jabón" },
  { value: "leaf", label: "Eco" },
  { value: "flash", label: "Express" },
  { value: "sun", label: "Sol" },
  { value: "wind", label: "Viento" },
  { value: "wrench", label: "Servicio" },
  { value: "tools", label: "Detalle" },
  { value: "shield", label: "Protección" },
  { value: "flame", label: "Tratamiento" },
  { value: "bright-star", label: "Brillo" },
] as const;

export type ServiceIconKey = (typeof SERVICE_ICONS)[number]["value"];

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
  categoryId: z.string().min(1, "La categoría es requerida"),
  status: z.enum(["active", "inactive"]),
  color: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
});

export type ServiceFormData = z.infer<typeof serviceSchema>;

export const servicePricingSchema = z.object({
  serviceId: z.string().min(1, "El servicio es requerido"),
  vehicleTypeId: z.string().min(1, "El tipo de vehículo es requerido"),
  price: z.number().min(0, "El precio debe ser mayor a 0"),
  status: z.enum(["active", "inactive"]),
});

export type ServicePricingFormData = z.infer<typeof servicePricingSchema>;
