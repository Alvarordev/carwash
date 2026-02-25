// order.ts
// Main type definitions for Order entity in system

export type OrderStatus = "Pendiente" | "En Proceso" | "Cancelado" | "Entregado";

export type OrderItem = {
  serviceId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
};

export type OrderStaffAssignment = {
  staffId: string;
  name: string;
  role?: string;
};

export type OrderStatusHistoryEntry = {
  status: OrderStatus;
  at: string; // ISO
  by?: string;
  note?: string;
};

export interface Order {
  id: string | number;
  orderNumber: string;
  customerId?: string;
  customerName: string;
  vehicleId?: string;
  vehiclePlate: string;
  vehicleMakeModel: string;
  items: OrderItem[];
  subtotal: number;
  discounts?: number;
  total: number;
  status: OrderStatus;
  paymentStatus?: "pendiente" | "pagado" | "parcial";
  paymentMethod?: string;
  registeredAt: string; // ISO string
  updatedAt?: string;
  cancelReason?: string | null;
  notes?: string;
  attachments?: string[]; // urls
  staff?: OrderStaffAssignment[];
  statusHistory?: OrderStatusHistoryEntry[];
}
