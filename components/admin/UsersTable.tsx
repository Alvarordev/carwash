import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { UserProfile } from "@/lib/types";

type Props = {
  users: UserProfile[];
};

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  operator: "Operador",
};

export default function UsersTable({ users }: Props) {
  return (
    <div className="rounded-md border border-border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-border bg-card/20">
            <TableHead className="text-white font-medium pl-4">Nombre</TableHead>
            <TableHead className="text-white font-medium hidden sm:table-cell">Email</TableHead>
            <TableHead className="text-white font-medium">Rol</TableHead>
            <TableHead className="text-white font-medium hidden md:table-cell">Empresa</TableHead>
            <TableHead className="text-white font-medium hidden lg:table-cell">Creado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow className="bg-card">
              <TableCell colSpan={5} className="text-center py-12 text-muted-foreground text-sm">
                No hay usuarios registrados aún.
              </TableCell>
            </TableRow>
          ) : (
            users.map((u) => (
              <TableRow key={u.id} className="border-border bg-card hover:bg-card/40 transition-colors">
                <TableCell className="pl-4 font-medium text-white">
                  {u.firstName} {u.lastName}
                </TableCell>
                <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                  {u.email || <span className="italic">—</span>}
                </TableCell>
                <TableCell>
                  <Badge className="bg-background py-1 px-2.5 text-white rounded-md font-normal">
                    {ROLE_LABELS[u.role] ?? u.role}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                  {u.companyName || <span className="italic">—</span>}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                  {u.createdAt ? new Date(u.createdAt).toLocaleDateString("es-PE") : "—"}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
