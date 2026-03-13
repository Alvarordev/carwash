"use client";

import { useMemo, useState } from "react";
import { useOrders } from "@/lib/hooks/useOrders";
import { useStaff } from "@/lib/hooks/useStaff";
import {
  buildStaffPerformanceSummary,
  getOrderServiceDurationMinutes,
  isInPeriod,
  type StaffPerformancePeriod,
} from "@/lib/utils/staff-performance";
import type { StaffMember } from "@/lib/types";
import type { Order } from "@/lib/types/order";

export type StaffOrderPerformance = {
  order: Order;
  durationMinutes: number | null;
};

export type UseStaffDetailReturn = {
  staffMember: StaffMember | null;
  period: StaffPerformancePeriod;
  setPeriod: (period: StaffPerformancePeriod) => void;
  loading: boolean;
  error: string | null;
  periodOrders: StaffOrderPerformance[];
  averageMinutes: number;
  measurableOrders: number;
  totalOrdersInPeriod: number;
  nonCanceledOrdersInPeriod: number;
};

export function useStaffDetail(staffId: string): UseStaffDetailReturn {
  const [period, setPeriod] = useState<StaffPerformancePeriod>("week");

  const {
    staff,
    loading: loadingStaff,
    error: staffError,
  } = useStaff();
  const {
    orders,
    loading: loadingOrders,
    error: ordersError,
  } = useOrders();

  const staffMember = useMemo(
    () => staff.find((member) => member.id === staffId) ?? null,
    [staff, staffId]
  );

  const assignedOrders = useMemo(() => {
    return orders
      .filter((order) =>
        (order.staff ?? []).some((assignment) => assignment.staffId === staffId)
      )
      .sort(
        (a, b) =>
          new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime()
      );
  }, [orders, staffId]);

  const periodOrdersRaw = useMemo(() => {
    return assignedOrders.filter((order) => isInPeriod(order.registeredAt, period));
  }, [assignedOrders, period]);

  const periodOrders = useMemo(() => {
    return periodOrdersRaw.map((order) => ({
      order,
      durationMinutes: getOrderServiceDurationMinutes(order),
    }));
  }, [periodOrdersRaw]);

  const summary = useMemo(
    () => buildStaffPerformanceSummary(periodOrdersRaw),
    [periodOrdersRaw]
  );

  return {
    staffMember,
    period,
    setPeriod,
    loading: loadingStaff || loadingOrders,
    error: staffError ?? ordersError,
    periodOrders,
    averageMinutes: summary.averageMinutes,
    measurableOrders: summary.measurableOrders,
    totalOrdersInPeriod: summary.totalOrders,
    nonCanceledOrdersInPeriod: summary.nonCanceledOrders,
  };
}
