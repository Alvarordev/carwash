import type { Order, OrderStatus } from "@/lib/types/order";

type ExportRow = {
  ID: string;
  "Numero Orden": string;
  Estado: string;
  "Estado de Pago": string;
  "Metodo de Pago": string;
  Subtotal: number;
  Descuento: number;
  Total: number;
  Registrado: string;
  Actualizado: string;
  Cliente: string;
  Vehiculo: string;
  Servicios: string;
  Personal: string;
  "Notas del Cliente": string;
  "Razon de Anulacion": string;
  "En Proceso": string;
  Lavando: string;
  Terminado: string;
  Entregado: string;
  Anulado: string;
};

const PDF_PAGE_HEIGHT = 297;
const PDF_MARGIN = 12;
const PDF_LINE_HEIGHT = 4.8;
const PDF_CONTENT_WIDTH = 186;

function formatDateTime(value?: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString("es-PE");
}

function formatDateForFile(now = new Date()) {
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function mapStatusTimes(order: Order) {
  const statuses: OrderStatus[] = [
    "En Proceso",
    "Lavando",
    "Terminado",
    "Entregado",
    "Anulado",
  ];

  const times: Record<OrderStatus, string> = {
    "En Proceso": "",
    Lavando: "",
    Terminado: "",
    Entregado: "",
    Anulado: "",
  };

  const history = [...(order.statusHistory ?? [])].sort(
    (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime()
  );

  for (const status of statuses) {
    const first = history.find((entry) => entry.status === status);
    times[status] = formatDateTime(first?.at);
  }

  return times;
}

function getServices(order: Order) {
  return order.items.map((item) => item.name).join(", ") || "—";
}

function getStaff(order: Order) {
  const normalized = (order.staff ?? []).map((member) =>
    member.role ? `${member.name} (${member.role})` : member.name
  );

  const unique = Array.from(new Set(normalized));
  return unique.join(", ") || "—";
}

function getCustomer(order: Order) {
  if (!order.customer) {
    return "—";
  }

  return `${order.customer.firstName} ${order.customer.lastName}`;
}

function getVehicle(order: Order) {
  if (!order.vehicle) {
    return "—";
  }

  return `${order.vehicle.plate} - ${order.vehicle.brand}${
    order.vehicle.model ? ` ${order.vehicle.model}` : ""
  }`;
}

export async function exportOrdersToPdf(orders: Order[]) {
  const { jsPDF } = await import("jspdf");

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  let y = PDF_MARGIN;

  const writeWrapped = (value: string, bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(9);

    const lines = doc.splitTextToSize(value, PDF_CONTENT_WIDTH);
    const height = lines.length * PDF_LINE_HEIGHT;

    if (y + height > PDF_PAGE_HEIGHT - PDF_MARGIN) {
      doc.addPage();
      y = PDF_MARGIN;
    }

    doc.text(lines, PDF_MARGIN, y);
    y += height + 1;
  };

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Listado de Ordenes", PDF_MARGIN, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Generado: ${new Date().toLocaleString("es-PE")}`, PDF_MARGIN, y);
  y += 3;
  doc.text(`Total de ordenes: ${orders.length}`, PDF_MARGIN, y);
  y += 6;

  for (const order of orders) {
    writeWrapped(`Orden #${order.orderNumber}`, true);
    writeWrapped(`Fecha: ${formatDateTime(order.registeredAt)}`);
    writeWrapped(`Cliente: ${getCustomer(order)}`);
    writeWrapped(`Vehiculo: ${getVehicle(order)}`);
    writeWrapped(`Estado: ${order.status}`);
    writeWrapped(`Total: S/ ${order.total.toFixed(2)}`);
    writeWrapped(`Servicios: ${getServices(order)}`);
    writeWrapped(`Personal: ${getStaff(order)}`);
    writeWrapped(`Metodo de pago: ${order.paymentMethod ?? "—"}`);
    writeWrapped(`Nota del cliente: ${order.notes?.trim() || "—"}`);

    const separatorY = y + 1;
    if (separatorY <= PDF_PAGE_HEIGHT - PDF_MARGIN) {
      doc.setDrawColor(200);
      doc.line(PDF_MARGIN, separatorY, PDF_MARGIN + PDF_CONTENT_WIDTH, separatorY);
      y += 4;
    }
  }

  doc.save(`ordenes-resumen-${formatDateForFile()}.pdf`);
}

export async function exportOrdersToXlsx(orders: Order[]) {
  const XLSX = await import("xlsx");

  const rows: ExportRow[] = orders.map((order) => {
    const statusTimes = mapStatusTimes(order);

    return {
      ID: String(order.id),
      "Numero Orden": order.orderNumber,
      Estado: order.status,
      "Estado de Pago": order.paymentStatus ?? "",
      "Metodo de Pago": order.paymentMethod ?? "",
      Subtotal: order.subtotal,
      Descuento: order.discounts ?? 0,
      Total: order.total,
      Registrado: formatDateTime(order.registeredAt),
      Actualizado: formatDateTime(order.updatedAt),
      Cliente: getCustomer(order),
      Vehiculo: getVehicle(order),
      Servicios: getServices(order),
      Personal: getStaff(order),
      "Notas del Cliente": order.notes?.trim() ?? "",
      "Razon de Anulacion": order.cancelReason ?? "",
      "En Proceso": statusTimes["En Proceso"],
      Lavando: statusTimes.Lavando,
      Terminado: statusTimes.Terminado,
      Entregado: statusTimes.Entregado,
      Anulado: statusTimes.Anulado,
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet["!cols"] = [
    { wch: 14 },
    { wch: 16 },
    { wch: 14 },
    { wch: 16 },
    { wch: 18 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 22 },
    { wch: 22 },
    { wch: 24 },
    { wch: 28 },
    { wch: 32 },
    { wch: 30 },
    { wch: 32 },
    { wch: 24 },
    { wch: 22 },
    { wch: 22 },
    { wch: 22 },
    { wch: 22 },
    { wch: 22 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Ordenes");
  XLSX.writeFile(workbook, `ordenes-detalle-${formatDateForFile()}.xlsx`);
}
