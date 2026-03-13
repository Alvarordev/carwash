"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "iconoir-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useServices } from "@/lib/hooks/useServices";
import { useServiceCategories } from "@/lib/hooks/useServiceCategories";
import type { Service } from "@/lib/types";
import type { ServiceFormData } from "@/lib/schemas/service";
import ServiceCard from "./ServiceCard";
import ServiceFormDialog from "./ServiceFormDialog";
import DeleteServiceDialog from "./DeleteServiceDialog";

export default function ServicesCatalog() {
  const { services, loading, error, createService, updateService, deleteService } = useServices();
  const { categories, allCategories } = useServiceCategories();

  const [activeFilter, setActiveFilter] = useState<"all" | string>("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingService, setDeletingService] = useState<Service | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredServices = services.filter((s) => {
    if (activeFilter === "all") return true;
    return s.categoryId === activeFilter;
  });

  const handleOpenCreate = () => {
    setEditingService(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (service: Service) => {
    setEditingService(service);
    setDialogOpen(true);
  };

  const handleOpenDelete = (service: Service) => {
    setDeletingService(service);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (data: ServiceFormData) => {
    setIsSubmitting(true);
    try {
      if (editingService) {
        await updateService(editingService.id, data);
        toast.success("Servicio actualizado", { description: data.name });
      } else {
        await createService(data);
        toast.success("Servicio creado", { description: data.name });
      }
      setDialogOpen(false);
    } catch {
      toast.error("Ocurrió un error", { description: "No se pudo guardar el servicio." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingService) return;
    setIsDeleting(true);
    try {
      await deleteService(deletingService.id);
      setDeleteDialogOpen(false);
      setDeletingService(null);
      toast.success("Servicio eliminado", { description: deletingService.name });
    } catch {
      toast.error("No se pudo eliminar el servicio.");
    } finally {
      setIsDeleting(false);
    }
  };

  const categoryMap = new Map(allCategories.map((c) => [c.id, c.name]));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex w-full justify-between items-center">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground pb-4 w-full">
          Catálogo de Servicios
        </h1>
        <Button
          onClick={handleOpenCreate}
          className="bg-primary text-foreground px-6 font-semibold gap-1 shrink-0 rounded-sm cursor-pointer transition-all"
          size="lg"
        >
          <Plus className="size-5 stroke-2" />
          Agregar Servicio
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={() => setActiveFilter("all")}
          className={`rounded-sm px-4 h-9 text-sm font-medium transition-all ${
            activeFilter === "all"
              ? "bg-foreground dark:bg-foreground text-background border border-foreground hover:bg-foreground dark:hover:bg-foreground hover:text-background dark:hover:text-background"
              : "bg-background border-border text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          Todos los servicios
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant="outline"
            onClick={() => setActiveFilter(cat.id)}
            className={`rounded-sm px-4 h-9 text-sm font-medium transition-all ${
              activeFilter === cat.id
                ? "bg-foreground dark:bg-foreground text-background border border-border hover:bg-foreground dark:hover:bg-foreground  hover:text-background dark:hover:text-background"
                : "bg-card dark:bg-background border-border text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {cat.name}
          </Button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-card/80 rounded-lg border border-border p-4">
              <div className="flex items-center gap-4">
                <Skeleton className="w-12 h-12 rounded-full bg-muted" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-48 mb-2 bg-muted" />
                  <Skeleton className="h-4 w-64 bg-muted" />
                </div>
                <Skeleton className="h-8 w-20 rounded-md bg-muted" />
              </div>
            </div>
          ))
        ) : error ? (
          <div className="bg-card/80 rounded-lg border border-border p-8 text-center">
            <p className="text-muted-foreground">Error al cargar los servicios.</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="bg-card/80 rounded-lg border border-border p-8 text-center">
            <p className="text-muted-foreground">
              {activeFilter === "all"
                ? "No hay servicios registrados."
                : "No hay servicios en esta categoría."}
            </p>
            <Button
              variant="outline"
              onClick={handleOpenCreate}
              className="mt-4 border-border"
            >
              <Plus className="size-4 mr-2" />
              Agregar el primero
            </Button>
          </div>
        ) : (
          filteredServices.map((service, i) => (
            <ServiceCard
              key={service.id}
              service={service}
              categoryName={categoryMap.get(service.categoryId) ?? null}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
              initiallyExpanded={i === 0}
            />
          ))
        )}
      </div>

      {!loading && !error && filteredServices.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Mostrando {filteredServices.length} de {services.length} servicios
        </p>
      )}

      <ServiceFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        service={editingService}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
      />

      <DeleteServiceDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        service={deletingService}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
