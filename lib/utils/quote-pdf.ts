import type { QuoteFormData } from "@/lib/schemas/quote";

type CompanyData = {
  name: string | null;
  ruc: string | null;
  ownerName: string | null;
  address: string | null;
  phone: string | null;
  logoUrl: string | null;
};

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}

function formatCurrency(value: number): string {
  return `S/ ${value.toFixed(2)}`;
}

async function fetchImageAsBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function generateQuotePdf(
  quote: QuoteFormData,
  company: CompanyData
): Promise<void> {
  const { jsPDF } = await import("jspdf");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const margin = 14;
  const pageWidth = 210;
  const contentWidth = pageWidth - margin * 2;
  const [r, g, b] = hexToRgb(quote.colorTheme);
  const pageHeight = 297;

  let y = 0;

  const checkPage = (needed: number) => {
    if (y + needed > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  // ── Header background ──
  const headerH = 38;
  doc.setFillColor(r, g, b);
  doc.rect(0, 0, pageWidth, headerH, "F");

  // Logo
  let logoEndX = margin;
  if (company.logoUrl) {
    const base64 = await fetchImageAsBase64(company.logoUrl);
    if (base64) {
      try {
        doc.addImage(base64, "JPEG", margin, 6, 20, 20);
        logoEndX = margin + 24;
      } catch {
        // Logo failed; continue without it
      }
    }
  }

  // Company name
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(company.name ?? "Mi Empresa", logoEndX + 2, 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  let companyInfoY = 20;
  if (company.ruc) {
    doc.text(`RUC: ${company.ruc}`, logoEndX + 2, companyInfoY);
    companyInfoY += 4.5;
  }
  if (company.ownerName) {
    doc.text(company.ownerName, logoEndX + 2, companyInfoY);
    companyInfoY += 4.5;
  }
  if (company.address) {
    doc.text(company.address, logoEndX + 2, companyInfoY);
    companyInfoY += 4.5;
  }
  if (company.phone) {
    doc.text(company.phone, logoEndX + 2, companyInfoY);
  }

  // Quote title block (right side of header)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text("COTIZACIÓN", pageWidth - margin, 14, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(`N° ${quote.quoteNumber}`, pageWidth - margin, 21, { align: "right" });
  doc.text(`Fecha: ${quote.date}`, pageWidth - margin, 26, { align: "right" });

  y = headerH + 8;

  // ── Client section ──
  doc.setTextColor(r, g, b);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("CLIENTE", margin, y);
  y += 1;

  doc.setDrawColor(r, g, b);
  doc.setLineWidth(0.5);
  doc.line(margin, y, margin + contentWidth, y);
  y += 4;

  doc.setTextColor(60, 60, 60);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  const clientLines: string[] = [];
  if (quote.clientName) clientLines.push(quote.clientName);
  if (quote.clientDocType && quote.clientDocNumber)
    clientLines.push(`${quote.clientDocType}: ${quote.clientDocNumber}`);
  if (quote.clientPhone) clientLines.push(`Tel: ${quote.clientPhone}`);
  if (quote.clientEmail) clientLines.push(quote.clientEmail);
  if (quote.clientAddress) clientLines.push(quote.clientAddress);

  if (clientLines.length === 0) clientLines.push("—");

  for (const line of clientLines) {
    doc.text(line, margin, y);
    y += 5;
  }

  y += 4;

  // ── Items table ──
  const cols = {
    num: margin,
    desc: margin + 8,
    qty: margin + contentWidth * 0.6,
    price: margin + contentWidth * 0.75,
    subtotal: margin + contentWidth,
  };

  // Table header
  checkPage(10);
  doc.setFillColor(r, g, b);
  doc.rect(margin, y - 4, contentWidth, 7, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("#", cols.num + 1, y);
  doc.text("DESCRIPCIÓN", cols.desc, y);
  doc.text("CANT.", cols.qty, y);
  doc.text("P. UNIT.", cols.price, y);
  doc.text("SUBTOTAL", cols.subtotal, y, { align: "right" });
  y += 5;

  // Table rows
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  let rowIndex = 0;
  for (const item of quote.items) {
    const rowSubtotal = item.quantity * item.unitPrice;
    const rowH = 6;
    checkPage(rowH);

    if (rowIndex % 2 === 0) {
      doc.setFillColor(245, 245, 245);
      doc.rect(margin, y - 3.5, contentWidth, rowH, "F");
    }

    doc.setTextColor(60, 60, 60);
    doc.text(String(rowIndex + 1), cols.num + 1, y);

    const descLines = doc.splitTextToSize(item.description, cols.qty - cols.desc - 4);
    doc.text(descLines[0], cols.desc, y);

    doc.text(String(item.quantity), cols.qty, y);
    doc.text(formatCurrency(item.unitPrice), cols.price, y);
    doc.text(formatCurrency(rowSubtotal), cols.subtotal, y, { align: "right" });

    y += rowH;
    rowIndex++;
  }

  doc.setDrawColor(r, g, b);
  doc.setLineWidth(0.3);
  doc.line(margin, y, margin + contentWidth, y);
  y += 6;

  // ── Totals ──
  const totalsX = pageWidth - margin - 70;

  const drawTotalRow = (label: string, value: number, bold = false) => {
    checkPage(6);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text(label, totalsX, y);
    doc.setTextColor(bold ? r : 80, bold ? g : 80, bold ? b : 80);
    doc.text(formatCurrency(value), pageWidth - margin, y, { align: "right" });
    y += 6;
  };

  const subtotal = quote.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const igv = Math.round(subtotal * 0.18 * 100) / 100;
  const total = Math.round((subtotal + igv) * 100) / 100;

  drawTotalRow("Subtotal:", subtotal);
  drawTotalRow("IGV (18%):", igv);

  doc.setDrawColor(r, g, b);
  doc.setLineWidth(0.5);
  doc.line(totalsX, y - 1, pageWidth - margin, y - 1);

  drawTotalRow("TOTAL:", total, true);
  y += 4;

  // ── Footer ──
  if (quote.paymentMethod || quote.notes) {
    checkPage(14);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);

    if (quote.paymentMethod) {
      doc.text(`Forma de pago: ${quote.paymentMethod}`, margin, y);
      y += 5;
    }
    if (quote.notes) {
      const noteLines = doc.splitTextToSize(`Notas: ${quote.notes}`, contentWidth);
      doc.text(noteLines, margin, y);
    }
  }

  doc.save(`cotizacion-${quote.quoteNumber}.pdf`);
}
