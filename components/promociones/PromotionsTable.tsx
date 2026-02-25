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
import { usePromotions } from "@/lib/hooks/usePromotions";
import { useServices } from "@/lib/hooks/useServices";
import { useVehicleTypes } from "@/lib/hooks/useVehicleTypes";
import type { Promotion } from "@/lib/types";
import type { PromotionFormData } from "@/lib/schemas/promotion";
import PromotionFormDialog from "./PromotionFormDialog";
import DeletePromotionDialog from "./DeletePromotionDialog";

export default function PromotionsTable() {
  const { promotions, loading, error, createPromotion, updatePromotion, deletePromotion, restorePromotion } =
    usePromotions();
  const { services } = useServices();
  const { vehicleTypes } = useVehicleTypes();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingPromotion, setDeletingPromotion] = useState<Promotion | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filtered = useMemo(() => {
    return promotions.filter((p) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q);
      const matchesStatus = filterStatus === "all" || p.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [promotions, search, filterStatus]);

  const hasActiveFilters = search || filterStatus !== "all";

  const clearFilters = () => {
    setSearch("");
    setFilterStatus("all");
  };

  const handleOpenCreate = () => {
    setEditingPromotion(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setDialogOpen(true);
  };

  const handleOpenDelete = (promotion: Promotion) => {
    setDeletingPromotion(promotion);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (data: PromotionFormData) => {
    setIsSubmitting(true);
    try {
      if (editingPromotion) {
        await updatePromotion(editingPromotion.id, data);
        toast.success("Promoción actualizada", {
          description: data.name,
        });
      } else {
        await createPromotion(data);
        toast.success("Promoción creada", {
          description: data.name,
        });
      }
      setDialogOpen(false);
    } catch {
      toast.error("Ocurrió un error", { description: "No se pudo guardar la promoción." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingPromotion) return;
    setIsDeleting(true);
    const backup = { ...deletingPromotion };
    try {
      await deletePromotion(backup.id);
      setDeleteDialogOpen(false);
      setDeletingPromotion(null);
      toast.error(`${backup.name} eliminada`, {
        duration: 8000,
        action: {
          label: "Deshacer",
          onClick: async () => {
            try {
              await restorePromotion(backup);
              toast.success("Promoción restaurada", {
                description: backup.name,
              });
            } catch {
              toast.error("No se pudo restaurar la promoción.");
            }
          },
        },
      });
    } catch {
      toast.error("No se pudo eliminar la promoción.");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDiscount = (promotion: Promotion) => {
    if (promotion.discountType === "percentage") {
      return `${promotion.discountValue}%`;
    }
    return `S/ ${promotion.discountValue.toFixed(2)}`;
  };

  const getScopeLabel = (promotion: Promotion) => {
    if (promotion.scope === "all") return "Todos los servicios";
    if (promotion.scope === "service") {
      const serviceNames = promotion.scopeIds
        .map((id) => services.find((s) => s.id === id)?.name ?? id)
        .join(", ");
      return serviceNames || "Servicio específico";
    }
    if (promotion.scope === "vehicleType") {
      const typeNames = promotion.scopeIds
        .map((id) => vehicleTypes.find((v) => v.id === id)?.name ?? id)
        .join(", ");
      return typeNames || "Tipo de vehículo específico";
    }
    return promotion.scope;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("es-PE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex w-full justify-between items-center">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground pb-4 w-full">
          Gestión de Promociones
        </h1>

        <div className="flex gap-4 w-full justify-end items-center">
          <div className="relative flex-1 min-w-48 max-w-xs flex">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar promoción..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-card border-border rounded-sm"
            />
          </div>
          <Button
            onClick={handleOpenCreate}
            className="bg-primary text-foreground px-6 font-semibold gap-1 shrink-0 rounded-sm cursor-pointer transition-all"
            size="lg"
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
            <TableRow className="border-border bg-card/20">
              <TableHead className="text-white font-medium pl-4">Nombre</TableHead>
              <TableHead className="text-white font-medium">Descuento</TableHead>
              <TableHead className="text-white font-medium hidden sm:table-cell">Alcance</TableHead>
              <TableHead className="text-white font-medium hidden md:table-cell">Vigencia</TableHead>
              <TableHead className="text-white font-medium">Estado</TableHead>
              <TableHead className="text-white font-medium text-right pr-4">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-border bg-card">
                  <TableCell><Skeleton className="h-4 w-36 bg-muted" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20 bg-muted" /></TableCell>
                  <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-32 bg-muted" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-32 bg-muted" /></TableCell>
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
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <Car className="h-10 w-10 opacity-30" />
                    <p className="text-sm text-white">Error al cargar las promociones.</p>
                    <p className="text-xs">
                      Asegúrate de que json-server esté corriendo en el puerto 3001.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow className="bg-card">
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <Car className="h-10 w-10 opacity-30" />
                    <p className="text-sm text-white">
                      {hasActiveFilters
                        ? "No se encontraron promociones con los filtros aplicados."
                        : "No hay promociones registradas aún."}
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
              filtered.map((promotion) => (
                <TableRow
                  key={promotion.id}
                  className="border-border bg-card/80 hover:bg-card/40 transition-colors"
                >
                  <TableCell className="pl-4">
                    <div>
                      <span className="font-medium text-white block">
                        {promotion.name}
                      </span>
                      {promotion.description && (
                        <span className="text-sm text-muted-foreground">
                          {promotion.description}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className="bg-primary/20 text-primary border border-primary/30 rounded-md font-medium"
                    >
                      {formatDiscount(promotion)}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-white">
                    {getScopeLabel(promotion)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-white">
                    {formatDate(promotion.startDate)} - {formatDate(promotion.endDate)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className="bg-background py-1 px-2.5 gap-2 text-white rounded-md font-normal"
                    >
                      <span
                        className={`size-2 rounded-full ${promotion.status === "active" ? "bg-primary" : "bg-[#FD542A]"
                          }`}
                      />
                      {promotion.status === "active" ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleOpenEdit(promotion)}
                        className="bg-primary hover:bg-primary/90 text-white gap-1.5 rounded-sm h-8 px-3 text-xs font-medium cursor-pointer"
                      >
                        <EditPencil className="h-3.5 w-3.5" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleOpenDelete(promotion)}
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
          Mostrando {filtered.length} de {promotions.length} promociones
        </p>
      )}

      <PromotionFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        promotion={editingPromotion}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
      />

      <DeletePromotionDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        promotion={deletingPromotion}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
