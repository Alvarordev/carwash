import type { QuoteFormData } from "@/lib/schemas/quote";
import { shouldShowSimpleTable, calculateQuoteTotals, formatQuoteDate } from "@/lib/utils/quote-helpers";

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}

function formatCurrency(value: number): string {
  return `S/. ${value.toFixed(2)}`;
}

export async function generateQuotePdf(quote: QuoteFormData): Promise<void> {
  const { jsPDF } = await import("jspdf");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const margin = 20;
  const pageWidth = 210;
  const pageHeight = 297;
  const contentWidth = pageWidth - margin * 2;
  const [r, g, b] = hexToRgb(quote.colorTheme);

  let y = 0;

  const checkPage = (needed: number) => {
    if (y + needed > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  // ── Decorative triangle — top-right ──
  doc.setFillColor(r, g, b);
  doc.triangle(pageWidth - 60, 0, pageWidth, 0, pageWidth, 40, "F");

  // ── Quote number + date (left) ──
  y = 22;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(90, 90, 90);
  doc.text(`N°. ${quote.quoteNumber}`, margin, y);
  y += 5;
  const formattedDate = quote.date ? formatQuoteDate(quote.date) : "—";
  doc.text(formattedDate, margin, y);

  // ── COTIZACIÓN title (right) ──
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(30, 30, 30);
  doc.text("COTIZACIÓN", pageWidth - margin, 26, { align: "right" });

  y = 36;

  // ── Horizontal separator ──
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // ── Two-column info: company (left) + client (right) ──
  const colW = contentWidth / 2 - 4;
  const rightColX = margin + contentWidth / 2 + 4;

  // Company column
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text("COTIZACIÓN", margin, y);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(r, g, b);
  doc.text(
    doc.splitTextToSize(quote.companyName || "Mi Empresa", colW)[0] ?? "Mi Empresa",
    margin,
    y + 5
  );

  let compY = y + 11;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(60, 60, 60);
  if (quote.companyOwnerName) {
    doc.text(quote.companyOwnerName, margin, compY);
    compY += 4.5;
  }
  if (quote.companyRuc) {
    doc.text(`RUC : ${quote.companyRuc}`, margin, compY);
    compY += 4.5;
  }
  if (quote.companyAddress) {
    const lines = doc.splitTextToSize(quote.companyAddress, colW);
    doc.text(lines[0] ?? "", margin, compY);
    compY += 4.5;
  }

  // Client column
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text("CLIENTE", rightColX, y);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(r, g, b);
  doc.text(
    doc.splitTextToSize(quote.clientName || "—", colW)[0] ?? "—",
    rightColX,
    y + 5
  );

  let clientY = y + 11;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(60, 60, 60);
  if (quote.clientDocType && quote.clientDocNumber) {
    doc.text(`${quote.clientDocType} : ${quote.clientDocNumber}`, rightColX, clientY);
    clientY += 4.5;
  }
  if (quote.clientPhone) {
    doc.text(`ATENCION : ${quote.clientPhone}`, rightColX, clientY);
    clientY += 4.5;
  }
  if (quote.clientEmail) {
    doc.setTextColor(r, g, b);
    doc.text(`REFERENCIA : ${quote.clientEmail}`, rightColX, clientY);
    doc.setTextColor(60, 60, 60);
    clientY += 4.5;
  }

  y = Math.max(compY, clientY) + 8;

  // ── Items table ──
  const simple = shouldShowSimpleTable(quote.items);

  const colDesc = margin;
  const colCant = margin + contentWidth * 0.6;
  const colPrice = margin + contentWidth * 0.78;
  const colRight = margin + contentWidth;

  const headerH = 7;
  checkPage(headerH + 6);

  // Header background
  doc.setFillColor(r, g, b);
  doc.roundedRect(margin, y, contentWidth, headerH, 1, 1, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text("Descripción", colDesc + 3, y + 4.8);
  if (!simple) {
    doc.text("Cant.", colCant, y + 4.8, { align: "center" });
    doc.text("P. Unit.", colPrice, y + 4.8, { align: "right" });
  }
  doc.text(simple ? "Precio" : "Subtotal", colRight, y + 4.8, { align: "right" });

  y += headerH;

  // Rows
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);

  const descWidth = simple ? contentWidth - 30 : colCant - colDesc - 6;

  for (const item of quote.items) {
    const qty = Number(item.quantity);
    const price = Number(item.unitPrice);
    const rowSubtotal = qty * price;
    const descLines = doc.splitTextToSize(item.description || "—", descWidth);
    const rowH = Math.max(6, descLines.length * 4.5 + 2);

    checkPage(rowH + 2);

    doc.setTextColor(60, 60, 60);
    doc.text(descLines, colDesc + 3, y + 4);

    if (!simple) {
      doc.text(String(qty), colCant, y + 4, { align: "center" });
      doc.text(formatCurrency(price), colPrice, y + 4, { align: "right" });
    }
    doc.text(formatCurrency(simple ? price : rowSubtotal), colRight, y + 4, { align: "right" });

    y += rowH;

    // Row separator
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.2);
    doc.line(margin, y, pageWidth - margin, y);
  }

  y += 8;

  // ── Totals ──
  const { subtotal, igv, total } = calculateQuoteTotals(quote.items);
  const totalsBoxW = 70;
  const totalsBoxX = pageWidth - margin - totalsBoxW;
  const totalsBoxH = 22;

  checkPage(totalsBoxH + 4);

  doc.setFillColor(243, 243, 243);
  doc.roundedRect(totalsBoxX, y, totalsBoxW, totalsBoxH, 1, 1, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(90, 90, 90);
  doc.text("Subtotal", totalsBoxX + 4, y + 5.5);
  doc.text(formatCurrency(subtotal), pageWidth - margin - 2, y + 5.5, { align: "right" });

  doc.text("IGV", totalsBoxX + 4, y + 12);
  doc.text(formatCurrency(igv), pageWidth - margin - 2, y + 12, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(30, 30, 30);
  doc.text("TOTAL", totalsBoxX + 4, y + 19);
  doc.text(formatCurrency(total), pageWidth - margin - 2, y + 19, { align: "right" });

  y += totalsBoxH + 10;

  // ── Payment method ──
  if (quote.paymentMethod) {
    checkPage(14);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(30, 30, 30);
    doc.text("METODO DE PAGO", margin, y);
    y += 5;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.text(quote.paymentMethod, margin, y);
    y += 7;
  }

  // ── Notes ──
  if (quote.notes) {
    checkPage(12);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(30, 30, 30);
    doc.text("NOTAS", margin, y);
    y += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    const noteLines = doc.splitTextToSize(quote.notes, contentWidth);
    doc.text(noteLines, margin, y);
  }

  // ── Decorative triangle — bottom-left ──
  doc.setFillColor(r, g, b);
  doc.triangle(0, pageHeight - 30, 0, pageHeight, 50, pageHeight, "F");

  doc.save(`cotizacion-${quote.quoteNumber}.pdf`);
}
