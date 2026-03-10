/* eslint-disable @next/next/no-img-element */
import { Calendar, Car, Camera, ReportColumns, PageSearch, ClockRotateRight, WarningTriangle } from "iconoir-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Order } from "@/lib/types/order";

type Props = {
  order: Order;
};

export default function OrderDetailLayout({ order }: Props) {

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Order #{order.orderNumber}</h1>
          <div className="text-sm text-muted-foreground flex items-center gap-2 mt-2">
            <Calendar className="w-4 h-4" />
            <span>Creado el {new Date(order.registeredAt).toLocaleString("es-PE")}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge className={`bg-background h-8 border-border font-semibold ${order.status === "Entregado" ? "bg-status-3 text-background" : order.status === "Anulado" ? "bg-destructive text-white" : order.status === "Terminado" ? "bg-status-2 text-white" : order.status === "Lavando" ? "bg-status-4 text-white" : "bg-status-1 text-white"}`}>
            {order.status}
          </Badge>
          <Button variant="outline" size="sm">Edit Order</Button>
          <Button size="sm" className="bg-[#FD2A2A] text-white">Cancel</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <section className="bg-card/80 border border-border rounded-sm p-4">
            <div className="flex flex-col gap-5">
              <div className="flex items-center">
                <Car className="size-5 text-primary mr-2" />
                <p className="font-semibold">Informacion del vehículo</p>
              </div>
              <div className="flex-1 grid grid-cols-4 gap-4">
                <div className="bg-background p-3 rounded-sm">
                  <div className="text-xs text-muted-foreground">Placa</div>
                  <div className="text-base font-semibold text-foreground">{order.vehicle?.plate ?? "—"}</div>
                </div>
                <div className="bg-background p-3 rounded-sm">
                  <div className="text-xs text-muted-foreground">Marca y Modelo</div>
                  <div className="text-base font-semibold text-foreground">{order.vehicle ? `${order.vehicle.brand}${order.vehicle.model ? " " + order.vehicle.model : ""}` : "—"}</div>
                </div>
                <div className="bg-background p-3 rounded-sm">
                  <div className="text-xs text-muted-foreground">Color</div>
                  <div className="text-base font-semibold text-foreground">{order.vehicle?.color ?? "—"}</div>
                </div>
                <div className="bg-background p-3 rounded-sm">
                  <div className="text-xs text-muted-foreground">Notas</div>
                  <div className="text-base font-semibold text-foreground">{order.notes ?? "—"}</div>
                </div>
              </div>
            </div>
          </section>

          {/* <section className="bg-card/80 border border-border rounded-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <ReportColumns className="size-5 text-primary mr-2" />
                <h3 className="font-medium text-white">Detalles del Auto</h3>

              </div>
              <span className="text-xs text-muted-foreground">Read-only view</span>
            </div>
            <div className="rounded-sm bg-card-alt border border-border h-52 flex items-center justify-center">
              <Skeleton className="h-full w-full bg-muted" />
            </div>
            <div className="mt-3 text-xs text-muted-foreground flex items-center gap-4">
              <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#FD7A48] inline-block"></span>Marked Damage</div>
              <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#3FC56D] inline-block"></span>Previous Damage</div>
            </div>
          </section> */}

          <section className="bg-card/80 border border-border rounded-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <Camera className="size-5 text-primary mr-2" />
                <h3 className="font-medium text-white">Fotos del Vehiculo</h3>
              </div>
              <a className="text-sm text-primary">Ver Todos</a>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {order.photos && order.photos.length > 0 ? (
                order.photos.map((src, i) => (
                  <div key={i} className="min-h-28 w-full aspect-square rounded-md overflow-hidden bg-card-alt">
                    <img src={src} alt={`photo-${i}`} className="h-full w-full object-cover" />
                  </div>
                ))
              ) : (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-28 w-full rounded-md border border-dashed border-border flex items-center justify-center">
                    <Skeleton className="h-full w-full bg-muted" />
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <aside className="flex flex-col gap-6">
          <div className="bg-card/80 border border-border rounded-sm p-4">
            <div className="flex items-center mb-3">
              <PageSearch className="size-5 text-primary mr-2" />
              <h3 className="font-semibold text-lg text-white">Facturación</h3>
            </div>
            <div className="divide-y divide-border">
              {order.items.map((it) => (
                <div key={it.serviceId} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white">{it.name}</div>
                    <div className="text-xs text-muted-foreground">{it.quantity} × S/ {it.price.toFixed(2)}</div>
                  </div>
                  <div className="text-white">S/ {(it.subtotal).toFixed(2)}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 text-sm">
              <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>S/ {order.subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between mt-2 text-xl font-semibold text-foreground"><span className="text-base">Total</span><span className="text-primary">S/ {order.total.toFixed(2)}</span></div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-sm p-4">
            <div className="flex items-center mb-3">
              <ClockRotateRight className="size-5 text-primary mr-2" />
              <h3 className="font-medium text-white">Timeline</h3>
            </div>

            <div className="flex flex-col gap-4">
              {(order.statusHistory || []).map((h, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`mt-1 h-2 w-2 rounded-full ${h.status === 'En Proceso' ? 'bg-status-1' : h.status === 'Lavando' ? 'bg-status-4' : h.status === 'Terminado' ? 'bg-status-2' : h.status === 'Entregado' ? 'bg-status-3' : 'bg-destructive'}`} />
                  <div>
                    <div className="text-sm text-white">{h.status}</div>
                    <div className="text-xs text-muted-foreground">{new Date(h.at).toLocaleString("es-PE")}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-sm p-4">
            <div className="flex items-center mb-2">
              <WarningTriangle className="size-4 text-warning mr-2 text-orange-600" />
              <h3 className="font-medium text-white">Indicaciones del cliente</h3>
            </div>
            <div className="text-sm text-muted-foreground">{order.cancelReason ?? order.notes ?? "No notes"}</div>
          </div>
        </aside>
      </div>
    </div>
  );
}
