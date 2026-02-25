"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Plus, Search, EditPencil, Trash, Car, FilterList } from "iconoir-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useVehicles } from "@/lib/hooks/useVehicles";
import { useVehicleTypes } from "@/lib/hooks/useVehicleTypes";
import { useCustomers } from "@/lib/hooks/useCustomers";
import type { Vehicle } from "@/lib/types";
import type { VehicleFormData } from "@/lib/schemas/vehicle";
import VehicleFormDialog from "./VehicleFormDialog";
import DeleteVehicleDialog from "./DeleteVehicleDialog";

export default function VehiclesTable() {
  const { vehicles, loading, error, createVehicle, updateVehicle, deleteVehicle, restoreVehicle } =
    useVehicles();
  const { vehicleTypes } = useVehicleTypes();
  const { customers } = useCustomers();

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingVehicle, setDeletingVehicle] = useState<Vehicle | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const getTypeName = (typeId: string) =>
    vehicleTypes.find((t) => t.id === typeId)?.name ?? "—";

  const getOwnerNames = (ownerIds: string[]) => {
    if (ownerIds.length === 0) return null;
    return ownerIds
      .map((id) => {
        const c = customers.find((c) => c.id === id);
        return c ? `${c.firstName} ${c.lastName}` : null;
      })
      .filter(Boolean)
      .join(", ");
  };

  const filtered = useMemo(() => {
    return vehicles.filter((v) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        v.plate.toLowerCase().includes(q) ||
        v.brand.toLowerCase().includes(q) ||
        (v.model ?? "").toLowerCase().includes(q) ||
        v.color.toLowerCase().includes(q);
      const matchesType = filterType === "all" || v.vehicleTypeId === filterType;
      const matchesStatus = filterStatus === "all" || v.status === filterStatus;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [vehicles, search, filterType, filterStatus]);

  const hasActiveFilters = search || filterType !== "all" || filterStatus !== "all";

  const clearFilters = () => {
    setSearch("");
    setFilterType("all");
    setFilterStatus("all");
  };

  const handleOpenCreate = () => {
    setEditingVehicle(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setDialogOpen(true);
  };

  const handleOpenDelete = (vehicle: Vehicle) => {
    setDeletingVehicle(vehicle);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (data: VehicleFormData) => {
    setIsSubmitting(true);
    try {
      if (editingVehicle) {
        await updateVehicle(editingVehicle.id, data);
        toast.success("Vehículo actualizado", {
          description: `${data.brand} ${data.model ?? ""} — ${data.plate}`,
        });
      } else {
        await createVehicle(data);
        toast.success("Vehículo creado", {
          description: `${data.brand} ${data.model ?? ""} — ${data.plate}`,
        });
      }
      setDialogOpen(false);
    } catch {
      toast.error("Ocurrió un error", { description: "No se pudo guardar el vehículo." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingVehicle) return;
    setIsDeleting(true);
    const backup = { ...deletingVehicle };
    try {
      await deleteVehicle(backup.id);
      setDeleteDialogOpen(false);
      setDeletingVehicle(null);
      toast.error(`${backup.brand} ${backup.model ?? ""} eliminado`, {
        description: backup.plate,
        duration: 8000,
        action: {
          label: "Deshacer",
          onClick: async () => {
            try {
              await restoreVehicle(backup);
              toast.success("Vehículo restaurado", {
                description: `${backup.brand} ${backup.model ?? ""} — ${backup.plate}`,
              });
            } catch {
              toast.error("No se pudo restaurar el vehículo.");
            }
          },
        },
      });
    } catch {
      toast.error("No se pudo eliminar el vehículo.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex w-full justify-between items-center">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground pb-4 w-full">Gestión de Vehículos</h1>

        <div className="flex gap-4 w-full justify-end items-center">
          <div className="relative flex-1 min-w-48 max-w-xs flex">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar placa, marca, modelo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-card border-border rounded-sm"
            />
          </div>
          <Button
            onClick={handleOpenCreate}
            className="bg-primary text-foreground px-6 font-semibold gap-1 shrink-0 rounded-sm cursor-pointer transition-all"
            size={"lg"}
          >
            <Plus className="size-5 stroke-2" />
            Nuevo registro
          </Button>
        </div>

      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-card/80 border border-border px-4 py-5 rounded-sm">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="flex items-center mr-4">
            <FilterList className="size-4 mr-1.5 text-muted-foreground shrink-0" />
            <p>Filtros:</p>
          </div>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="bg-background border-border rounded-sm">
              <SelectValue placeholder="Tipo" >
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-background border-border rounded-sm">
              <SelectItem value="all">Todos los tipos</SelectItem>
              {vehicleTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-36 bg-background border-border rounded-sm">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent className="bg-background border-border rounded-sm">
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Activo</SelectItem>
              <SelectItem value="inactive">Inactivo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="text-primary font-semibold hover:text-foreground gap-1.5 rounded-md cursor-pointer"
        >
          Limpiar Filtros
        </Button>
      </div>

      <div className="rounded-md border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border bg-card/20 ">
              <TableHead className="text-white font-medium pl-4">Placa</TableHead>
              <TableHead className="text-white font-medium">Vehículo</TableHead>
              <TableHead className="text-white font-medium hidden sm:table-cell">Color</TableHead>
              <TableHead className="text-white font-medium hidden md:table-cell">Tipo</TableHead>
              <TableHead className="text-white font-medium hidden lg:table-cell">Cliente</TableHead>
              <TableHead className="text-white font-medium">Estado</TableHead>
              <TableHead className="text-white font-medium text-right pr-4">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-border bg-card">
                  <TableCell><Skeleton className="h-4 w-24 bg-muted" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32 bg-muted" /></TableCell>
                  <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-16 bg-muted" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-16 rounded bg-muted" /></TableCell>
                  <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-28 bg-muted" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16 rounded bg-muted" /></TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Skeleton className="h-8 w-20 rounded-md bg-muted" />
                      <Skeleton className="h-8 w-20 rounded-md bg-muted" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : error ? (
              <TableRow className="bg-card">
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <Car className="h-10 w-10 opacity-30" />
                    <p className="text-sm text-white">Error al cargar los vehículos.</p>
                    <p className="text-xs">Asegúrate de que json-server esté corriendo en el puerto 3001.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow className="bg-card">
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <Car className="h-10 w-10 opacity-30" />
                    <p className="text-sm text-white">
                      {hasActiveFilters
                        ? "No se encontraron vehículos con los filtros aplicados."
                        : "No hay vehículos registrados aún."}
                    </p>
                    {!hasActiveFilters && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleOpenCreate}
                        className="border-border gap-1.5 rounded-md"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Agregar el primero
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((vehicle) => (
                <TableRow
                  key={vehicle.id}
                  className="border-border bg-card/80 hover:bg-card/40 transition-colors"
                >
                  <TableCell className="font-mono text-sm font-medium text-white pl-4">
                    {vehicle.plate}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-white">
                      {vehicle.brand} {vehicle.model}
                    </span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div className="flex items-center">
                      <span className="text-white text-sm">{vehicle.color}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {getTypeName(vehicle.vehicleTypeId)}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm">
                    {(() => {
                      const names = getOwnerNames(vehicle.ownerIds);
                      return names ? (
                        <span className="text-white">{names}</span>
                      ) : (
                        <span className="text-muted-foreground italic">Cliente genérico</span>
                      );
                    })()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        vehicle.status === "active"
                          ? "bg-background py-1 px-2.5 gap-2 text-white rounded-md font-normal"
                          : "bg-background py-1 px-2.5 gap-2 text-white rounded-md font-normal"
                      }
                    >
                      <span className={`size-2 rounded-full ${vehicle.status === "active" ? "bg-primary" : "bg-[#FD542A]"}`}></span>
                      {vehicle.status === "active" ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleOpenEdit(vehicle)}
                        variant="secondary"
                      >
                        <EditPencil className="h-3.5 w-3.5" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleOpenDelete(vehicle)}
                        className="text-white gap-1.5 rounded-sm h-8 px-3 text-xs font-medium cursor-pointer"
                        style={{ backgroundColor: "#FD2A2A" }}
                      >
                        <Trash className="h-3.5 w-3.5" />
                        Eliminar
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
        <p className="text-xs text-muted-foreground">
          Mostrando {filtered.length} de {vehicles.length} vehículos
        </p>
      )}

      <VehicleFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        vehicle={editingVehicle}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
      />

      <DeleteVehicleDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        vehicle={deletingVehicle}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
