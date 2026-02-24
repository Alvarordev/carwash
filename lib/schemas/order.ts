import { z } from "zod";

export const ORDER_STATUSES = [
  { value: "pending", label: "Pendiente", color: "text-yellow-500" },
  { value: "completed", label: "Completado", color: "text-blue-500" },
  { value: "delivered", label: "Entregado", color: "text-green-500" },
  { value: "cancelled", label: "Cancelado", color: "text-red-500" },
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
  status: z.enum(["pending", "completed", "delivered", "cancelled"]),
});

export type OrderFormData = z.infer<typeof orderSchema>;
