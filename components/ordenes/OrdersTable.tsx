"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, EditPencil, Eye, Calendar } from "iconoir-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOrders } from "@/lib/hooks/useOrders";
import OrderStatusDialog from "./OrderStatusDialog";
import type { Order } from "@/lib/types/order";

export default function OrdersTable() {
  const router = useRouter();
  const { orders, loading, error, totalCount, fetchOrders, updateOrderStatus, cancelOrder } = useOrders();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const handleOpenEdit = (order: Order) => {
    setEditingOrder(order);
    setDialogOpen(true);
  };

  const handleConfirmStatus = async (status: Order["status"], reason?: string) => {
    if (!editingOrder) return;
    if (status === "Cancelado") {
      await cancelOrder(editingOrder.id, reason ?? "");
    } else {
      await updateOrderStatus(editingOrder.id, status);
    }
  };

  // fetch orders simply (no pagination)
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const rows = Array.isArray(orders) ? orders : [];

  // Debug: ensure we received data from the hook
  if (!loading && !error) {
    // eslint-disable-next-line no-console
    console.debug("OrdersTable rows:", rows.length, rows.slice(0, 3));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex w-full justify-between items-center">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground pb-4 w-full">Gestión de Órdenes</h1>

        <div className="flex gap-4 w-full justify-end items-center">
          <div className="relative flex-1 min-w-48 max-w-xs flex">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar orden, cliente, placa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-card border-border rounded-sm"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-card/80 border border-border px-4 py-5 rounded-sm">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="flex items-center mr-4">
            <Calendar className="size-4 mr-1.5 text-muted-foreground shrink-0" />
            <p>Filtros:</p>
          </div>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40 bg-background border-border rounded-sm">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent className="bg-background border-border rounded-sm">
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="Pendiente">Pendiente</SelectItem>
              <SelectItem value="En Proceso">En Proceso</SelectItem>
              <SelectItem value="Entregado">Entregado</SelectItem>
              <SelectItem value="Cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm text-muted-foreground">(Sin paginación — mostrando todas las órdenes)</div>
        </div>
      </div>

      <div className="rounded-md border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border bg-card/20 ">
              <TableHead className="text-white font-medium pl-4"># Orden</TableHead>
              <TableHead className="text-white font-medium">Cliente</TableHead>
              <TableHead className="text-white font-medium">Vehículo</TableHead>
              <TableHead className="text-white font-medium">Servicios</TableHead>
              <TableHead className="text-white font-medium">Total</TableHead>
              <TableHead className="text-white font-medium">Estado</TableHead>
              <TableHead className="text-white font-medium">Registrado</TableHead>
              <TableHead className="text-white font-medium text-right pr-4">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-border bg-card">
                  <TableCell><Skeleton className="h-4 w-24 bg-muted" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32 bg-muted" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24 bg-muted" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-36 bg-muted" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20 bg-muted" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20 bg-muted" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28 bg-muted" /></TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Skeleton className="h-8 w-20 rounded-md bg-muted" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : error ? (
              <TableRow className="bg-card">
                <TableCell colSpan={8} className="text-center py-12">
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <p className="text-sm text-white">Error al cargar las órdenes.</p>
                    <p className="text-xs">Asegúrate de que json-server esté corriendo en el puerto 3001.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow className="bg-card">
                <TableCell colSpan={8} className="text-center py-12">
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <p className="text-sm text-white">No hay órdenes registradas.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((order: Order) => (
                <TableRow key={order.id} className="border-border bg-card/80 hover:bg-card/40 transition-colors cursor-pointer" onClick={() => router.push(`/dashboard/ordenes/${order.id}`)}>
                  <TableCell className="font-mono text-sm font-medium text-white pl-4">{order.orderNumber}</TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell>{order.vehiclePlate} - {order.vehicleMakeModel}</TableCell>
                  <TableCell>
                    {order.items.map((it: any) => (
                      <span key={it.serviceId} className="inline-block bg-secondary text-xs rounded px-2 py-1 mr-1 mb-1">{it.name}</span>
                    ))}
                  </TableCell>
                  <TableCell>S/ {order.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge className={order.status === "Entregado" ? "bg-[#16A34A] text-white" : order.status === "Cancelado" ? "bg-[#FD2A2A] text-white" : "bg-background text-white"}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(order.registeredAt).toLocaleString("es-PE")}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button size="sm" asChild>
                        <Link href={`/dashboard/ordenes/${order.id}`} className="flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5" />Ver
                        </Link>
                      </Button>
                      <Button size="sm" onClick={() => handleOpenEdit(order)} className="bg-primary text-white gap-1.5 rounded-sm h-8 px-3 text-xs font-medium">
                        <EditPencil className="h-3.5 w-3.5" />Editar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* DEBUG: show a sample of rows */}
      {!loading && !error && (
        <pre className="text-xs text-muted-foreground max-h-40 overflow-auto p-2">{JSON.stringify(rows.slice(0,5), null, 2)}</pre>
      )}

      {/* Pagination controls */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Mostrando página {page} de {totalPages} — {totalCount} órdenes</p>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Anterior</Button>
          <Button size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Siguiente</Button>
        </div>
      </div>

      <OrderStatusDialog open={dialogOpen} onOpenChange={setDialogOpen} order={editingOrder} onConfirm={handleConfirmStatus} />
    </div>
  );
}
