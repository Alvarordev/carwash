import type { UUID, Timestamps } from "./common";

export type OrderStatus = "pending" | "completed" | "delivered" | "cancelled";

export type OrderItem = {
  serviceId: UUID;
  serviceName: string;
  servicePricingId: UUID;
  vehicleTypeId: UUID;
  vehicleTypeName: string;
  price: number;
};

export type OrderStaffAssignment = {
  staffId: UUID;
  staffName: string;
};

export type Order = {
  id: UUID;
  orderNumber: string;
  vehicleId: UUID;
  customerId: UUID | null;
  items: OrderItem[];
  promotionIds: UUID[];
  staffAssignments: OrderStaffAssignment[];
  images: string[];
  subtotal: number;
  discount: number;
  total: number;
  status: OrderStatus;
  notes: string | null;
  registeredAt: string;
  completedAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
} & Timestamps;
