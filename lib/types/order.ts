export type OrderStatus = "En Proceso" | "Terminado" | "Entregado" | "Cancelado";

export type OrderItem = {
  serviceId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  color: string | null;
  icon: string | null;
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

export type OrderCustomer = {
  id: string;
  firstName: string;
  lastName: string;
};

export type OrderVehicle = {
  id: string;
  plate: string;
  brand: string;
  model: string | null;
  color: string;
};

export interface Order {
  id: string | number;
  orderNumber: string;
  customer?: OrderCustomer;
  vehicle?: OrderVehicle;
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
  photos?: string[]; // urls
  attachments?: string[]; // urls
  staff?: OrderStaffAssignment[];
  statusHistory?: OrderStatusHistoryEntry[];
}
