"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Plus, Search, EditPencil, Trash, User, FilterList } from "iconoir-react";
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
import { useStaff } from "@/lib/hooks/useStaff";
import type { StaffMember } from "@/lib/types";
import type { StaffFormData } from "@/lib/schemas/staff";
import StaffFormDialog from "./StaffFormDialog";
import DeleteStaffDialog from "./DeleteStaffDialog";

const ROLE_LABELS: Record<StaffFormData["role"], string> = {
  admin: "Administrador",
  washer: "Lavador",
  cashier: "Cajero",
  supervisor: "Supervisor",
};

export default function StaffTable() {
  const { staff, loading, error, createStaff, updateStaff, deleteStaff, restoreStaff } =
    useStaff();

  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingStaff, setDeletingStaff] = useState<StaffMember | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filtered = useMemo(() => {
    return staff.filter((s) => {
      const q = search.toLowerCase();
      const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
      const matchesSearch =
        !q ||
        fullName.includes(q) ||
        (s.phone ?? "").toLowerCase().includes(q) ||
        (s.email ?? "").toLowerCase().includes(q);
      const matchesRole = filterRole === "all" || s.role === filterRole;
      const matchesStatus = filterStatus === "all" || s.status === filterStatus;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [staff, search, filterRole, filterStatus]);

  const hasActiveFilters = search || filterRole !== "all" || filterStatus !== "all";

  const clearFilters = () => {
    setSearch("");
    setFilterRole("all");
    setFilterStatus("all");
  };

  const handleOpenCreate = () => {
    setEditingStaff(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (member: StaffMember) => {
    setEditingStaff(member);
    setDialogOpen(true);
  };

  const handleOpenDelete = (member: StaffMember) => {
    setDeletingStaff(member);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (data: StaffFormData) => {
    setIsSubmitting(true);
    try {
      if (editingStaff) {
        await updateStaff(editingStaff.id, data);
        toast.success("Personal actualizado", {
          description: `${data.firstName} ${data.lastName}`,
        });
      } else {
        await createStaff(data);
        toast.success("Personal creado", {
          description: `${data.firstName} ${data.lastName}`,
        });
      }
      setDialogOpen(false);
    } catch {
      toast.error("Ocurrió un error", { description: "No se pudo guardar el personal." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingStaff) return;
    setIsDeleting(true);
    const backup = { ...deletingStaff };
    try {
      await deleteStaff(backup.id);
      setDeleteDialogOpen(false);
      setDeletingStaff(null);
      toast.error(`${backup.firstName} ${backup.lastName} eliminado`, {
        duration: 8000,
        action: {
          label: "Deshacer",
          onClick: async () => {
            try {
              await restoreStaff(backup);
              toast.success("Personal restaurado", {
                description: `${backup.firstName} ${backup.lastName}`,
              });
            } catch {
              toast.error("No se pudo restaurar el personal.");
            }
          },
        },
      });
    } catch {
      toast.error("No se pudo eliminar el personal.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
          Gestión de Personal
        </h1>

        <div className="flex gap-3 sm:ml-auto items-center">
          <div className="relative flex-1 sm:flex-initial sm:w-64 flex">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar nombre, teléfono, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-card border-border rounded-sm"
            />
          </div>
          <Button
            onClick={handleOpenCreate}
            className="bg-primary text-foreground px-4 sm:px-6 font-semibold gap-1 shrink-0 rounded-sm cursor-pointer transition-all"
            size="lg"
          >
            <Plus className="size-5 stroke-2" />
            <span className="hidden sm:inline">Nuevo registro</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-card/80 border border-border px-4 py-5 rounded-sm">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="flex items-center mr-4">
            <FilterList className="size-4 mr-1.5 text-muted-foreground shrink-0" />
            <p>Filtros:</p>
          </div>

          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="bg-background border-border rounded-sm">
              <SelectValue placeholder="Rol" />
            </SelectTrigger>
            <SelectContent className="bg-background border-border rounded-sm">
              <SelectItem value="all">Todos los roles</SelectItem>
              <SelectItem value="admin">Administrador</SelectItem>
              <SelectItem value="washer">Lavador</SelectItem>
              <SelectItem value="cashier">Cajero</SelectItem>
              <SelectItem value="supervisor">Supervisor</SelectItem>
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

      <div className="rounded-md border border-border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border bg-card/20">
              <TableHead className="text-white font-medium pl-4">Nombre</TableHead>
              <TableHead className="text-white font-medium">Rol</TableHead>
              <TableHead className="text-white font-medium hidden sm:table-cell">Teléfono</TableHead>
              <TableHead className="text-white font-medium hidden md:table-cell">Email</TableHead>
              <TableHead className="text-white font-medium hidden lg:table-cell">
                Nro. Doc.
              </TableHead>
              <TableHead className="text-white font-medium">Estado</TableHead>
              <TableHead className="text-white font-medium text-right pr-4">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-border bg-card">
                  <TableCell>
                    <Skeleton className="h-4 w-36 bg-muted" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20 rounded bg-muted" />
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Skeleton className="h-4 w-24 bg-muted" />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-4 w-40 bg-muted" />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Skeleton className="h-4 w-24 bg-muted" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16 rounded bg-muted" />
                  </TableCell>
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
                    <User className="h-10 w-10 opacity-30" />
                    <p className="text-sm text-white">Error al cargar el personal.</p>
                    <p className="text-xs">
                      Asegúrate de que json-server esté corriendo en el puerto 3001.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow className="bg-card">
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <User className="h-10 w-10 opacity-30" />
                    <p className="text-sm text-white">
                      {hasActiveFilters
                        ? "No se encontró personal con los filtros aplicados."
                        : "No hay personal registrado aún."}
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
              filtered.map((member) => (
                <TableRow
                  key={member.id}
                  className="border-border bg-card/80 hover:bg-card/40 transition-colors"
                >
                  <TableCell className="pl-4">
                    <span className="font-medium text-white">
                      {member.firstName} {member.lastName}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`rounded-sm font-medium ${member.role === "admin"
                        ? "bg-purple-600/20 text-purple-400 border border-purple-600/30"
                        : member.role === "supervisor"
                          ? "bg-blue-600/20 text-blue-400 border border-blue-600/30"
                          : member.role === "cashier"
                            ? "bg-green-600/20 text-green-400 border border-green-600/30"
                            : "bg-yellow-600/20 text-yellow-400 border border-yellow-600/30"
                        }`}
                    >
                      {ROLE_LABELS[member.role]}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-white">
                    {member.phone ?? <span className="text-muted-foreground italic">—</span>}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-white">
                    {member.email ?? <span className="text-muted-foreground italic">—</span>}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-white">
                    {member.docNumber ? (
                      <span className="font-mono">{member.docNumber}</span>
                    ) : (
                      <span className="text-muted-foreground italic">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className="bg-background py-1 px-2.5 gap-2 text-white rounded-md font-normal"
                    >
                      <span
                        className={`size-2 rounded-full ${member.status === "active" ? "bg-primary" : "bg-[#FD542A]"
                          }`}
                      />
                      {member.status === "active" ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleOpenEdit(member)}
                        variant="secondary"
                      >
                        <EditPencil className="h-3.5 w-3.5" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleOpenDelete(member)}
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
          Mostrando {filtered.length} de {staff.length} miembros del personal
        </p>
      )}

      <StaffFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        staffMember={editingStaff}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
      />

      <DeleteStaffDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        staffMember={deletingStaff}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
