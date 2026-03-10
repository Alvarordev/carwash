export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      companies: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
          status: Database["public"]["Enums"]["status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
          status?: Database["public"]["Enums"]["status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
          status?: Database["public"]["Enums"]["status"]
          updated_at?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          company_id: string
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
          company_id: string
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
          company_id?: string
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
        Relationships: [
          {
            foreignKeyName: "customers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_categories: {
        Row: {
          company_id: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expense_categories_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category_id: string
          company_id: string
          created_at: string
          date: string
          detail: string
          id: string
          staff_member_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          category_id: string
          company_id: string
          created_at?: string
          date?: string
          detail: string
          id?: string
          staff_member_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          category_id?: string
          company_id?: string
          created_at?: string
          date?: string
          detail?: string
          id?: string
          staff_member_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_staff_member_id_fkey"
            columns: ["staff_member_id"]
            isOneToOne: false
            referencedRelation: "staff_members"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          company_id: string
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
          company_id: string
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
          company_id?: string
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
        Relationships: [
          {
            foreignKeyName: "inventory_items_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      order_attachments: {
        Row: {
          company_id: string
          created_at: string
          id: string
          order_id: string
          url: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          order_id: string
          url: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          order_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_attachments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
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
          company_id: string
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
          company_id: string
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
          company_id?: string
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
            foreignKeyName: "order_items_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
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
          company_id: string
          created_at: string
          id: string
          order_id: string
          role_snapshot: Database["public"]["Enums"]["staff_role"] | null
          staff_id: string | null
          staff_name: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          order_id: string
          role_snapshot?: Database["public"]["Enums"]["staff_role"] | null
          staff_id?: string | null
          staff_name: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          order_id?: string
          role_snapshot?: Database["public"]["Enums"]["staff_role"] | null
          staff_id?: string | null
          staff_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_staff_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
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
          company_id: string
          created_at: string
          id: string
          note: string | null
          order_id: string
          status: Database["public"]["Enums"]["order_status"]
        }
        Insert: {
          changed_by?: string | null
          company_id: string
          created_at?: string
          id?: string
          note?: string | null
          order_id: string
          status: Database["public"]["Enums"]["order_status"]
        }
        Update: {
          changed_by?: string | null
          company_id?: string
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
            foreignKeyName: "order_status_history_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
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
          company_id: string
          created_at: string
          customer_id: string | null
          discounts: number
          id: string
          notes: string | null
          order_number: string
          payment_method: string | null
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          photos: string[]
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total: number
          updated_at: string
          vehicle_id: string | null
        }
        Insert: {
          cancel_reason?: string | null
          cashier_id?: string | null
          company_id: string
          created_at?: string
          customer_id?: string | null
          discounts?: number
          id?: string
          notes?: string | null
          order_number: string
          payment_method?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          photos?: string[]
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          total?: number
          updated_at?: string
          vehicle_id?: string | null
        }
        Update: {
          cancel_reason?: string | null
          cashier_id?: string | null
          company_id?: string
          created_at?: string
          customer_id?: string | null
          discounts?: number
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          photos?: string[]
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
            foreignKeyName: "orders_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
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
      payment_methods: {
        Row: {
          company_id: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_methods_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      promotion_scopes: {
        Row: {
          company_id: string
          created_at: string
          id: string
          promotion_id: string
          scope_ref_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          promotion_id: string
          scope_ref_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          promotion_id?: string
          scope_ref_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "promotion_scopes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
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
          company_id: string
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
          company_id: string
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
          company_id?: string
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
        Relationships: [
          {
            foreignKeyName: "promotions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      service_pricing: {
        Row: {
          company_id: string
          created_at: string
          id: string
          price: number
          service_id: string
          status: Database["public"]["Enums"]["status"]
          updated_at: string
          vehicle_type_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          price: number
          service_id: string
          status?: Database["public"]["Enums"]["status"]
          updated_at?: string
          vehicle_type_id: string
        }
        Update: {
          company_id?: string
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
            foreignKeyName: "service_pricing_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
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
          color: string | null
          company_id: string
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          status: Database["public"]["Enums"]["status"]
          updated_at: string
        }
        Insert: {
          category: Database["public"]["Enums"]["service_category"]
          color?: string | null
          company_id: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          status?: Database["public"]["Enums"]["status"]
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["service_category"]
          color?: string | null
          company_id?: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_members: {
        Row: {
          company_id: string
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
          company_id: string
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
          company_id?: string
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
        Relationships: [
          {
            foreignKeyName: "staff_members_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          company_id: string | null
          created_at: string | null
          email: string | null
          first_name: string
          id: string
          last_name: string
          role: string
          updated_at: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          email?: string | null
          first_name: string
          id: string
          last_name: string
          role?: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string
          role?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_owners: {
        Row: {
          company_id: string
          created_at: string
          customer_id: string
          vehicle_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          customer_id: string
          vehicle_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          customer_id?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_owners_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
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
          company_id: string
          created_at: string
          description: string | null
          id: string
          name: string
          status: Database["public"]["Enums"]["status"]
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          status?: Database["public"]["Enums"]["status"]
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_types_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          brand: string
          color: string
          company_id: string
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
          company_id: string
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
          company_id?: string
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
            foreignKeyName: "vehicles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_vehicle_type_id_fkey"
            columns: ["vehicle_type_id"]
            isOneToOne: false
            referencedRelation: "vehicle_types"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_config: {
        Row: {
          access_token: string
          company_id: string
          created_at: string
          id: string
          is_active: boolean
          phone_number_id: string
          updated_at: string
        }
        Insert: {
          access_token: string
          company_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          phone_number_id: string
          updated_at?: string
        }
        Update: {
          access_token?: string
          company_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          phone_number_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_config_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_message_log: {
        Row: {
          company_id: string
          created_at: string
          error: string | null
          id: string
          meta_message_id: string | null
          order_id: string | null
          phone: string
          sent_at: string | null
          status: Database["public"]["Enums"]["whatsapp_message_status"]
          template_body: string
        }
        Insert: {
          company_id: string
          created_at?: string
          error?: string | null
          id?: string
          meta_message_id?: string | null
          order_id?: string | null
          phone: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["whatsapp_message_status"]
          template_body: string
        }
        Update: {
          company_id?: string
          created_at?: string
          error?: string | null
          id?: string
          meta_message_id?: string | null
          order_id?: string | null
          phone?: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["whatsapp_message_status"]
          template_body?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_message_log_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_message_log_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_scheduled_messages: {
        Row: {
          company_id: string
          created_at: string
          error: string | null
          id: string
          order_id: string
          phone: string
          scheduled_at: string
          sent_at: string | null
          status: Database["public"]["Enums"]["whatsapp_message_status"]
          template_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          error?: string | null
          id?: string
          order_id: string
          phone: string
          scheduled_at: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["whatsapp_message_status"]
          template_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          error?: string | null
          id?: string
          order_id?: string
          phone?: string
          scheduled_at?: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["whatsapp_message_status"]
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_scheduled_messages_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_scheduled_messages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_scheduled_messages_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_service_rules: {
        Row: {
          company_id: string
          created_at: string
          delay_days: number
          id: string
          is_active: boolean
          service_id: string
          template_id: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          delay_days?: number
          id?: string
          is_active?: boolean
          service_id: string
          template_id: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          delay_days?: number
          id?: string
          is_active?: boolean
          service_id?: string
          template_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_service_rules_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_service_rules_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_service_rules_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_templates: {
        Row: {
          body: string
          company_id: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          trigger_type: Database["public"]["Enums"]["whatsapp_trigger_type"]
          updated_at: string
        }
        Insert: {
          body: string
          company_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          trigger_type: Database["public"]["Enums"]["whatsapp_trigger_type"]
          updated_at?: string
        }
        Update: {
          body?: string
          company_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          trigger_type?: Database["public"]["Enums"]["whatsapp_trigger_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_templates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      requesting_company_id: { Args: never; Returns: string }
    }
    Enums: {
      discount_type: "percentage" | "fixed"
      document_type: "dni" | "carnet_extranjeria" | "pasaporte"
      order_status: "En Proceso" | "Terminado" | "Entregado" | "Cancelado"
      payment_status: "pendiente" | "pagado" | "parcial"
      promotion_scope_type: "all" | "service" | "vehicleType"
      service_category: "exterior" | "interior" | "detalle" | "añadido"
      staff_role: "admin" | "washer" | "cashier" | "supervisor"
      status: "active" | "inactive"
      whatsapp_message_status: "pending" | "sent" | "failed"
      whatsapp_trigger_type: "delivery" | "scheduled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      discount_type: ["percentage", "fixed"],
      document_type: ["dni", "carnet_extranjeria", "pasaporte"],
      order_status: ["En Proceso", "Terminado", "Entregado", "Cancelado"],
      payment_status: ["pendiente", "pagado", "parcial"],
      promotion_scope_type: ["all", "service", "vehicleType"],
      service_category: ["exterior", "interior", "detalle", "añadido"],
      staff_role: ["admin", "washer", "cashier", "supervisor"],
      status: ["active", "inactive"],
      whatsapp_message_status: ["pending", "sent", "failed"],
      whatsapp_trigger_type: ["delivery", "scheduled"],
    },
  },
} as const
