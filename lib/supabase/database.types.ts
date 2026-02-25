export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            customers: {
                Row: {
                    created_at: string
                    doc_number: string | null
                    doc_type: Database["public"]["Enums"]["document_type"] | null
                    email: string | null
                    first_name: string
                    id: string
                    last_name: string
                    phone: string | null
                    status: Database["public"]["Enums"]["status"]
                    updated_at: string
                }
                Insert: {
                    created_at?: string
                    doc_number?: string | null
                    doc_type?: Database["public"]["Enums"]["document_type"] | null
                    email?: string | null
                    first_name: string
                    id?: string
                    last_name: string
                    phone?: string | null
                    status?: Database["public"]["Enums"]["status"]
                    updated_at?: string
                }
                Update: {
                    created_at?: string
                    doc_number?: string | null
                    doc_type?: Database["public"]["Enums"]["document_type"] | null
                    email?: string | null
                    first_name?: string
                    id?: string
                    last_name?: string
                    phone?: string | null
                    status?: Database["public"]["Enums"]["status"]
                    updated_at?: string
                }
                Relationships: []
            }
            inventory_items: {
                Row: {
                    created_at: string
                    description: string | null
                    id: string
                    min_quantity: number
                    name: string
                    quantity: number
                    status: Database["public"]["Enums"]["status"]
                    unit: string
                    updated_at: string
                }
                Insert: {
                    created_at?: string
                    description?: string | null
                    id?: string
                    min_quantity?: number
                    name: string
                    quantity?: number
                    status?: Database["public"]["Enums"]["status"]
                    unit: string
                    updated_at?: string
                }
                Update: {
                    created_at?: string
                    description?: string | null
                    id?: string
                    min_quantity?: number
                    name?: string
                    quantity?: number
                    status?: Database["public"]["Enums"]["status"]
                    unit?: string
                    updated_at?: string
                }
                Relationships: []
            }
            order_attachments: {
                Row: {
                    created_at: string
                    id: string
                    order_id: string
                    url: string
                }
                Insert: {
                    created_at?: string
                    id?: string
                    order_id: string
                    url: string
                }
                Update: {
                    created_at?: string
                    id?: string
                    order_id?: string
                    url?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "order_attachments_order_id_fkey"
                        columns: ["order_id"]
                        isOneToOne: false
                        referencedRelation: "orders"
                        referencedColumns: ["id"]
                    },
                ]
            }
            order_items: {
                Row: {
                    created_at: string
                    id: string
                    order_id: string
                    quantity: number
                    service_id: string | null
                    service_name: string
                    subtotal: number
                    unit_price: number
                }
                Insert: {
                    created_at?: string
                    id?: string
                    order_id: string
                    quantity?: number
                    service_id?: string | null
                    service_name: string
                    subtotal: number
                    unit_price: number
                }
                Update: {
                    created_at?: string
                    id?: string
                    order_id?: string
                    quantity?: number
                    service_id?: string | null
                    service_name?: string
                    subtotal?: number
                    unit_price?: number
                }
                Relationships: [
                    {
                        foreignKeyName: "order_items_order_id_fkey"
                        columns: ["order_id"]
                        isOneToOne: false
                        referencedRelation: "orders"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "order_items_service_id_fkey"
                        columns: ["service_id"]
                        isOneToOne: false
                        referencedRelation: "services"
                        referencedColumns: ["id"]
                    },
                ]
            }
            order_staff: {
                Row: {
                    created_at: string
                    id: string
                    order_id: string
                    role_snapshot: Database["public"]["Enums"]["staff_role"] | null
                    staff_id: string | null
                    staff_name: string
                }
                Insert: {
                    created_at?: string
                    id?: string
                    order_id: string
                    role_snapshot?: Database["public"]["Enums"]["staff_role"] | null
                    staff_id?: string | null
                    staff_name: string
                }
                Update: {
                    created_at?: string
                    id?: string
                    order_id?: string
                    role_snapshot?: Database["public"]["Enums"]["staff_role"] | null
                    staff_id?: string | null
                    staff_name?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "order_staff_order_id_fkey"
                        columns: ["order_id"]
                        isOneToOne: false
                        referencedRelation: "orders"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "order_staff_staff_id_fkey"
                        columns: ["staff_id"]
                        isOneToOne: false
                        referencedRelation: "staff_members"
                        referencedColumns: ["id"]
                    },
                ]
            }
            order_status_history: {
                Row: {
                    changed_by: string | null
                    created_at: string
                    id: string
                    note: string | null
                    order_id: string
                    status: Database["public"]["Enums"]["order_status"]
                }
                Insert: {
                    changed_by?: string | null
                    created_at?: string
                    id?: string
                    note?: string | null
                    order_id: string
                    status: Database["public"]["Enums"]["order_status"]
                }
                Update: {
                    changed_by?: string | null
                    created_at?: string
                    id?: string
                    note?: string | null
                    order_id?: string
                    status?: Database["public"]["Enums"]["order_status"]
                }
                Relationships: [
                    {
                        foreignKeyName: "order_status_history_changed_by_fkey"
                        columns: ["changed_by"]
                        isOneToOne: false
                        referencedRelation: "staff_members"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "order_status_history_order_id_fkey"
                        columns: ["order_id"]
                        isOneToOne: false
                        referencedRelation: "orders"
                        referencedColumns: ["id"]
                    },
                ]
            }
            orders: {
                Row: {
                    cancel_reason: string | null
                    cashier_id: string | null
                    created_at: string
                    customer_id: string | null
                    discounts: number
                    id: string
                    notes: string | null
                    order_number: string
                    payment_method: string | null
                    payment_status: Database["public"]["Enums"]["payment_status"] | null
                    status: Database["public"]["Enums"]["order_status"]
                    subtotal: number
                    total: number
                    updated_at: string
                    vehicle_id: string | null
                }
                Insert: {
                    cancel_reason?: string | null
                    cashier_id?: string | null
                    created_at?: string
                    customer_id?: string | null
                    discounts?: number
                    id?: string
                    notes?: string | null
                    order_number: string
                    payment_method?: string | null
                    payment_status?: Database["public"]["Enums"]["payment_status"] | null
                    status?: Database["public"]["Enums"]["order_status"]
                    subtotal?: number
                    total?: number
                    updated_at?: string
                    vehicle_id?: string | null
                }
                Update: {
                    cancel_reason?: string | null
                    cashier_id?: string | null
                    created_at?: string
                    customer_id?: string | null
                    discounts?: number
                    id?: string
                    notes?: string | null
                    order_number?: string
                    payment_method?: string | null
                    payment_status?: Database["public"]["Enums"]["payment_status"] | null
                    status?: Database["public"]["Enums"]["order_status"]
                    subtotal?: number
                    total?: number
                    updated_at?: string
                    vehicle_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "orders_cashier_id_fkey"
                        columns: ["cashier_id"]
                        isOneToOne: false
                        referencedRelation: "staff_members"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "orders_customer_id_fkey"
                        columns: ["customer_id"]
                        isOneToOne: false
                        referencedRelation: "customers"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "orders_vehicle_id_fkey"
                        columns: ["vehicle_id"]
                        isOneToOne: false
                        referencedRelation: "vehicles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            promotion_scopes: {
                Row: {
                    created_at: string
                    id: string
                    promotion_id: string
                    scope_ref_id: string
                }
                Insert: {
                    created_at?: string
                    id?: string
                    promotion_id: string
                    scope_ref_id: string
                }
                Update: {
                    created_at?: string
                    id?: string
                    promotion_id?: string
                    scope_ref_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "promotion_scopes_promotion_id_fkey"
                        columns: ["promotion_id"]
                        isOneToOne: false
                        referencedRelation: "promotions"
                        referencedColumns: ["id"]
                    },
                ]
            }
            promotions: {
                Row: {
                    created_at: string
                    description: string | null
                    discount_type: Database["public"]["Enums"]["discount_type"]
                    discount_value: number
                    end_date: string | null
                    id: string
                    name: string
                    scope: Database["public"]["Enums"]["promotion_scope_type"]
                    start_date: string | null
                    status: Database["public"]["Enums"]["status"]
                    updated_at: string
                }
                Insert: {
                    created_at?: string
                    description?: string | null
                    discount_type: Database["public"]["Enums"]["discount_type"]
                    discount_value: number
                    end_date?: string | null
                    id?: string
                    name: string
                    scope?: Database["public"]["Enums"]["promotion_scope_type"]
                    start_date?: string | null
                    status?: Database["public"]["Enums"]["status"]
                    updated_at?: string
                }
                Update: {
                    created_at?: string
                    description?: string | null
                    discount_type?: Database["public"]["Enums"]["discount_type"]
                    discount_value?: number
                    end_date?: string | null
                    id?: string
                    name?: string
                    scope?: Database["public"]["Enums"]["promotion_scope_type"]
                    start_date?: string | null
                    status?: Database["public"]["Enums"]["status"]
                    updated_at?: string
                }
                Relationships: []
            }
            service_pricing: {
                Row: {
                    created_at: string
                    id: string
                    price: number
                    service_id: string
                    status: Database["public"]["Enums"]["status"]
                    updated_at: string
                    vehicle_type_id: string
                }
                Insert: {
                    created_at?: string
                    id?: string
                    price: number
                    service_id: string
                    status?: Database["public"]["Enums"]["status"]
                    updated_at?: string
                    vehicle_type_id: string
                }
                Update: {
                    created_at?: string
                    id?: string
                    price?: number
                    service_id?: string
                    status?: Database["public"]["Enums"]["status"]
                    updated_at?: string
                    vehicle_type_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "service_pricing_service_id_fkey"
                        columns: ["service_id"]
                        isOneToOne: false
                        referencedRelation: "services"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "service_pricing_vehicle_type_id_fkey"
                        columns: ["vehicle_type_id"]
                        isOneToOne: false
                        referencedRelation: "vehicle_types"
                        referencedColumns: ["id"]
                    },
                ]
            }
            services: {
                Row: {
                    category: Database["public"]["Enums"]["service_category"]
                    created_at: string
                    description: string | null
                    id: string
                    name: string
                    status: Database["public"]["Enums"]["status"]
                    updated_at: string
                }
                Insert: {
                    category: Database["public"]["Enums"]["service_category"]
                    created_at?: string
                    description?: string | null
                    id?: string
                    name: string
                    status?: Database["public"]["Enums"]["status"]
                    updated_at?: string
                }
                Update: {
                    category?: Database["public"]["Enums"]["service_category"]
                    created_at?: string
                    description?: string | null
                    id?: string
                    name?: string
                    status?: Database["public"]["Enums"]["status"]
                    updated_at?: string
                }
                Relationships: []
            }
            staff_members: {
                Row: {
                    created_at: string
                    doc_number: string | null
                    doc_type: Database["public"]["Enums"]["document_type"] | null
                    email: string | null
                    first_name: string
                    id: string
                    last_name: string
                    phone: string | null
                    role: Database["public"]["Enums"]["staff_role"]
                    status: Database["public"]["Enums"]["status"]
                    updated_at: string
                }
                Insert: {
                    created_at?: string
                    doc_number?: string | null
                    doc_type?: Database["public"]["Enums"]["document_type"] | null
                    email?: string | null
                    first_name: string
                    id?: string
                    last_name: string
                    phone?: string | null
                    role: Database["public"]["Enums"]["staff_role"]
                    status?: Database["public"]["Enums"]["status"]
                    updated_at?: string
                }
                Update: {
                    created_at?: string
                    doc_number?: string | null
                    doc_type?: Database["public"]["Enums"]["document_type"] | null
                    email?: string | null
                    first_name?: string
                    id?: string
                    last_name?: string
                    phone?: string | null
                    role?: Database["public"]["Enums"]["staff_role"]
                    status?: Database["public"]["Enums"]["status"]
                    updated_at?: string
                }
                Relationships: []
            }
            vehicle_owners: {
                Row: {
                    created_at: string
                    customer_id: string
                    vehicle_id: string
                }
                Insert: {
                    created_at?: string
                    customer_id: string
                    vehicle_id: string
                }
                Update: {
                    created_at?: string
                    customer_id?: string
                    vehicle_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "vehicle_owners_customer_id_fkey"
                        columns: ["customer_id"]
                        isOneToOne: false
                        referencedRelation: "customers"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "vehicle_owners_vehicle_id_fkey"
                        columns: ["vehicle_id"]
                        isOneToOne: false
                        referencedRelation: "vehicles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            vehicle_types: {
                Row: {
                    created_at: string
                    description: string | null
                    id: string
                    name: string
                    status: Database["public"]["Enums"]["status"]
                    updated_at: string
                }
                Insert: {
                    created_at?: string
                    description?: string | null
                    id?: string
                    name: string
                    status?: Database["public"]["Enums"]["status"]
                    updated_at?: string
                }
                Update: {
                    created_at?: string
                    description?: string | null
                    id?: string
                    name?: string
                    status?: Database["public"]["Enums"]["status"]
                    updated_at?: string
                }
                Relationships: []
            }
            vehicles: {
                Row: {
                    brand: string
                    color: string
                    created_at: string
                    id: string
                    model: string | null
                    plate: string
                    status: Database["public"]["Enums"]["status"]
                    updated_at: string
                    vehicle_type_id: string
                }
                Insert: {
                    brand: string
                    color: string
                    created_at?: string
                    id?: string
                    model?: string | null
                    plate: string
                    status?: Database["public"]["Enums"]["status"]
                    updated_at?: string
                    vehicle_type_id: string
                }
                Update: {
                    brand?: string
                    color?: string
                    created_at?: string
                    id?: string
                    model?: string | null
                    plate?: string
                    status?: Database["public"]["Enums"]["status"]
                    updated_at?: string
                    vehicle_type_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "vehicles_vehicle_type_id_fkey"
                        columns: ["vehicle_type_id"]
                        isOneToOne: false
                        referencedRelation: "vehicle_types"
                        referencedColumns: ["id"]
                    },
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            discount_type: "percentage" | "fixed"
            document_type: "dni" | "carnet_extranjeria" | "pasaporte"
            order_status: "Pendiente" | "En Proceso" | "Cancelado" | "Entregado"
            payment_status: "pendiente" | "pagado" | "parcial"
            promotion_scope_type: "all" | "service" | "vehicleType"
            service_category: "exterior" | "interior" | "detalle" | "añadido"
            staff_role: "admin" | "washer" | "cashier" | "supervisor"
            status: "active" | "inactive"
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

type DefaultSchema = Database["public"]

export type Tables<T extends keyof DefaultSchema["Tables"]> =
    DefaultSchema["Tables"][T]["Row"]

export type TablesInsert<T extends keyof DefaultSchema["Tables"]> =
    DefaultSchema["Tables"][T]["Insert"]

export type TablesUpdate<T extends keyof DefaultSchema["Tables"]> =
    DefaultSchema["Tables"][T]["Update"]

export type Enums<T extends keyof DefaultSchema["Enums"]> =
    DefaultSchema["Enums"][T]
