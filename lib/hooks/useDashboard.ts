"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
    buildMonthSeries,
    aggregateTopServices,
    isSameDay,
} from "@/lib/utils/dashboard";
import type { Order, OrderItem, OrderStaffAssignment } from "@/lib/types/order";
import type { ServiceCategory } from "@/lib/types";

type RawOrder = {
    id: string;
    order_number: string;
    customer_id: string | null;
    vehicle_id: string | null;
    subtotal: number;
    discounts: number;
    total: number;
    status: Order["status"];
    payment_status: Order["paymentStatus"] | null;
    payment_method: string | null;
    notes: string | null;
    cancel_reason: string | null;
    created_at: string;
    updated_at: string;
    customers: { first_name: string; last_name: string } | null;
    vehicles: { id: string; plate: string; brand: string; model: string | null; color: string } | null;
    order_items: {
        id: string;
        service_id: string | null;
        service_name: string;
        unit_price: number;
        quantity: number;
        subtotal: number;
    }[];
    order_staff: {
        id: string;
        staff_id: string | null;
        staff_name: string;
        role_snapshot: string | null;
    }[];
};

function mapOrder(raw: RawOrder): Order {
    const customer = raw.customers && raw.customer_id
        ? { id: raw.customer_id, firstName: raw.customers.first_name, lastName: raw.customers.last_name }
        : undefined;

    const vehicle = raw.vehicles
        ? { id: raw.vehicles.id, plate: raw.vehicles.plate, brand: raw.vehicles.brand, model: raw.vehicles.model, color: raw.vehicles.color }
        : undefined;

    const items: OrderItem[] = (raw.order_items ?? []).map((i) => ({
        serviceId: i.service_id ?? i.id,
        name: i.service_name,
        price: i.unit_price,
        quantity: i.quantity,
        subtotal: i.subtotal,
    }));

    const staff: OrderStaffAssignment[] = (raw.order_staff ?? []).map((s) => ({
        staffId: s.staff_id ?? s.id,
        name: s.staff_name,
        role: s.role_snapshot ?? undefined,
    }));

    return {
        id: raw.id,
        orderNumber: raw.order_number,
        customer,
        vehicle,
        items,
        subtotal: raw.subtotal,
        discounts: raw.discounts,
        total: raw.total,
        status: raw.status,
        paymentStatus: raw.payment_status ?? undefined,
        paymentMethod: raw.payment_method ?? undefined,
        notes: raw.notes ?? undefined,
        cancelReason: raw.cancel_reason ?? null,
        registeredAt: raw.created_at,
        updatedAt: raw.updated_at,
        staff,
    };
}

export type TopService = { serviceId: string; name: string; count: number; categoryId: string | null; category: ServiceCategory | null };
export type WeekPoint = { date: string; ingresos: number; ordenes: number };

export type DashboardData = {
    ordenesHoy: number;
    ordersEnProceso: number;
    ordersEsperando: number;
    ingresosHoy: number;
    avgServiceTime: number;
    seriesMes: ReturnType<typeof buildMonthSeries>;
    seriesSemana: WeekPoint[];
    topServices: TopService[];
    allOrders: Order[];
};

export type UseDashboardReturn = {
    data: DashboardData | null;
    loading: boolean;
    error: string | null;
    refresh: () => void;
};

function buildWeekSeries(orders: Order[]): WeekPoint[] {
    return Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dayStr = d.toISOString().slice(0, 10);
        const label = d.toLocaleDateString("es-PE", { weekday: "short" });
        const dayOrders = orders.filter((o) => o.registeredAt?.startsWith(dayStr));
        return {
            date: label,
            ingresos: dayOrders.reduce((s, o) => s + (o.total || 0), 0),
            ordenes: dayOrders.length,
        };
    });
}

function calcAvgServiceTime(orders: Order[]): number {
    const delivered = orders.filter(
        (o) => o.status === "Entregado" && o.registeredAt && o.updatedAt
    );
    if (!delivered.length) return 0;
    const totalMs = delivered.reduce((s, o) => {
        const ms = new Date(o.updatedAt!).getTime() - new Date(o.registeredAt!).getTime();
        return s + ms;
    }, 0);
    return Math.round(totalMs / delivered.length / 60_000);
}

export function useDashboard(): UseDashboardReturn {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const supabase = createClient();

    const fetch = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const [{ data: rows, error: err }, { data: svcRows }, { data: catRows }] = await Promise.all([
                supabase
                    .from("orders")
                    .select(
                        `id, order_number, customer_id, vehicle_id, subtotal, discounts, total,
                         status, payment_status, payment_method, notes, cancel_reason,
                         created_at, updated_at,
                         customers ( first_name, last_name ),
                         vehicles ( id, plate, brand, model, color ),
                         order_items ( id, service_id, service_name, unit_price, quantity, subtotal ),
                         order_staff ( id, staff_id, staff_name, role_snapshot )`
                    )
                    .order("created_at", { ascending: false }),
                supabase.from("services").select("id, name, category_id"),
                supabase.from("service_categories").select("id, name, description, color, icon, status, company_id, created_at, updated_at"),
            ]);

            if (err) throw new Error(err.message);

            const serviceMap = new Map(
                (svcRows ?? []).map((s: { id: string; name: string; category_id: string }) => [
                    s.id,
                    { name: s.name, categoryId: s.category_id },
                ])
            );

            type RawCategory = { id: string; name: string; description: string | null; color: string | null; icon: string | null; status: string; company_id: string; created_at: string | null; updated_at: string | null };
            const categoryMap = new Map<string, ServiceCategory>(
                (catRows ?? []).map((c: RawCategory) => [
                    c.id,
                    {
                        id: c.id,
                        name: c.name,
                        description: c.description,
                        color: c.color,
                        icon: c.icon,
                        status: c.status as ServiceCategory["status"],
                        companyId: c.company_id,
                        createdAt: c.created_at ?? "",
                        updatedAt: c.updated_at ?? "",
                    },
                ])
            );

            const orders = (rows as unknown as RawOrder[]).map(mapOrder);

            const todayOrders = orders.filter(
                (o) => o.registeredAt && isSameDay(o.registeredAt)
            );
            const ingresosHoy = todayOrders.reduce((s, o) => s + (o.total ?? 0), 0);
            const ordenesHoy = todayOrders.length;
            const ordersEnProceso = todayOrders.filter((o) => o.status === "En Proceso" || o.status === "Lavando").length;
            const ordersEsperando = todayOrders.filter((o) => o.status === "Terminado").length;
            const avgServiceTime = calcAvgServiceTime(todayOrders);

            const seriesMes = buildMonthSeries(orders);
            const seriesSemana = buildWeekSeries(orders);

            const rawTop = aggregateTopServices(orders, 4);
            const topServices: TopService[] = rawTop.map((r) => {
                const svc = serviceMap.get(r.serviceId);
                const fallbackName = orders.flatMap((o) => o.items).find((i) => i.serviceId === r.serviceId)?.name ?? r.serviceId;
                const categoryId = svc?.categoryId ?? null;
                const category = categoryId ? (categoryMap.get(categoryId) ?? null) : null;
                return { ...r, name: svc?.name ?? fallbackName, categoryId, category };
            });

            setData({
                ordenesHoy,
                ordersEnProceso,
                ordersEsperando,
                ingresosHoy,
                avgServiceTime,
                seriesMes,
                seriesSemana,
                topServices,
                allOrders: orders,
            });
        } catch (e) {
            setError(e instanceof Error ? e.message : "Error desconocido");
        } finally {
            setLoading(false);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        fetch();
    }, [fetch]);

    return { data, loading, error, refresh: fetch };
}
