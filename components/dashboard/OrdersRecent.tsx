import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { Order } from "@/lib/types/order";

export default function OrdersRecent({ orders }: { orders: Order[] }) {
  return (
    <div className="bg-card/80 border border-border rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium text-white">Órdenes recientes</h3>
        <a className="text-sm text-primary">Ver todas</a>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead># Orden</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Placa</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((o) => (
            <TableRow key={o.id}>
              <TableCell className="font-mono">{o.orderNumber}</TableCell>
              <TableCell>{o.customerName}</TableCell>
              <TableCell>{o.vehiclePlate}</TableCell>
              <TableCell>S/ {o.total.toFixed(2)}</TableCell>
              <TableCell>{o.status}</TableCell>
              <TableCell className="text-right"><Button size="sm">Ver</Button></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
