import { z } from "zod";

export const ORDER_STATUSES = [
  { value: "En Proceso", label: "En Proceso", color: "text-blue-400" },
  { value: "Lavando", label: "Lavando", color: "text-cyan-400" },
  { value: "Terminado", label: "Terminado", color: "text-purple-400" },
  { value: "Entregado", label: "Entregado", color: "text-green-400" },
  { value: "Anulado", label: "Anulado", color: "text-red-500" },
] as const;

export const orderItemSchema = z.object({
  serviceId: z.string().min(1, "El servicio es requerido"),
  serviceName: z.string(),
  servicePricingId: z.string().min(1, "La pricing es requerida"),
  vehicleTypeId: z.string().min(1, "El tipo de vehículo es requerido"),
  vehicleTypeName: z.string(),
  price: z.number().min(0),
});

export const orderStaffAssignmentSchema = z.object({
  staffId: z.string().min(1, "El personal es requerido"),
  staffName: z.string(),
});

export const orderSchema = z.object({
  vehicleId: z.string().min(1, "El vehículo es requerido"),
  customerId: z.string().nullable().optional(),
  items: z.array(orderItemSchema).min(1, "Debe agregar al menos un servicio"),
  promotionIds: z.array(z.string()).default([]),
  staffAssignments: z.array(orderStaffAssignmentSchema).default([]),
  images: z.array(z.string()).default([]),
  notes: z.string().max(500).nullable().optional(),
  status: z.enum(["En Proceso", "Lavando", "Terminado", "Entregado", "Anulado"]),
});

export type OrderFormData = z.infer<typeof orderSchema>;
