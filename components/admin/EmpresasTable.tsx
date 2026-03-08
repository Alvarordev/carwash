import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Company } from "@/lib/types";

type Props = {
  companies: Company[];
};

export default function EmpresasTable({ companies }: Props) {
  return (
    <div className="rounded-md border border-border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-border bg-card/20">
            <TableHead className="text-white font-medium pl-4">Empresa</TableHead>
            <TableHead className="text-white font-medium hidden sm:table-cell">Slug</TableHead>
            <TableHead className="text-white font-medium">Estado</TableHead>
            <TableHead className="text-white font-medium hidden md:table-cell">Creado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.length === 0 ? (
            <TableRow className="bg-card">
              <TableCell colSpan={4} className="text-center py-12 text-muted-foreground text-sm">
                No hay empresas registradas aún.
              </TableCell>
            </TableRow>
          ) : (
            companies.map((c) => (
              <TableRow key={c.id} className="border-border bg-card hover:bg-card/40 transition-colors">
                <TableCell className="pl-4 font-medium text-white">{c.name}</TableCell>
                <TableCell className="hidden sm:table-cell font-mono text-sm text-muted-foreground">
                  {c.slug}
                </TableCell>
                <TableCell>
                  <Badge className="bg-background py-1 px-2.5 gap-2 text-white rounded-md font-normal">
                    <span
                      className={`size-2 rounded-full ${c.status === "active" ? "bg-primary" : "bg-[#FD542A]"}`}
                    />
                    {c.status === "active" ? "Activa" : "Inactiva"}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                  {new Date(c.createdAt).toLocaleDateString("es-PE")}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
