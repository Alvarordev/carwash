"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Plus, Search, EditPencil, Trash, HandCash, FilterList } from "iconoir-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useExpenses } from "@/lib/hooks/useExpenses";
import { useExpenseCategories } from "@/lib/hooks/useExpenseCategories";
import { useStaff } from "@/lib/hooks/useStaff";
import type { Expense } from "@/lib/types";
import type { ExpenseFormData } from "@/lib/schemas/expense";
import ExpenseFormDialog from "./ExpenseFormDialog";
import DeleteExpenseDialog from "./DeleteExpenseDialog";

export default function ExpensesTable() {
  const { expenses, loading, error, createExpense, updateExpense, deleteExpense, restoreExpense } =
    useExpenses();
  const { expenseCategories } = useExpenseCategories();
  const { staff } = useStaff();

  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        e.detail.toLowerCase().includes(q) ||
        (e.categoryName ?? "").toLowerCase().includes(q) ||
        (e.staffMemberName ?? "").toLowerCase().includes(q);

      const matchesCategory = filterCategory === "all" || e.categoryId === filterCategory;

      const matchesDateFrom = !filterDateFrom || e.date >= filterDateFrom;
      const matchesDateTo = !filterDateTo || e.date <= filterDateTo;

      return matchesSearch && matchesCategory && matchesDateFrom && matchesDateTo;
    });
  }, [expenses, search, filterCategory, filterDateFrom, filterDateTo]);

  const hasActiveFilters =
    search || filterCategory !== "all" || filterDateFrom || filterDateTo;

  const clearFilters = () => {
    setSearch("");
    setFilterCategory("all");
    setFilterDateFrom("");
    setFilterDateTo("");
  };

  const handleOpenCreate = () => {
    setEditingExpense(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setDialogOpen(true);
  };

  const handleOpenDelete = (expense: Expense) => {
    setDeletingExpense(expense);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (data: ExpenseFormData) => {
    setIsSubmitting(true);
    try {
      if (editingExpense) {
        await updateExpense(editingExpense.id, data);
        toast.success("Gasto actualizado", { description: data.detail });
      } else {
        await createExpense(data);
        toast.success("Gasto creado", { description: data.detail });
      }
      setDialogOpen(false);
    } catch {
      toast.error("Ocurrió un error", { description: "No se pudo guardar el gasto." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingExpense) return;
    setIsDeleting(true);
    const backup = { ...deletingExpense };
    try {
      await deleteExpense(backup.id);
      setDeleteDialogOpen(false);
      setDeletingExpense(null);
      toast.error(`Gasto eliminado`, {
        description: backup.detail,
        duration: 8000,
        action: {
          label: "Deshacer",
          onClick: async () => {
            try {
              await restoreExpense(backup);
              toast.success("Gasto restaurado", { description: backup.detail });
            } catch {
              toast.error("No se pudo restaurar el gasto.");
            }
          },
        },
      });
    } catch {
      toast.error("No se pudo eliminar el gasto.");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(amount);

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
          Gestión de Gastos
        </h1>

        <div className="flex gap-3 sm:ml-auto items-center">
          <div className="relative flex-1 sm:flex-initial sm:w-64 flex">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar detalle, categoría, personal..."
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
            <span className="hidden sm:inline">Nuevo Gasto</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-card border border-border px-4 py-5 rounded-sm">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="flex items-center mr-4">
            <FilterList className="size-4 mr-1.5 text-muted-foreground shrink-0" />
            <p>Filtros:</p>
          </div>

          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-44 bg-background border-border rounded-sm">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent className="bg-background border-border rounded-sm">
              <SelectItem value="all">Todas las categorías</SelectItem>
              {expenseCategories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="w-36 bg-background border-border rounded-sm text-sm"
            />
            <span className="text-muted-foreground text-sm">—</span>
            <Input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="w-36 bg-background border-border rounded-sm text-sm"
            />
          </div>
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
              <TableHead className="text-white font-medium pl-4">Fecha</TableHead>
              <TableHead className="text-white font-medium">Detalle</TableHead>
              <TableHead className="text-white font-medium">Categoría</TableHead>
              <TableHead className="text-white font-medium hidden md:table-cell">Personal</TableHead>
              <TableHead className="text-white font-medium text-right">Monto</TableHead>
              <TableHead className="text-white font-medium text-right pr-4">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-border bg-card">
                  <TableCell><Skeleton className="h-4 w-20 bg-muted" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-48 bg-muted" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28 bg-muted" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-28 bg-muted" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20 bg-muted ml-auto" /></TableCell>
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
                    <HandCash className="h-10 w-10 opacity-30" />
                    <p className="text-sm text-white">Error al cargar los gastos.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow className="bg-card">
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <HandCash className="h-10 w-10 opacity-30" />
                    <p className="text-sm text-white">
                      {hasActiveFilters
                        ? "No se encontraron gastos con los filtros aplicados."
                        : "No hay gastos registrados aún."}
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
              filtered.map((expense) => (
                <TableRow
                  key={expense.id}
                  className="border-border bg-card hover:bg-card/40 transition-colors"
                >
                  <TableCell className="pl-4">
                    <span className="text-sm text-white font-mono">
                      {formatDate(expense.date)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-white">{expense.detail}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-white">
                      {expense.categoryName ?? <span className="text-muted-foreground italic">—</span>}
                    </span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-white">
                    {expense.staffMemberName ?? <span className="text-muted-foreground italic">—</span>}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-sm text-white font-medium">
                      {formatCurrency(expense.amount)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleOpenEdit(expense)}
                        variant="secondary"
                      >
                        <EditPencil className="h-3.5 w-3.5" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleOpenDelete(expense)}
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
          Mostrando {filtered.length} de {expenses.length} gastos
        </p>
      )}

      <ExpenseFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        expense={editingExpense}
        categories={expenseCategories}
        staffMembers={staff}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
      />

      <DeleteExpenseDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        expense={deletingExpense}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
