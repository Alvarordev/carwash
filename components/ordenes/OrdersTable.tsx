"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Search, EditPencil, Eye, Calendar, Download } from "iconoir-react";
import type { DateRange } from "react-day-picker";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as DatePickerCalendar } from "@/components/ui/calendar";
import { useOrders } from "@/lib/hooks/useOrders";
import { exportOrdersToXlsx } from "@/lib/utils/orders-export";
import OrderStatusDialog from "./OrderStatusDialog";
import type { Order, OrderItem } from "@/lib/types/order";
import { cn } from "@/lib/utils";
import { ICON_MAP } from "../servicios/ServiceCard";

export default function OrdersTable() {
  const { orders, loading, error, updateOrderStatus, cancelOrder } = useOrders();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCustomer, setFilterCustomer] = useState<string>("all");
  const [filterService, setFilterService] = useState<string>("all");
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<string>("all");
  const [dateFilterMode, setDateFilterMode] = useState<"all" | "single" | "range">("all");
  const [singleDate, setSingleDate] = useState<Date | undefined>(undefined);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [isExporting, setIsExporting] = useState(false);

  const clearFilters = () => {
    setSearch("");
    setFilterStatus("all");
    setFilterCustomer("all");
    setFilterService("all");
    setFilterPaymentMethod("all");
    setDateFilterMode("all");
    setSingleDate(undefined);
    setDateRange(undefined);
  };

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  const customerOptions = useMemo(() => {
    return Array.from(
      new Map(
        orders
          .filter((order) => order.customer?.id)
          .map((order) => [
            String(order.customer!.id),
            `${order.customer!.firstName} ${order.customer!.lastName}`,
          ]),
      ).entries(),
    ).map(([id, name]) => ({ id, name }));
  }, [orders]);

  const serviceOptions = useMemo(() => {
    return Array.from(
      new Map(
        orders
          .flatMap((order) => order.items)
          .filter((item) => item.serviceId)
          .map((item) => [String(item.serviceId), item.name]),
      ).entries(),
    ).map(([id, name]) => ({ id, name }));
  }, [orders]);

  const paymentMethodOptions = useMemo(() => {
    return Array.from(
      new Set(
        orders
          .map((order) => order.paymentMethod?.trim())
          .filter((method): method is string => Boolean(method)),
      ),
    ).sort((a, b) => a.localeCompare(b, "es"));
  }, [orders]);

  const getDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getDateLabel = (date: Date) => {
    return date.toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStartOfDay = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
  };

  const getEndOfDay = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
  };

  const handleDateModeChange = (value: "all" | "single" | "range") => {
    setDateFilterMode(value);
    if (value !== "single") {
      setSingleDate(undefined);
    }
    if (value !== "range") {
      setDateRange(undefined);
    }
  };


  const handleOpenEdit = (order: Order) => {
    setEditingOrder(order);
    setDialogOpen(true);
  };

  const handleConfirmStatus = async (status: Order["status"], reason?: string) => {
    if (!editingOrder) return;
    if (status === "Anulado") {
      await cancelOrder(editingOrder.id, reason ?? "");
    } else {
      await updateOrderStatus(editingOrder.id, status);
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return orders.filter((o) => {
      const customerName = o.customer ? `${o.customer.firstName} ${o.customer.lastName}` : "";
      const matchesSearch =
        !q ||
        o.orderNumber?.toLowerCase().includes(q) ||
        customerName.toLowerCase().includes(q) ||
        o.vehicle?.plate?.toLowerCase().includes(q);
      const matchesStatus = filterStatus === "all" || o.status === filterStatus;
      const matchesCustomer = filterCustomer === "all" || String(o.customer?.id) === filterCustomer;
      const matchesService =
        filterService === "all" ||
        o.items.some((item) => String(item.serviceId) === filterService);
      const matchesPaymentMethod =
        filterPaymentMethod === "all" ||
        (o.paymentMethod?.trim() ?? "") === filterPaymentMethod;

      let matchesDate = true;
      const registeredDate = new Date(o.registeredAt);
      if (Number.isNaN(registeredDate.getTime())) {
        matchesDate = false;
      } else if (dateFilterMode === "single" && singleDate) {
        matchesDate = getDateKey(registeredDate) === getDateKey(singleDate);
      } else if (dateFilterMode === "range" && dateRange?.from && dateRange?.to) {
        const start = getStartOfDay(dateRange.from);
        const end = getEndOfDay(dateRange.to);
        if (start.getTime() > end.getTime()) {
          matchesDate = false;
        } else {
          matchesDate = registeredDate.getTime() >= start.getTime() && registeredDate.getTime() <= end.getTime();
        }
      }

      return matchesSearch && matchesStatus && matchesCustomer && matchesService && matchesPaymentMethod && matchesDate;
    });
  }, [
    orders,
    search,
    filterStatus,
    filterCustomer,
    filterService,
    filterPaymentMethod,
    dateFilterMode,
    singleDate,
    dateRange,
  ]);

  const isExportDisabled = loading || !!error || filtered.length === 0 || isExporting;

  const handleExportXlsx = async () => {
    if (isExportDisabled) return;

    try {
      setIsExporting(true);
      await exportOrdersToXlsx(filtered);
      toast.success("Excel exportado", {
        description: `Se exportaron ${filtered.length} ordenes.`,
      });
    } catch {
      toast.error("No se pudo exportar Excel", {
        description: "Intenta nuevamente en unos segundos.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">Gestión de Órdenes</h1>

        <div className="flex gap-3 sm:ml-auto items-center">
          <div className="relative flex-1 sm:flex-initial sm:w-64 flex">
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
              <SelectItem value="En Proceso">En Proceso</SelectItem>
              <SelectItem value="Terminado">Terminado</SelectItem>
              <SelectItem value="Entregado">Entregado</SelectItem>
              <SelectItem value="Anulado">Anulado</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterCustomer} onValueChange={setFilterCustomer}>
            <SelectTrigger className="w-48 bg-background border-border rounded-sm">
              <SelectValue placeholder="Cliente" />
            </SelectTrigger>
            <SelectContent className="bg-background border-border rounded-sm">
              <SelectItem value="all">Todos los clientes</SelectItem>
              {customerOptions.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterService} onValueChange={setFilterService}>
            <SelectTrigger className="w-44 bg-background border-border rounded-sm">
              <SelectValue placeholder="Servicio" />
            </SelectTrigger>
            <SelectContent className="bg-background border-border rounded-sm">
              <SelectItem value="all">Todos los servicios</SelectItem>
              {serviceOptions.map((service) => (
                <SelectItem key={service.id} value={service.id}>
                  {service.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterPaymentMethod} onValueChange={setFilterPaymentMethod}>
            <SelectTrigger className="w-44 bg-background border-border rounded-sm">
              <SelectValue placeholder="Método de pago" />
            </SelectTrigger>
            <SelectContent className="bg-background border-border rounded-sm">
              <SelectItem value="all">Todos los métodos</SelectItem>
              {paymentMethodOptions.map((method) => (
                <SelectItem key={method} value={method}>
                  {method}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={dateFilterMode} onValueChange={handleDateModeChange}>
            <SelectTrigger className="w-44 bg-background border-border rounded-sm">
              <SelectValue placeholder="Fecha" />
            </SelectTrigger>
            <SelectContent className="bg-background border-border rounded-sm">
              <SelectItem value="all">Todas las fechas</SelectItem>
              <SelectItem value="single">Fecha única</SelectItem>
              <SelectItem value="range">Rango de fechas</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex flex-wrap gap-2">
            {dateFilterMode === "single" && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-44 justify-start bg-background border-border text-left font-normal">
                    {singleDate ? getDateLabel(singleDate) : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-background border-border" align="start">
                  <DatePickerCalendar mode="single" selected={singleDate} onSelect={setSingleDate} />
                </PopoverContent>
              </Popover>
            )}

            {dateFilterMode === "range" && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[18rem] justify-start bg-background border-border text-left font-normal">
                    {dateRange?.from && dateRange?.to
                      ? `${getDateLabel(dateRange.from)} - ${getDateLabel(dateRange.to)}`
                      : "Seleccionar rango"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-background border-border" align="start">
                  <DatePickerCalendar mode="range" selected={dateRange} onSelect={setDateRange} />
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportXlsx}
            disabled={isExportDisabled}
            className="gap-1.5 rounded-md"
          >
            <Download className="h-3.5 w-3.5" />
            Exportar Excel
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-primary font-semibold hover:text-foreground gap-1.5 rounded-md cursor-pointer"
          >
            Limpiar Filtros
          </Button>
        </div>
      </div>

      <div className="rounded-md shadow-sm overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border bg-card/20 ">
              <TableHead className="text-foreground font-medium pl-4"># Orden</TableHead>
              <TableHead className="text-foreground font-medium">Cliente</TableHead>
              <TableHead className="text-foreground font-medium table-cell">Vehículo</TableHead>
              <TableHead className="text-foreground font-medium hidden lg:table-cell">Servicios</TableHead>
              <TableHead className="text-foreground font-medium">Total</TableHead>
              <TableHead className="text-foreground font-medium">Estado</TableHead>
              <TableHead className="text-foreground font-medium hidden lg:table-cell">Registrado</TableHead>
              <TableHead className="text-foreground font-medium text-right pr-4">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-border bg-card">
                  <TableCell><Skeleton className="h-4 w-24 bg-muted" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32 bg-muted" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24 bg-muted" /></TableCell>
                  <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-36 bg-muted" /></TableCell>
                  <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-20 bg-muted" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20 bg-muted" /></TableCell>
                  <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-28 bg-muted" /></TableCell>
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
                    <p className="text-sm text-foreground">Error al cargar las órdenes.</p>
                    <p className="text-xs">Asegúrate de que json-server esté corriendo en el puerto 3001.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow className="bg-card">
                <TableCell colSpan={8} className="text-center py-12">
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <p className="text-sm text-foreground">No hay órdenes registradas.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((order: Order) => (
                <TableRow key={order.id} className="border-border bg-card/80 hover:bg-card/40 transition-colors cursor-pointer">
                  <TableCell className="font-mono text-sm font-medium text-foreground pl-4">{order.orderNumber}</TableCell>
                  <TableCell>{order.customer ? `${order.customer.firstName} ${order.customer.lastName}` : "—"}</TableCell>
                  <TableCell>{order.vehicle ? `${order.vehicle.plate} - ${order.vehicle.brand}${order.vehicle.model ? " " + order.vehicle.model : ""}` : "—"}</TableCell>
                  <TableCell className="flex-wrap hidden sm:flex" >
                    {order.items.map((it: OrderItem) => {
                      const color = it.color || "var(--primary)";
                      const getServiceIcon = (item: OrderItem) => {
                        if (item.icon) return ICON_MAP[item.icon];
                        return <div className="size-5 bg-muted rounded-full" />;
                      }
                      return (
                        <div key={it.serviceId} style={{ color: color }} className="flex items-center h-8 gap-2 px-2 bg-background border border-border rounded-xl">
                          {getServiceIcon(it)}
                          <span className={`font-medium text-xs rounded-xl`}>{it.name}</span>
                        </div>
                      );
                    })}
                  </TableCell>
                  <TableCell>S/ {order.total.toFixed(2)}</TableCell>
                  <TableCell >
                    <Badge className='bg-background h-8 border border-border text-foreground'>
                      <span className={cn("size-2 mr-0.5 rounded-full animate-pulse", (() => {
                        switch (order.status) {
                          case "Entregado":
                            return "bg-status-3 text-foreground";
                          case "Anulado":
                            return "bg-destructive text-foreground";
                          case "Terminado":
                            return "bg-status-2 text-foreground";
                          default:
                            return "bg-status-1 text-foreground";
                        }
                      })())}></span>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{new Date(order.registeredAt).toLocaleString("es-PE")}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button size="sm" variant="outline">
                        <Link href={`/ordenes/${order.id}`} className="flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5" />Ver
                        </Link>
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => handleOpenEdit(order)}>
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

      {!loading && !error && filtered.length > 0 && (
        <p className="text-xs text-muted-foreground">Mostrando {filtered.length} de {orders.length} órdenes</p>
      )}

      <OrderStatusDialog open={dialogOpen} onOpenChange={setDialogOpen} order={editingOrder} onConfirm={handleConfirmStatus} />
    </div>
  );
}
