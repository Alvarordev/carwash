"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Eye,
  Timer,
  User,
} from "iconoir-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useStaffDetail } from "@/lib/hooks/useStaffDetail";
import type { StaffRole } from "@/lib/types";

type Props = {
  staffId: string;
};

const ROLE_LABELS: Record<StaffRole, string> = {
  admin: "Administrador",
  washer: "Lavador",
  cashier: "Cajero",
  supervisor: "Supervisor",
};

function formatDuration(value: number | null) {
  if (value === null) {
    return "—";
  }

  return `${value} min`;
}

function getStatusColor(status: string) {
  if (status === "Entregado") return "bg-status-3";
  if (status === "Anulado") return "bg-destructive";
  if (status === "Terminado") return "bg-status-2";
  return "bg-status-1";
}

export default function StaffDetailLayout({ staffId }: Props) {
  const {
    staffMember,
    period,
    setPeriod,
    loading,
    error,
    periodOrders,
    averageMinutes,
    totalOrdersInPeriod,
  } = useStaffDetail(staffId);

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-9 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-destructive/40 bg-card p-6">
        <p className="text-sm text-destructive">Error al cargar el detalle del personal: {error}</p>
      </div>
    );
  }

  if (!staffMember) {
    return (
      <div className="rounded-md border border-border bg-card p-8 text-center">
        <p className="text-foreground">No se encontró el miembro del personal solicitado.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/personal">Volver a personal</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Button asChild variant="ghost" size="sm" className="w-fit -ml-2">
            <Link href="/personal">
              <ArrowLeft className="size-4" />
              Volver a personal
            </Link>
          </Button>
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">
            {staffMember.firstName} {staffMember.lastName}
          </h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="size-4" />
            <span>{ROLE_LABELS[staffMember.role]}</span>
            <Badge className="bg-background border-border text-foreground">
              {staffMember.status === "active" ? "Activo" : "Inactivo"}
            </Badge>
          </div>
        </div>

        <div
          role="tablist"
          aria-label="Periodo"
          className="relative h-10 w-fit p-1 rounded-xl border border-border bg-card overflow-hidden"
        >
          <div
            className={`absolute top-1 bottom-1 left-1 w-31 rounded-lg bg-primary transition-transform duration-350 ease-[cubic-bezier(0.22,1,0.36,1)] ${period === "month" ? "translate-x-31" : "translate-x-0"}`}
          />
          <button
            type="button"
            role="tab"
            aria-selected={period === "week"}
            onClick={() => setPeriod("week")}
            className={`cursor-pointer relative z-10 inline-flex h-full w-31 items-center justify-center text-sm font-semibold transition-colors ${period === "week" ? "text-primary-foreground" : "text-muted-foreground"}`}
          >
            Semana actual
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={period === "month"}
            onClick={() => setPeriod("month")}
            className={`cursor-pointer relative z-10 inline-flex h-full w-31 items-center justify-center text-sm font-semibold transition-colors ${period === "month" ? "text-primary-foreground" : "text-muted-foreground"}`}
          >
            Mes actual
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-md p-4">
          <p className="text-sm text-muted-foreground">Promedio de servicio</p>
          <p className="text-3xl font-bold text-foreground mt-2">
            {averageMinutes > 0 ? `${averageMinutes} min` : "—"}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Basado en Lavando a Terminado
          </p>
        </div>

        <div className="bg-card border border-border rounded-md p-4">
          <p className="text-sm text-muted-foreground">Resumen del periodo</p>
          <p className="text-3xl font-bold text-foreground mt-2">{totalOrdersInPeriod}</p>
          <p className="text-xs text-muted-foreground mt-2">
            Ordenes {period === "week" ? "semanales" : "mensuales"}
          </p>
        </div>
      </div>

      <section className="bg-card border border-border rounded-md p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Órdenes en el periodo</h2>
        </div>

        {periodOrders.length === 0 ? (
          <div className="border border-dashed border-border rounded-md p-8 text-center text-muted-foreground">
            No hay órdenes para este periodo.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-md">
            <Table>
              <TableHeader>
                <TableRow className="border-border bg-card/40">
                  <TableHead># Orden</TableHead>
                  <TableHead>Servicios</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Duración</TableHead>
                  <TableHead>Registrado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {periodOrders.map(({ order, durationMinutes }) => (
                  <TableRow key={order.id} className="border-border bg-card/80">
                    <TableCell className="font-mono font-medium text-foreground">
                      {order.orderNumber}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-foreground">
                        {order.items.length
                          ? order.items.map((item) => item.name).join(", ")
                          : "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-background border-border text-foreground">
                        <span
                          className={`size-2 rounded-full mr-1.5 ${getStatusColor(order.status)}`}
                        />
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 text-foreground">
                        <Timer className="size-4 text-primary" />
                        {formatDuration(durationMinutes)}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="size-4" />
                        {new Date(order.registeredAt).toLocaleString("es-PE")}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/ordenes/${order.id}`}>
                          <Eye className="size-4" />
                          Ver orden
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </div>
  );
}
