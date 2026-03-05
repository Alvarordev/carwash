"use client";

import { useState } from "react";
import { toast } from "sonner";
import { EditPencil, Trash, Plus, Lock } from "iconoir-react";
import { useStaff } from "@/lib/hooks/useStaff";
import type { StaffMember } from "@/lib/types";
import type { StaffFormData } from "@/lib/schemas/staff";
import { STAFF_ROLES } from "@/lib/schemas/staff";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StaffFormDialog } from "./StaffFormDialog";
import { DeleteStaffDialog } from "./DeleteStaffDialog";

function getInitials(firstName: string, lastName: string) {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
}

function getRoleLabel(role: string) {
  return STAFF_ROLES.find((r) => r.value === role)?.label ?? role;
}

export function RolesSection() {
  const { staff, loading, createStaff, updateStaff, deleteStaff } = useStaff();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<StaffMember | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingMember, setDeletingMember] = useState<StaffMember | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  function handleOpenCreate() {
    setEditingMember(null);
    setDialogOpen(true);
  }

  function handleOpenEdit(member: StaffMember) {
    setEditingMember(member);
    setDialogOpen(true);
  }

  function handleOpenDelete(member: StaffMember) {
    setDeletingMember(member);
    setDeleteDialogOpen(true);
  }

  async function handleSubmit(data: StaffFormData) {
    setIsSubmitting(true);
    try {
      if (editingMember) {
        await updateStaff(editingMember.id, data);
        toast.success("Personal actualizado");
      } else {
        await createStaff(data);
        toast.success("Personal agregado");
      }
      setDialogOpen(false);
    } catch {
      toast.error("Error al guardar el personal");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deletingMember) return;
    setIsDeleting(true);
    try {
      await deleteStaff(deletingMember.id);
      toast.success("Personal eliminado");
      setDeleteDialogOpen(false);
    } catch {
      toast.error("Error al eliminar el personal");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div>
          <h2 className="text-base font-semibold">Roles del Personal</h2>
          <p className="text-sm text-muted-foreground">
            Gestiona los miembros del equipo y sus roles.
          </p>
        </div>
        <Button size="sm" onClick={handleOpenCreate}>
          <Plus className="size-4 mr-1.5" />
          Agregar
        </Button>
      </div>

      {loading ? (
        <div className="px-6 py-8 text-center text-muted-foreground text-sm">Cargando...</div>
      ) : staff.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <p className="text-muted-foreground text-sm mb-3">No hay personal registrado.</p>
          <Button size="sm" variant="outline" onClick={handleOpenCreate}>
            <Plus className="size-4 mr-1.5" />
            Agregar personal
          </Button>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {staff.map((member) => {
            const isAdmin = member.role === "admin";
            return (
              <div key={member.id} className="flex items-center gap-3 px-6 py-3">
                <div className="flex-shrink-0 size-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                  {getInitials(member.firstName, member.lastName)}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium">
                    {member.firstName} {member.lastName}
                  </span>
                </div>
                <Badge variant="secondary">{getRoleLabel(member.role)}</Badge>
                <Badge variant={member.status === "active" ? "default" : "outline"}>
                  {member.status === "active" ? "Activo" : "Inactivo"}
                </Badge>
                {isAdmin ? (
                  <div className="flex size-7 items-center justify-center text-muted-foreground">
                    <Lock className="size-4" />
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      onClick={() => handleOpenEdit(member)}
                    >
                      <EditPencil className="size-4" />
                    </Button>
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleOpenDelete(member)}
                    >
                      <Trash className="size-4" />
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <StaffFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        member={editingMember}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      <DeleteStaffDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        member={deletingMember}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
